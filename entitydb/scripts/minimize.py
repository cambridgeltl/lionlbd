#!/usr/bin/env python

# Minimize JSON-LD

import sys
import json

from six import string_types


def pretty_dump(obj, out=sys.stdout):
    return json.dump(obj, out, sort_keys=True, indent=2,
                      separators=(',', ': '))


def _minimize(obj):
    # minimize() implementation
    if isinstance(obj, string_types):
        return obj
    elif isinstance(obj, list):
        return [ _minimize(o) for o in obj ]
    elif isinstance(obj, dict):
        if len(obj) == 1 and obj.keys() == ['@value']:
            return obj['@value']
        else:
            return { k: _minimize(v) for k, v in obj.iteritems() }
    else:
        warn('_minimize: unexpected type {}'.format(type(obj)))


def minimize(obj):
    """Minimize JSON-LD.

    Done for normalization as some JSON-LD processors create
    unnecessarily verbose forms such as { "ex:1": { "@value": "a" } }
    """
    if '@graph' not in obj:
        raise NotImplementedError('no @graph')
    obj['@graph'] = _minimize(obj['@graph'])
    return obj


def main(argv):
    for fn in argv[1:]:
        with open(fn) as f:
            data = json.load(f)
            minimize(data)
            pretty_dump(data)


if __name__ == '__main__':
    sys.exit(main(sys.argv))
