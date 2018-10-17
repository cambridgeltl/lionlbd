from __future__ import print_function
from __future__ import absolute_import

import logging
import psycopg2

from config import *
from itertools import izip
from logging import info, debug
from flask import render_template, request, make_response, jsonify

from lionlbd.config import RESULTS_PER_PAGE_NODE

from lionlbd.common import get_existing_nodes, get_query_terms_src_dest
from lionlbd.common import get_edge_metric, get_aggregation_func
from lionlbd.common import get_filter_type, get_node_offset_and_limit
from lionlbd.common import get_year, get_range_weight, get_discovery_mode
from lionlbd.common import get_history
from lionlbd.common import uniq

from lionlbd.entitydb import get_semantic_equivalents_as_list
from lionlbd import app

import lionlbd.mdbviews    # views to mention-level DB
import lionlbd.edbviews    # views to entity-level DB

import uuid

@app.route('/')
@app.route('/index')
def index():
    query_terms = get_query_terms_src_dest()
    src_oid = query_terms[0] if query_terms[0] is not None else ''
    dest_oid = query_terms[1] if query_terms[0] is not None else ''
    resp = make_response(render_template('index.html', src_oid=src_oid, dest_oid=dest_oid))
    if request.cookies.get('uss', None) is None or request.cookies.get('uss', None) == "":
	resp.set_cookie('uss', str(uuid.uuid4()))
    return resp

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/help')
def help():
    return render_template('help.html')

@app.route('/downloads')
def downloads():
    return render_template('downloads.html')



@app.route('/get_db_metadata/')
def get_db_metadata():
    from .graphdb import graph
    meta_info = graph.meta_information()
    metric_info = graph.get_metric_information()
    aggfn_info  = graph.get_aggregation_function_information()
    year_info = graph.get_year_range()
    defaults_info = {'edge_metric':'jaccard', 'aggregation_function': 'min' }
    output = {'meta_info': meta_info, 'metric_info': metric_info,
              'aggregation_function_info': aggfn_info,
              'defaults_info': defaults_info,
              'year_info': year_info}
    return jsonify(output)


@app.route('/get_text_from_oid/<node_oid>')
def get_text_from_oid(node_oid):
    try:
        # Connect to database
        db = psycopg2.connect(dbname=SQL_DATABASE, user=SQL_USERNAME,
                              password=SQL_PASSWORD)

        # Run query on node_text table to retrieve node text for particular OID
        # We select the value with the highest canonical then count score

        cursor = db.cursor()
        cursor.execute('SELECT text FROM nodetext WHERE oid = %s ORDER BY canonical DESC, count DESC', (node_oid, ))

        if cursor.rowcount != 0:
            row = cursor.fetchone()
            node_text = row[0]
        else:
            node_text = ''

        db.close()    # Close database

        return jsonify({'text': node_text})

    except psycopg2.Error as e:
        logging.exception('Unable to connect to the database')
        return jsonify({ 'text': 'DB-ERROR'})


def convert_node_for_output(node):
    equivalents = get_semantic_equivalents_as_list(node['id'], node['text'])
    return {
        'id': node['id'],
        'type': node['type'],
        'name': node['text'],
        'fullname': node['text'],    # TODO eliminate redundancy
        'count': node['count'],
        'doc_count': node['doc_count'],
        'edgecount': node['edge_count'],
        'equivalents': equivalents,
        'sort': node.get('sort', 'B'),    # TODO don't fill if missing
    }


def convert_edge_for_output(edge):
    edge['source'] = edge.pop('start')
    edge['target'] = edge.pop('end')
    edge['count'] = edge.get('count', -1.0)    # TODO
    edge['doc_count'] = edge.get('doc_count', -1.0)    # TODO
    return edge


