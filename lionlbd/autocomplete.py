from __future__ import print_function
from __future__ import absolute_import

from logging import debug

from flask import request, render_template, json, Response

from config import *
from lionlbd.common import get_query_terms
from lionlbd.entitydb import get_semantic_equivalents_as_list
from lionlbd.entitydb import remove_text_between_parens

from lionlbd import app

import string
import logging
import traceback
import psycopg2

import re

@app.route("/get_terms/")
def get_terms():

    search_term = request.args.get("terms")

    # Remove whitespace

    search_term = search_term.strip()

    # Connect to database
	
    try:
        db = psycopg2.connect(dbname = SQL_DATABASE, user = SQL_USERNAME, password = SQL_PASSWORD)

        # Run query on nodetext table to retrieve nodes beginning with 'search_term'
        # Note: wildcard only on right-hand side

        # sql = '''SELECT t.oid, t.text, t.type, t.count FROM nodetext AS t WHERE t.text ILIKE %s ORDER BY t.count DESC LIMIT 40'''       
        sql = '''SELECT t.oid, t.text, t.type, t.count, e.equivalents FROM nodetext_optimized AS t, nodetext_equivalents AS e where t.prefix_1 = %s AND t.text ILIKE %s AND t.oid = e.oid ORDER BY t.canonical DESC, length(t.text),t.id LIMIT 40;'''

        cursor = db.cursor()
        cursor.execute(sql, (search_term[:3].lower(), search_term + "%", ))

        # Build python array by iterating through database results

        search_results = []
        #search_results_normalized = []
        #search_oids = []
        search_equivalents = {}
        numrows = cursor.rowcount
        for x in xrange(0, numrows):
            row = cursor.fetchone()
            #TEJAS: changing this to just one result per id now, to fix issue #41
            #normalized_id = row[0] + "_" + row[1].lower().translate(None, string.punctuation)
            normalized_id = row[0]
            if ( not search_equivalents.has_key(row[0]) ): #normalized_id not in search_results_normalized):

                equivalents = re.split(r',\s*(?![^()]*\))', remove_text_between_parens( row[4]) )[:10]

                search_results.append({'id':row[0], 'name':row[1], 'label':row[2], 'count': row[3],
                        'equivalents':
                            ', '.join( [a for a in equivalents if a !=  row[1]]          )  })
                #search_results_normalized.append(normalized_id)
                #search_oids.append("'" + row[0] + "'")
                search_equivalents[row[0]] = ''

        if len(search_results) > 0:
            max_count = max([ a['count'] for a in search_results])
            search_results = [a for a in search_results if a['count']*1.0 > 0.05*max_count ]



        # Close database

        # Get text equivalents for each returned node as efficiently as possible
        # To retrieve a single record for each unique oid we use 'canonical = 1'
        # which should only ever have one record set to '1' per oid
        # Faster to do it this way, once we have our final list of OIDs

        # sql = '''
        # SELECT t.oid, e4.equivalents FROM nodetext AS t
        # JOIN LATERAL
        # (
        #     SELECT COALESCE(string_agg(e3.text, ', '), '') AS equivalents FROM 
        #     (
        #         SELECT DISTINCT ON (LOWER(e2.text)) e2.text FROM 
        #         (
        #             SELECT e1.text FROM nodetext AS e1 WHERE e1.oid = t.oid ORDER BY e1.count DESC LIMIT 50  
        #         ) AS e2
        #     ) AS e3
        # ) AS e4 ON true
        # WHERE t.oid IN (''' + ",".join(search_oids) + ''') 
        # AND t.canonical = 1'''

        # cursor.execute(sql)

        # numrows = cursor.rowcount        
        # for x in xrange(0, numrows):
        #     row = cursor.fetchone()
        #     search_equivalents[row[0]] = row[1]

        db.close()	

        # Having retrieved text equivalents, attach them to relevant search results

        # for idx in range(len(search_results)):
        #     # search_results[idx]['equivalents'] = get_semantic_equivalents_as_list(search_results[idx]['id'], search_results[idx]['name'])
        #     search_results[idx]['equivalents'] = search_equivalents[search_results[idx]['id']]
		
    	# Build json string from array
	
        search_results_json = json.dumps(search_results)	
	
    	# Dump results for testing
	
        logging.info(search_results_json)
	
    	# Output json string
	
        resp = Response(response = search_results_json,
                    status=200, \
                    mimetype="application/json")
        return (resp)
		
    except psycopg2.Error as e:
        logging.error("I am unable to connect to the database")
        logging.error(e)
        logging.error(e.pgcode)
        logging.error(e.pgerror)
        logging.error(traceback.format_exc())		
        resp = Response(response = "{}",
                    status=301, \
                    mimetype="application/json")
        return (resp)	
