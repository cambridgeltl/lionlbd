#!/usr/bin/env python

# LbdInterface that forwards to a remote implementation.

from __future__ import print_function
from __future__ import absolute_import

import json
import requests

from logging import debug, info, warn, error

from .lbdinterface import LbdInterface, LbdFilters


def _to_param(o):
    if type(o) in (bool, int, long, float, str, unicode, type(None)):    # etc
        return o
    elif isinstance(o, list):
        return [_to_param(i) for i in o]
    elif isinstance(o, dict):
        return { _to_param(k): _to_param(v) for k, v in o.items() }
    else:
        return _to_param(o.__dict__)


class GraphProxy(LbdInterface):
    """Forwarding proxy to remote LbdInterface implementation."""

    def __init__(self, url):
        """Initialize GraphProxy forwarding to given URL."""
        self._base_url = url

    def _forward(self, func, args):
        """Forward call to func with args to remote implementation."""
        # Pass arguments and receive results as JSON.
        args.pop('self', None)    # discard self (if any)
        url = '{}/{}'.format(self._base_url.rstrip('/'), func)
        params = json.dumps(_to_param(args))
        r = requests.get(url, params={ 'params': params })
        r.raise_for_status()
        result = r.json()
        debug('result: {}'.format(result))
        return result

    def neighbours(self, id_, metric, year=None, filters=None, limit=None,
                   offset=0, exclude_neighbours_of=None):
        # This would be a lot less tedious if __function__ hadn't
        # been rejected... (https://www.python.org/dev/peps/pep-3130/)
        return self._forward('neighbours', locals())

    def closed_discovery(self, a_id, c_id, metric, agg_func, year=None,
                         filters=None, limit=None, offset=0):
        return self._forward('closed_discovery', locals())

    def open_discovery(self, a_id, metric, agg_func, acc_func, year=None,
                       filters=None, limit=None, offset=0):
        return self._forward('open_discovery', locals())

    def subgraph_edges(self, nodes, metrics, year=None, filters=None,
                       exclude=None, history=False):
        return self._forward('subgraph_edges', locals())

    def get_nodes(self, ids, metric=None, year=None, filters=None,
                  exclude_neighbours_of=None, history=False):
        return self._forward('get_nodes', locals())

    def meta_information(self):
        return self._forward('meta_information', locals())

    def get_year_range(self):
        return self._forward('get_year_range', locals())

    def get_types(self):
        return self._forward('get_types', locals())

    def get_metrics(self):
        return self._forward('get_metrics', locals())

    def get_metric_range(self, metric):
        return self._forward('get_metric_range', locals())

    def get_aggregation_functions(self):
        return self._forward('get_aggregation_functions', locals())

    def get_accumulation_functions(self):
        return self._forward('get_accumulation_functions', locals())

    def discoverable_edges(self, after, until=None):
        return self._forward('discoverable_edges', locals())


class SwitchProxy(GraphProxy):
    """Proxy that allows switching between LbdInterface implementations."""

    def __init__(self, choice):
        """Initialize SwitchProxy with given choice function."""
        self._choice = choice

    def _forward(self, func, args):
        """Forward call to func with args to chosen implementation."""
        impl = self._choice()
        try:
            method = impl.getattr(func)
        except:
            method = impl.__getattribute__(func)
        args.pop('self', None)    # discard self (if any)
        debug('SwitchProxy: invoking {}({})'.format(method.__name__, args))
        result = method(**args)
        debug('SwitchProxy: {} returned: {}'.format(method.__name__, result))
        return result