def convert_graph_for_output(nodes, edges):
    result = {
        'nodes': [convert_node_for_output(n) for n in nodes],
        'edges': [convert_edge_for_output(e) for e in edges],
    }
    try:
        # keep first node first (required for layout at the moment)
        result['nodes'] = [result['nodes'][0]] + sorted(
            result['nodes'][1:], key=lambda n: n['count'], reverse=True)
    except:
        pass
    try:
        result['edges'].sort(key=lambda e: e['count'], reverse=True)
    except:
        pass
    return result


@app.route('/add_node/<node_oid>')
def add_node(node_oid):
    from .graphdb import graph
    from lionlbd.lbdinterface import LbdFilters

    types = get_filter_type()
    metric = get_edge_metric()
    year = get_year()
    min_weight, max_weight = get_range_weight()
    history = get_history()

    filters = LbdFilters(b_types=types, min_weight=min_weight,
                         max_weight=max_weight)

    nodes = graph.get_nodes(
        [node_oid],
        metric=metric,
        year=year,
        filters=filters,
        history=history)

    # Get IDs of existing nodes
    existing_node_ids = get_existing_nodes()

    # Add edges between the intervening nodes
    edges = graph.subgraph_edges(
        [node_oid] + existing_node_ids,
        metrics=uniq([metric] + ['count', 'doc_count']),
        year=year,
        filters=filters,
        exclude=existing_node_ids,
        history=history)

    result = convert_graph_for_output(nodes, edges)
    return jsonify(result)


@app.route('/closed_discovery/<a_id>/<c_id>')
def closed_discovery(a_id, c_id):
    from .graphdb import graph
    from lionlbd.lbdinterface import LbdFilters

    types = get_filter_type()
    metric = get_edge_metric()
    agg_func = get_aggregation_func()
    year = get_year()
    min_weight, max_weight = get_range_weight()
    history = get_history()

    logging.debug('range weight: {}'.format(get_range_weight()))

    agg_func = 'min' if agg_func is None else agg_func

    filters = LbdFilters(b_types=types, min_weight=min_weight,
                         max_weight=max_weight)

    b_ids, b_scores = graph.closed_discovery(
        a_id, c_id,
        metric=metric,
        agg_func=agg_func,
        year=year,
        filters=filters,
        limit=RESULTS_PER_PAGE_NODE)

    # Get node data
    nodes = graph.get_nodes(
        [a_id, c_id] + b_ids,
        metric=metric,
        year=year,
        filters=filters,
        history=history)

    # Add "sort" attribute for client layout (TODO: move to client code)
    sort_dict = { a_id: 'A', c_id: 'C' }
    for n in nodes:
        n['sort'] = sort_dict.get(n['id'], 'B')

    # Get edges between a_id/c_id and connecting "B" nodes
    edges = graph.subgraph_edges(
        [a_id, c_id] + b_ids,
        metrics=uniq([metric] + ['count', 'doc_count']),
        year=year,
        filters=filters,
        history=history)
    logging.debug('EDGES: {}'.format(edges))

    result = convert_graph_for_output(nodes, edges)
    return jsonify(result)


def get_unique_edges(edges_list):
    """Get unique list of edges avoiding duplicates."""

    edges_id = []
    new_edges = []

    # Iterate through list building unique index and checking against it

    for edge in edges_list:
        edge_id = edge['start'] + '_' + edge['end']
        if (edge_id not in edges_id):
            edges_id.append(edge_id)
            new_edges.append(edge)
        else:
            logging.error('duplicate edge {}'.format(edge_id))
    return new_edges


