from __future__ import print_function
from __future__ import absolute_import

from logging import debug

from flask import request, render_template, json, Response

from config import *
from lionlbd import app

import os
import time, datetime
import string
import logging
import traceback
import psycopg2

@app.route("/client-error/",  methods=['POST'])
def client_error():
    full_path = os.path.realpath(__file__)
    outputfolder = os.path.dirname(full_path) + "/../bugs/"

    userid = request.form['userid']
    context = request.form['context']
    details = request.form['details']
    extras = request.form['extras']

    error_fields = {'userid': userid, 'context': context, 'details': details, 'extras': extras}
    error_fields_dump = json.dumps(error_fields)

    format = '%Y%m%d_%H%M%S'  
    unix_epoch = time.time()          
    ts = datetime.datetime.fromtimestamp(unix_epoch)

    text_file_name = outputfolder + "ERROR_" + ts.strftime(format) + ".txt"
    text_file = open(text_file_name, "w")
    text_file.write(error_fields_dump)
    text_file.close()

    resp = Response(response = json.dumps([]),status=200, mimetype="application/json")
    return (resp)




@app.route("/feedback/",  methods=['POST'])
def client_feedback():
    full_path = os.path.realpath(__file__)
    outputfolder = os.path.dirname(full_path) + "/../feedback/"

    name = request.form['feedbackformname']
    email = request.form['feedbackformemail']
    feedback = request.form['feedbackformfeedback']

    fb_fields = {'name': name, 'email': email, 'feedback':feedback}
    fb_fields_dump = json.dumps(fb_fields)

    format = '%Y%m%d_%H%M%S'  
    unix_epoch = time.time()          
    ts = datetime.datetime.fromtimestamp(unix_epoch)

    text_file_name = outputfolder + "FEEDBACK_"+ \
                        email.replace('@','_').replace('.','_')  + "_" + ts.strftime(format) + ".txt"
    text_file = open(text_file_name, "w")
    text_file.write(fb_fields_dump)
    text_file.close()

    resp = Response(response = json.dumps([]),status=200, mimetype="application/json")
    return (resp)





