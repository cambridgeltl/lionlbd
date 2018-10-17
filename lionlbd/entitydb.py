from __future__ import print_function
from __future__ import absolute_import

import json
import psycopg2

from logging import exception

from config import *
from config import ENTITY_DB_CREDENTIALS as EDB
from lionlbd.sqldb import execute_sql, row_to_dict, rows_to_dicts

import re

def remove_text_between_parens(text):
    n = 1  # run at least once
    while n:
        text, n = re.subn(r'\([^()]*\)', '', text)  # remove non-nested/flat balanced parts
    return text


def get_semantic_equivalents_as_list(oid, exclude_text):

    try:
        db = psycopg2.connect(dbname = SQL_DATABASE, user = SQL_USERNAME, password = SQL_PASSWORD)
#         sql = '''
# SELECT COALESCE(string_agg(t3.text, ', '), '') FROM 
# (
#     SELECT DISTINCT ON (LOWER(t2.text)) t2.text FROM 
#     (
#         SELECT text FROM node_text AS t WHERE t.oid = %s AND LOWER(t.text) <> LOWER(%s) ORDER BY t.text 
#     ) AS t2
# ) AS t3 '''	
        #sql = '''
        #SELECT COALESCE(string_agg(t3.text, ', '), '') FROM 
        #(
        #    SELECT DISTINCT ON (LOWER(t2.text)) t2.text FROM 
        #    (
        #        SELECT text FROM nodetext AS t WHERE t.oid = %s AND LOWER(t.text) <> LOWER(%s) ORDER BY t.count DESC LIMIT 50  
        #    ) AS t2
        #) AS t3 '''

        sql = '''
            SELECT COALESCE(string_agg(e3.text, ', '), '') AS equivalents FROM 
            (
		SELECT e2_5.text FROM (
            SELECT DISTINCT ON (LOWER(e2.text)) e2.text, e2.count FROM
			( SELECT e1.text, e1.count FROM nodetext AS e1 WHERE e1.oid = %s AND LOWER(e1.text) <> LOWER(%s)
              ORDER BY e1.count DESC LIMIT 50 ) AS e2
		ORDER BY LOWER(e2.text),e2.count DESC ) AS e2_5
		ORDER BY e2_5.count DESC
            ) AS e3
        '''
        cursor = db.cursor()
        cursor.execute(sql, (oid, exclude_text))
        row = cursor.fetchone()
        equivalents_list = ', '.join( re.split(r',\s*(?![^()]*\))', remove_text_between_parens( row[0] ) )[:10] )
        db.close()			
        return (equivalents_list)
		
    except psycopg2.Error as e:
        exception('Unable to connect to the database')
        return ''


def get_entities(offset=0, limit=100):
    sql = '''
SELECT * FROM entities
OFFSET %s LIMIT %s'''
    if limit > 10000:    # TODO avoid magic number
        raise ValueError('query limit {} too high'.format(limit))
    cursor = execute_sql(sql, (offset, limit), **EDB)
    rows = cursor.fetchall()
    return rows_to_dicts(rows, cursor)


def get_entity(id_):
    sql = '''
SELECT * FROM entities
WHERE id = %s'''
    cursor = execute_sql(sql, (id_, ), **EDB)
    if cursor.rowcount == 0:
        raise KeyError
    assert cursor.rowcount == 1    # id is primary key
    return row_to_dict(cursor.fetchone(), cursor)