@app.route('/open_discovery/<a_id>')
def open_discovery(a_id):
    from .graphdb import graph
    from lionlbd.lbdinterface import LbdFilters

    types = get_filter_type()
    year = get_year()
    metric = get_edge_metric()
    agg_func = get_aggregation_func()
    min_weight, max_weight = get_range_weight()
    offset, limit = get_node_offset_and_limit()
    history = get_history()

    agg_func = 'min' if agg_func is None else agg_func

    filters = LbdFilters(b_types=types, c_types=types, min_weight=min_weight,
                         max_weight=max_weight)

    c_ids, c_scores = graph.open_discovery(
        a_id, metric,
        agg_func=agg_func,
        acc_func='sum',    # TODO
        year=year,
        filters=filters,
        limit=limit,
        offset=offset)

    # This is a bit hacky: to get connecting "B" nodes, ask for a
    # fixed number for each A-C pair via closed discovery, and pick
    # the highest-scoring new one for each result.
    # TODO: principled way of picking "B" nodes.
    b_ids, b_scores = [], []
    for c_id in c_ids:
        ids, scores = graph.closed_discovery(
            a_id, c_id,
            metric=metric,
            agg_func=agg_func,
            year=year,
            filters=filters,
            limit=10)    # TODO
        for id_, score in izip(ids, scores):
            if id_ not in b_ids:
                b_ids.append(id_)
                b_scores.append(score)
                break

    nodes = graph.get_nodes(
        [a_id] + b_ids + c_ids,
        metric=metric,
        year=year,
        filters=filters,
        exclude_neighbours_of=a_id,
        history=history)

    edges = graph.subgraph_edges(
        [a_id] + b_ids + c_ids,
        metrics=uniq([metric] + ['count', 'doc_count']),
        year=year,
        filters=filters,
        history=history)

    result = convert_graph_for_output(nodes, edges)
    return jsonify(result)


@app.route('/neighbours/<node_id>')
def neighbours(node_id):
    """Extend graph by adding neighbours of selected node.

    Ensure that all new nodes are connected to existing nodes
    (including other new siblings but not node we're expanding on)
    where possible. To do this the client must supply a list of
    existing nodes.
    """
    from .graphdb import graph
    from lionlbd.lbdinterface import LbdFilters

    types = get_filter_type()
    metric = get_edge_metric()
    year = get_year()
    min_weight, max_weight = get_range_weight()
    discovery_mode = get_discovery_mode()
    history = get_history()

    node_offset, node_limit = get_node_offset_and_limit()

    existing_node_ids = get_existing_nodes()
    is_first_node = (len(existing_node_ids) == 0)

    if is_first_node:
        exclude_neighbours_of = None    # include all for first
    elif not discovery_mode:
        exclude_neighbours_of = None    # only exclude in discovery mode
    else:
        # Discovery mode with existing nodes: exclude neighbours of
        # the start node, which is the first on the list.
        exclude_neighbours_of = existing_node_ids[0]
    if exclude_neighbours_of == node_id:
        # Never exclude the neighbours of the node for which neighbours
        # are being requested
        exclude_neighbours_of = None

    filters = LbdFilters(b_types=types, min_weight=min_weight,
                         max_weight=max_weight)

    b_ids, b_scores = graph.neighbours(
        node_id,
        metric=metric,
        year=year,
        filters=filters,
        limit=node_limit,
        offset=node_offset,
        exclude_neighbours_of=exclude_neighbours_of)

    if len(b_ids) == 0:
        return jsonify({ 'nodes': [], 'edges': []})    # empty graph

    # Make union of new and existing nodes for searching for new edges
    combined_ids = list(set(existing_node_ids) | set(b_ids) | set([node_id]))

    new_edges = graph.subgraph_edges(
        combined_ids,
        metrics=uniq([metric] + ['count', 'doc_count']),
        year=year,
        filters=filters,
        exclude=existing_node_ids,
        history=history)

    # Make unique (TODO: is there a chance this has dups?)
    new_edges = get_unique_edges(new_edges)

    # Return neighbours only if not in existing nodes
    new_ids = [
        i for i in b_ids
        if i not in existing_node_ids and i != node_id
    ]
    # Add in first node if there are no existing nodes, i.e. graph was
    # previously empty
    if is_first_node:
        new_ids.insert(0, node_id)

    # Get node data
    new_nodes = graph.get_nodes(
        new_ids,
        metric=metric,
        year=year,
        filters=filters,
        exclude_neighbours_of=exclude_neighbours_of,
        history=history)

    result = convert_graph_for_output(new_nodes, new_edges)
    return jsonify(result)
