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


from flask import json
from config import *


# -------------------------------------------------------
# Creates the SQL node text information based on a folder of subfolders of JSON
#
# Requires access to a JSON file of canonical text, typically 
# 'id-best-str-map.json' and access to a folder of subfolders of JSON
# The location of both is specified in 'config.py' as 
# OID_NAME_MAP and IMPORT_DATA_PATH, respectively
# -------------------------------------------------------

# -------------------------------------------------------
# Node text information is of the form:
# oid, text, type, canonical
#
# where: 
#
# oid:              the standard ontology ID, eg. taxonomy:9606
# text:             the possible text for that ID, eg. patients
# type:             the type of the node, eg. Species
# canonical:        whether this particular possible text is the one to prioritise in all UI, eg. false
# -------------------------------------------------------

def aggregateNodeText(nodetext_list, nodetext_node_oid, nodetext_text, nodetext_node_type):

    # Check to see whether the node text already exists in list
    # If it does, increment the counter
    # If not, create a new element in the node text list

    nodetext_text = nodetext_text.strip()

    nodetext_found = False

    if nodetext_node_oid in nodetext_list:                
        if (nodetext_text in nodetext_list[nodetext_node_oid]['text_equivalents_index']):
                nodetext_found = True
                equivalents_index_position = nodetext_list[nodetext_node_oid]['text_equivalents_index'][nodetext_text]
                nodetext_list[nodetext_node_oid]['text_equivalents'][equivalents_index_position]['count'] += 1
    else:   
        nodetext_list[nodetext_node_oid] = {"type": nodetext_node_type, "text_equivalents": [], "text_equivalents_index": {}}        

    if (nodetext_found is False):
        nodetext_list[nodetext_node_oid]['text_equivalents'].append({"text": nodetext_text, "count": 1, "canonical": False})
        nodetext_list[nodetext_node_oid]['text_equivalents_index'][nodetext_text] = len(nodetext_list[nodetext_node_oid]['text_equivalents']) - 1 

def readFile(filePath, nodetext_list):
    try:
        with open(filePath,'r') as f:
            annotations = ujson.loads(f.read())
    except :
        logging.error("Exception caught: failed to read file %s" %filePath, exc_info=True)
        return
    for annotation in annotations:
        if annotation["type"] == "Span":
            if "id" not in annotation["body"]: continue
            nodetext_node_oid = annotation["body"]["id"]
            nodetext_text = annotation['text']
            nodetext_node_type = annotation["body"]["type"]

            aggregateNodeText(nodetext_list, nodetext_node_oid, nodetext_text, nodetext_node_type)

def generateNodeCSV(nodetext_list, CSV_PATH="./"):

    print "Generating CSV for %d nodes " % len(nodetext_list)

    with open(os.path.join(CSV_PATH,"nodetext.vtejas.csv"), 'wb') as csvfile:

        wr = csv.writer(csvfile,quoting=csv.QUOTE_MINIMAL)
        wr.writerow(['oid', 'text', 'type', 'count', 'canonical'])

        for nodetext_node_oid in nodetext_list:

            nodetext_node_type = nodetext_list[nodetext_node_oid]['type']

            for nodetext in nodetext_list[nodetext_node_oid]['text_equivalents']:

                wr.writerow([nodetext_node_oid, nodetext['text'], nodetext_node_type, nodetext['count'], int(nodetext['canonical'] is True)])


def markCanonicalText(nodetext_list, nameMap):

    # Mark the 'canonical' field for all node text where possible
    # This relies upon an external JSON lookup file although
    # the function can/will fallback on its own algorithm

    print "Setting canonical text for %d nodes " % len(nodetext_list)

    use_fallback_algorithm = True

    for node_oid in nodetext_list:

        canonical_text_set = False
        found_in_lookup = True
        canonical_text = ''

        if (node_oid in nameMap):

            # We have found canonical text in lookup

            canonical_text = nameMap[node_oid].strip()

            # We sort text equivalents alphabetically first so  
            # system picks up the first 'least uppercased' version
            # Note use of the  (x['text'].lower(), x['text'][0].isupper()) 
            # clause to ensure the 'least uppercased' version appears first
            # otherwise equivalents with first letter capitals may be selected

            nodetext_list[node_oid]["text_equivalents"] = sorted(nodetext_list[node_oid]["text_equivalents"], key = lambda x : (x['text'].lower(), x['text'][0].isupper()))  
            
            #TEJAS: this is never used - commented out so I can turn text_equivalents_index into a dict
            #nodetext_list[node_oid]["text_equivalents_index"] = sorted(nodetext_list[node_oid]["text_equivalents_index"], key = lambda x : (x.lower(), x[0].isupper()))  

            # Iterate through all text equivalents until we find one matching precisely canonical text (after stripping whitespace)

            for nodetext_instance in nodetext_list[node_oid]['text_equivalents']:

                if (nodetext_instance['text'] == canonical_text):

                    nodetext_instance['canonical'] = True
                    canonical_text_set = True

                    # Once we have set the canonical text, move onto next node_oid

                    break

        else:

            print "%s not in nameMap, using default algorithm instead" %node_oid
            found_in_lookup = False

        # If we couldn't set canonical text using JSON lookup file
        # then attempt to set it using fallback algorithm

        if ((canonical_text_set is False) and (use_fallback_algorithm is True)):

            if (found_in_lookup is True):

                print "%s canonical '%s' but no equivalent [**SERIOUS**]" % (node_oid,  canonical_text)

            # The text equivalents are sorted as follows:
            # Sort by descending count (number of mentions) first
            # Sort by lowercase version of text second

            nodetext_list[node_oid]["text_equivalents"] = sorted(sorted(nodetext_list[node_oid]["text_equivalents"], key = lambda x : (x['text'].lower(), x['text'][0].isupper())), key = lambda x : x['count'], reverse = True)  
            nodetext_list[node_oid]["text_equivalents"][0]['canonical'] = True



def start():
    print "starting converter"
    nodetext_list = {}

    if not os.path.exists(config.OID_NAME_MAP):
        raise BaseException ("config.OID_NAME_MAP (%s) does not exisit" % config.OID_NAME_MAP)

    dirs = os.listdir(config.IMPORT_DATA_PATH)
    numOfDir = len(dirs)
    print str(len(dirs))
    increment = 100
    dcount=0
    for dir in dirs:

        for root, subdirs, files in os.walk(os.path.join(config.IMPORT_DATA_PATH,dir)):
            files = [file for file in files if file.endswith("jsonld")]
            noFiles = len(files)
            fcount = 0
            for file in files:
                readFile(os.path.join(root, file),nodetext_list)

                fcount+=1
                if (fcount % increment == 0) or fcount == noFiles:
                    sys.stdout.write("%s : %d/%d (%%%3.1f)\r" % (dir, fcount,noFiles, round(100.0 * float(fcount) / float(noFiles), 1)))
                    sys.stdout.flush()
        dcount +=1
        sys.stdout.write( "DONE %s: progress %d/%d (%%%3.1f)\n" %(dir, dcount,numOfDir , round(100.0*float(dcount)/float(numOfDir),1)))
        sys.stdout.flush()

    nameMap = ujson.loads(open(config.OID_NAME_MAP).read())
    markCanonicalText(nodetext_list, nameMap)
    # print json.dumps(nodetext_list, sort_keys = False, indent = 4, separators=(',', ': '))
    generateNodeCSV(nodetext_list)

start()
