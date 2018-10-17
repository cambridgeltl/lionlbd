from __future__ import print_function
from __future__ import absolute_import

import re

from flask import request

from logging import debug

from lionlbd.config import RESULTS_PER_PAGE_MENTION, RESULTS_PER_PAGE_NODE
from lionlbd.config import QUERY_PARAMETER, NODE_PARAMETER, PAGE_PARAMETER, EXPAND_PARAMETER, EDGE_METRIC_PARAMETER, AGGREGATION_FUNC_PARAMETER, FILTER_TYPE_PARAMETER, YEAR_PARAMETER, WEIGHT_START_PARAMETER, WEIGHT_END_PARAMETER, HISTORY_PARAMETER, DISCOVERY_MODE_PARAMETER


def get_query_terms():
    query_terms = [
        t for t in request.args.getlist(QUERY_PARAMETER)
        if t and not t.isspace()
    ]
    debug('query terms: {}'.format(query_terms))
    return query_terms


def get_existing_nodes():
    existing_nodes = [
        t for t in request.args.getlist(NODE_PARAMETER)
        if t and not t.isspace()
    ]
    debug('existing nodes: {}'.format(existing_nodes))
    return existing_nodes


def get_filter_type():
    filter_type_terms = [
        t for t in request.args.getlist(FILTER_TYPE_PARAMETER)
        if t and not t.isspace()
    ]
    debug('filter type terms: {}'.format(filter_type_terms))

    if len(filter_type_terms) is 0: return None

    return filter_type_terms


def get_int_argument(name, default=0, minimum=None, maximum=None):
    """Return value of integer argument in request."""
    values = [
        int(v) for v in request.args.getlist(name)
        if get_int_argument.re.match(v)    # ignore invalid
    ]
    # filter out-of-bounds values
    if minimum is not None:
        values = [v for v in values if v >= minimum]
    if maximum is not None:
        values = [v for v in values if v <= maximum]
    if not values:
        return default
    else:
        return values[0]    # pick first if multiple
get_int_argument.re = re.compile(r'^[+-]?[0-9]+$')


def get_float_argument(name, default=0.0, minimum=None, maximum=None):
    """Return value of integer argument in request."""
    values = []
    for v in request.args.getlist(name):
        try:
            values.append(float(v))
        except:
            pass    # filter out invalid
    # filter out-of-bounds values
    if minimum is not None:
        values = [v for v in values if v >= minimum]
    if maximum is not None:
        values = [v for v in values if v <= maximum]
    if not values:
        return default
    else:
        return values[0]    # pick first if multiple


def get_expand():
    return get_int_argument(EXPAND_PARAMETER, default=0, minimum=0, maximum=1)


def get_pagination_page():
    return get_int_argument(PAGE_PARAMETER, default=1, minimum=1)


def get_edge_metric():
    edge_metrics = request.args.getlist(EDGE_METRIC_PARAMETER)
    if (len(edge_metrics) == 0):
        return 'count'
    return edge_metrics[0]


def get_aggregation_func():
    aggregation_funcs = request.args.getlist(AGGREGATION_FUNC_PARAMETER)
    if (len(aggregation_funcs) == 0):
        return 'min'
    return aggregation_funcs[0]


def get_year():
    return get_int_argument(YEAR_PARAMETER, None)


def get_range_weight():
    return (get_float_argument(WEIGHT_START_PARAMETER, None),
            get_float_argument(WEIGHT_END_PARAMETER, None))


def get_offset_and_limit():
    """Return pagination offset and limit."""
    page = get_pagination_page()
    offset, limit = RESULTS_PER_PAGE_MENTION*(page-1), RESULTS_PER_PAGE_MENTION
    return offset, limit


def get_node_offset_and_limit():
    """Return pagination offset and limit for nodes."""
    page = get_pagination_page()
    offset, limit = RESULTS_PER_PAGE_NODE*(page-1), RESULTS_PER_PAGE_NODE
    return offset, limit


def get_query_terms_src_dest():
    query_terms_src_dest = [request.args.get('src'), request.args.get('dest')]
    debug('query terms src/dest: {}'.format(query_terms_src_dest))
    return query_terms_src_dest


def get_discovery_mode():
    discovery_mode = request.args.getlist(DISCOVERY_MODE_PARAMETER)
    if len(discovery_mode) == 0:
        return False
    return discovery_mode[0] == '1'


def get_history():
    history = request.args.getlist(HISTORY_PARAMETER)
    if len(history) == 0:
        return False
    return history[0] == '1'


def uniq(seq):
    """Return unique items in sequence preserving order."""
    unique, seen = [], set()
    for i in seq:
        if i not in seen:
            unique.append(i)
            seen.add(i)
    return unique
