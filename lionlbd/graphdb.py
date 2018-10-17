from __future__ import print_function
from __future__ import absolute_import

# test for https://github.com/cambridgeltl/lion-lbd/issues/102
from lionlbd.proxyinterface import SwitchProxy


def _get_graph_db():
    from flask import request
    from logging import debug
    if request.args.get('db') == 'neo4j':
        return _get_neo4j_db()
    else:
        return _get_in_memory_db()


def _get_neo4j_db():
    from lionlbd.neo4jinterface import Neo4jInterface
    if _get_neo4j_db.cache is None:
        _get_neo4j_db.cache = Neo4jInterface()
    return _get_neo4j_db.cache
_get_neo4j_db.cache = None


def _get_in_memory_db():
    from lionlbd.proxyinterface import GraphProxy
    if _get_in_memory_db.cache is None:
        # TODO URL in conf
        _get_in_memory_db.cache = GraphProxy('http://127.0.0.1:8081/graph')
    return _get_in_memory_db.cache
_get_in_memory_db.cache = None


graph = SwitchProxy(choice=_get_graph_db)
