import csv
import os
import ujson
import logging
import traceback
from collections import defaultdict
from random import randint
import collections
import sys
import math
import config
import operator
import psycopg2
from py2neo import authenticate, Graph


from flask import json
from config import *

# Username to connect to SQL database
SQL_USERNAME = ''

# Password to connect to SQL database
SQL_PASSWORD = ''

# Database to connect to on SQL database
SQL_DATABASE = ''

# -------------------------------------------------------
# Update the 'count' field for Hallmarks in Postgres 'nodetext' using Neo4j
# -------------------------------------------------------

def getHallmarkCounts():
    NEO4J_USERNAME = ''
    NEO4J_PASSWORD = ''
    authenticate("", NEO4J_USERNAME, NEO4J_PASSWORD)
    graph = Graph()
    stmt = "Match (n) WHERE n.type = 'Hallmark' RETURN n.OID AS oid, n.count AS count"       
    result = graph.data(stmt)

    return result

def updateDBWithHallmarkCounts(hallmark_counts):

    try:
        #db = psycopg2.connect(dbname = SQL_DATABASE, user = SQL_USERNAME, password = SQL_PASSWORD)
        #using peer authentication
	db = psycopg2.connect(dbname = SQL_DATABASE)

        cursor = db.cursor()        

        for hallmark_count in hallmark_counts:
            cursor.execute('''UPDATE nodetext SET count = {0} WHERE oid = '{1}' '''.format(hallmark_count['count'][-1], hallmark_count['oid']))
    
        db.commit()
        db.close()  

        
    except psycopg2.Error as e:
        logging.error("I am unable to connect to the database")
        logging.error(e)
        logging.error(e.pgcode)
        logging.error(e.pgerror)
        logging.error(traceback.format_exc())       

def start():
    print "Started..."

    hallmark_counts = getHallmarkCounts()

    print "Hallmark counts retrieved"

    updateDBWithHallmarkCounts(hallmark_counts)

    print "Database updated with hallmark counts from Neo4j"
start()
