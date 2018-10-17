#!/usr/bin/env python

# Preprocess data in OBO format prior to conversion to other formats.

# Written for OBO format 1.4 (May 2012 draft)
# (see owlcollab.github.io/oboformat/doc/obo-syntax.html)


from __future__ import print_function

import sys
import re

from six import string_types


class FormatError(Exception):
    pass


def parse_comment(line):
    # "line can optionally be ended by a HiddenComment, indicated by
    # the '!' character - this is semantically silent [and] can be
    # ignored by the parser."
    # (http://owlcollab.github.io/oboformat/doc/obo-syntax.html#2.3)
    if '!' not in line:
        return line, None    # fast for typical case
    m = re.match(r'^((?:[^"]|"(?:\\"|[^"])*")*)(\s+\!\s.*)$', line)
    if not m:
        return line, None    # no comment
    else:
        return m.groups()


def parse_synonym_line(line):
    """Parse OBO "synonym:" line"""
    # Format:
    # synonym-Tag QuotedString ws SynonymScope [ ws SynonymType-ID ] XrefList
    # SynonymScope ::= 'EXACT' | 'BROAD' | 'NARROW' | 'RELATED'
    # (http://owlcollab.github.io/oboformat/doc/obo-syntax.html#3.3)
    # "Each clause can also have zero or more comma-separated tag-value
    # trailing qualifiers between a '{' and a '}'"
    m = re.match(r'^synonym: ("(?:\\"|[^"])*") (EXACT|BROAD|NARROW|RELATED) ([A-Za-z0-9_-]*) *\[(.*)\]\s*((?:\{.*\}\s*)?)$', line)
    if not m:
        raise FormatError('failed to parse synonym line: {}'.format(line))

    string, scope, type_id, xrefs, qualifiers = m.groups()
    xrefs = [ x for x in xrefs.split(', ') if x]
    return string, scope, type_id, xrefs, qualifiers


def format_synonym_line(string, scope, type_id, xrefs, qualifiers):
    """Return string for OBO "synonym:" line"""
    xrefs = '[{}]'.format(', '.join(xrefs))
    spans = [ 'synonym:', string, scope, type_id, xrefs, qualifiers ]
    spans = [ s for s in spans if s ]
    return ' '.join(spans)


def process_synonym_line(line, out):
    line, comment = parse_comment(line)    # remove comment, if any
    string, scope, type_id, xrefs, qualifiers = parse_synonym_line(line)
    # If SynonymType-ID is non-empty, add it to xrefs with the prefix
    # "synonymtype:" to assure that it is not lost in conversions that
    # discard SynonymType-ID.
    if type_id:
        xrefs.append('synonymtype:{}'.format(type_id))
    line = format_synonym_line(string, scope, type_id, xrefs, qualifiers)
    print(line, file=out)


def process_file(f, out=sys.stdout):
    if isinstance(f, string_types):    # assume filename
        with open(f) as fp:
            return process_file(fp)

    for line in f:
        line = line.rstrip('\n')
        if line.startswith('synonym:'):
            process_synonym_line(line, out)
        else:
            print(line, file=out)    # default to unmodified output


def main(argv):
    for fn in argv[1:]:
        process_file(fn, sys.stdout)


if __name__ == '__main__':
    sys.exit(main(sys.argv))
