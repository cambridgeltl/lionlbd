from __future__ import print_function
from __future__ import absolute_import

import logging

from flask import abort, jsonify, Response

from lionlbd.common import get_offset_and_limit, get_expand
from lionlbd.mentiondb import get_documents, get_document
from lionlbd.mentiondb import get_document_annotations
from lionlbd.mentiondb import get_entity_mentions, get_relation_instances
from lionlbd.mentiondb import get_entity
from lionlbd.mentiondb import expand_references
from lionlbd import app


@app.route('/documents/')
def show_documents():
    offset, limit = get_offset_and_limit()
    return jsonify(get_documents(offset, limit))


@app.route('/documents/<id_>')
def show_document(id_):
    try:
        document = get_document(id_)
    except KeyError:
        abort(404)
    return jsonify(document)


@app.route('/documents/<id_>/text')
def show_document_text(id_):
    try:
        document = get_document(id_)
    except KeyError:
        abort(404)
    return Response(document['text'], mimetype='text/plain')


@app.route('/documents/<id_>/annotations/')
def show_document_annotations(id_):
    return jsonify(get_document_annotations(id_))


@app.route('/entities/<id_>')
def show_entity(id_):
    try:
        entity = get_entity(id_)
    except KeyError:
        abort(404)
    return jsonify(entity)


@app.route('/entities/<id_>/mentions/')
def show_entity_mentions(id_):
    offset, limit = get_offset_and_limit()
    return jsonify(get_entity_mentions(id_, offset, limit))


@app.route('/relations/<id1>/to/<id2>/')
def show_relation_instances(id1, id2):
    offset, limit = get_offset_and_limit()
    expand = get_expand()
    data = get_relation_instances(id1, id2, offset, limit)
    if expand:
        data = expand_references(data)
    return jsonify(data)
