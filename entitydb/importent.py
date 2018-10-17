#!/usr/bin/env python

from __future__ import print_function

import sys
import json
import logging

from time import time
from logging import info, warn, error

from common import copy_batched as insert
from common import commit


logging.basicConfig(level=logging.INFO)


class FormatError(Exception):
    pass


def argparser():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('-c', '--commit-every', metavar='N', default=10000,
                    type=int, help='Commit after every N entities')
    ap.add_argument('-n', '--dbname', default=None,
                    help='Database name')
    ap.add_argument('files', metavar='FILE', nargs='+',
                    help='Input files')
    return ap


def db_args(options):
    kwargs = {}
    if options.dbname is not None:
        kwargs['dbname'] = options.dbname
    return kwargs


def insert_one(table, columns, values, options, count):
    insert(table, columns, values, **db_args(options))
    count += 1
    if count % 100 == 0:
        info('processed {} ...'.format(count))
    if options.commit_every < 2 or count % options.commit_every == 0:
        if options.commit_every > 100:
            info('committing ...')
        commit(**db_args(options))
    return count


def process_node(node, options, count):
    """Insert OBO Graphs node data into DB."""
    id_ = node.pop('id')    # reduce redundancy in JSON
    try:
        type_ = node.pop('type')    # reduce redundancy in JSON
    except KeyError:
        raise FormatError('missing type for {}'.format(id_))
    if type_ != 'CLASS':
        raise FormatError('unexpected type {} for {}'.format(type_, id_))
    table = 'entities'
    columns = ('id', 'data')
    values = (id_, json.dumps(node))
    return insert_one(table, columns, values, options, count)


def process_graph(graph, options, count):
    """Process OBO Graphs graph, insert entities into DB."""
    if 'nodes' not in graph:
        warn('graph has no "nodes"')
    nodes = graph['nodes']
    if not isinstance(nodes, list):
        nodes = [nodes]    # assume compacted, wrap
    for node in nodes:
        if 'type' not in node:
            warn('skipping typeless node {}'.format(node.get('id')))
        elif node['type'] == 'PROPERTY':
            info('skipping {} node {}'.format(node['type'], node.get('id')))
        else:
            count = process_node(node, options, count)
    return count


def process_og(data, options, count=0):
    """Process OBO Graphs data, insert entities into DB."""
    if 'graphs' not in data:
        raise FormatError('missing "graphs" in data')
    graphs = data['graphs']
    if not isinstance(graphs, list):
        graphs = [graphs]    # assume compacted, wrap
    for graph in graphs:
        count = process_graph(graph, options, count)
    return count
    

def insert_entities(fn, options):
    try:
        with open(fn) as f:
            data = json.load(f)
    except:
        error('failed to load {}'.format(fn))
        raise
    count = process_og(data, options)
    commit(**db_args(options))
    return count


def main(argv):
    start_time = time()
    args = argparser().parse_args(argv[1:])
    count = 0
    for fn in args.files:
        count += insert_entities(fn, args)
    elapsed = time() - start_time
    info('done, inserted {} entities in {:.0f}s ({:.1f}/s)'.format(
        count, elapsed, 1.*count/elapsed))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
