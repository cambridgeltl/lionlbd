#!/usr/bin/env python

from __future__ import print_function

import sys
import os
import io
import re
import json
import logging

from time import time
from logging import info, error

from common import insert_files
# from common import insert    # 10K:1m54s / 100K:22m45s
# from common import copy as insert    # 10K:2m10s / 100K:27m27s
# from common import insert_batched as insert    # 10K:1m24s / 100K:16m14s
from common import copy_batched as insert    # 10K:1m15s / 100K:14m36.707s


logging.basicConfig(level=logging.INFO)


def argparser():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('-c', '--commit-every', metavar='N', default=10000,
                    type=int, help='Commit after every N documents')
    ap.add_argument('-d', '--denormalize', default=False, action='store_true',
                    help='Add redundant copies of data for performance')
    ap.add_argument('-m', '--max-documents', default=None, type=int,
                    help='Maximum number of documents to insert')
    ap.add_argument('-n', '--dbname', default=None,
                    help='Database name')
    ap.add_argument('-r', '--recurse', default=False, action='store_true',
                    help='Recurse into subdirectories')
    ap.add_argument('-s', '--suffix', default='.jsonld',
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


def parse_document_id(target):
    """Return document ID given annotation target URL."""
    m = re.match(r'^(PMID:\d+)', target)
    if not m:
        raise ValueError('failed to parse document id from {}'.format(target))
    return m.group(1)


def insert_span(id_, document_id, ann, options, **kwargs):
    table = 'mentions'
    columns = ('id', 'document_id', 'data')
    values = (id_, document_id, json.dumps(ann))
    return insert(table, columns, values, **kwargs)


def insert_relation(id_, document_id, ann, options, **kwargs):
    from_ = ann['body'].pop('from')    # reduce redundancy in JSON
    to_ = ann['body'].pop('to')

    table = 'relations'
    columns = ['id', 'document_id', 'from_id', 'to_id']
    values = [id_, document_id, from_, to_]

    if options.denormalize:    # see denormalize()
        from_data_body_id = ann.pop('__from_data_body_id')
        to_data_body_id = ann.pop('__to_data_body_id')
        columns.extend(['__from_data_body_id', '__to_data_body_id'])
        values.extend([from_data_body_id, to_data_body_id])

    columns.append('data')
    values.append(json.dumps(ann))
    return insert(table, columns, values, **kwargs)


def denormalize(annotations):
    """Add redundant copies of data for performance."""
    annotation_by_id = { a['id']: a for a in annotations }
    for ann in annotations:
        if ann['type'] == 'Relation':
            # For relations, copy in the ids referenced in the bodies
            # of their "from" and "to" annotations. Note that these
            # must be in the same document for them to be in
            # annotation_by_id: cross-document relations would require
            # a different approach.
            try:
                from_ = annotation_by_id[ann['body']['from']]
                to_ = annotation_by_id[ann['body']['to']]
            except KeyError:
                error('failed to denormalize {}'.format(json.dumps(ann)))
                raise
            try:
                ann['__from_data_body_id'] = from_['body'].get('id')
                ann['__to_data_body_id'] = to_['body'].get('id')
            except KeyError:
                error(json.dumps(from_))
                error(json.dumps(to_))
                raise


def insert_annotations(fn, options, **kwargs):
    try:
        with io.open(fn, encoding='utf-8') as f:
            annotations = json.load(f)
    except:
        error('failed to load {}'.format(fn))
        raise
    if options.denormalize:
        denormalize(annotations)
    # Relations refer to spans. To preserve referential integrity,
    # sort so that the latter are processed before the former.
    annotations.sort(key=lambda d: d['type'], reverse=True)
    for ann in annotations:
        id_ = ann.pop('id')    # reduce redundancy in JSON
        document_id = parse_document_id(ann['target'])
        if ann['type'] == 'Span':
            insert_func = insert_span
        elif ann['type'] == 'Relation':
            insert_func = insert_relation
        else:
            raise ValueError('unknown annotation type {}'.format(ann['type']))
        insert_func(id_, document_id, ann, options, **kwargs)


def main(argv):
    start_time = time()
    args = argparser().parse_args(argv[1:])
    kwargs = {}
    if args.dbname is not None:
        kwargs['dbname'] = args.dbname
    count = insert_files(args.files, insert_annotations, args, **kwargs)
    elapsed = time() - start_time
    info('done, inserted {} files in {:.0f}s ({:.1f}/s)'.format(
        count, elapsed, 1.*count/elapsed))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
