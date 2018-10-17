#!/usr/bin/env python

from __future__ import print_function

import sys
import os
import io
import re
import logging

from time import time
from logging import info

from common import execute_sql, insert_files


logging.basicConfig(level=logging.INFO)


def argparser():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('-c', '--commit-every', metavar='N', default=10000,
                    type=int, help='Commit after every N documents')
    ap.add_argument('-m', '--max-documents', default=None, type=int,
                    help='Maximum number of documents to insert')
    ap.add_argument('-n', '--dbname', default=None,
                    help='Database name')
    ap.add_argument('-r', '--recurse', default=False, action='store_true',
                    help='Recurse into subdirectories')
    ap.add_argument('-s', '--suffix', default='.txt',
                    help='Suffix of files to process (with -r)')
    ap.add_argument('files', metavar='FILE', nargs='+',
                    help='Input files')
    return ap


def filename_to_id(fn):
    base, ext = os.path.splitext(os.path.basename(fn))
    if re.match(r'^[0-9]+$', base):
        return 'PMID:{}'.format(base)    # assume PubMed
    else:
        raise ValueError('failed to determine ID for {}'.format(fn))


def insert_text(fn, options, **kwargs):
    with io.open(fn, encoding='utf-8') as f:
        text = f.read()
    id_ = filename_to_id(fn)
    sql = '''
INSERT INTO documents (id, text)
VALUES (%s, %s)'''
    execute_sql(sql, (id_, text), **kwargs)


def main(argv):
    start_time = time()
    args = argparser().parse_args(argv[1:])
    kwargs = {}
    if args.dbname is not None:
        kwargs['dbname'] = args.dbname
    count = insert_files(args.files, insert_text, args, **kwargs)
    elapsed = time() - start_time
    info('Done, inserted {} files in {:.0f} seconds'.format(count, elapsed))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
