from __future__ import print_function
from __future__ import absolute_import

import json
import logging

from flask import jsonify, render_template

from lionlbd.common import get_offset_and_limit
from lionlbd.entitydb import get_entity, get_entities
from lionlbd import app


@app.route('/entityinfo/')
def get_entity_infos():
    offset, limit = get_offset_and_limit()
    return jsonify(get_entities(offset, limit))


@app.route('/entityinfo/<id_>')
def get_entity_info(id_):
    return jsonify(get_entity(id_))
