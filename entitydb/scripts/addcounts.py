#!/usr/bin/env python

# Add mention occurrence counts to JSON-LD data.

# TODO avoid replacing singular labels with plural forms


from __future__ import print_function

import sys
import json
import logging

from copy import copy
from collections import defaultdict
from logging import debug, info, warn

from stringsim import needlemanwunsch

#logging.basicConfig(level=logging.INFO)

# Minimum number of mentions required to add a new name to synonyms
MIN_MENTION_COUNT = 10

# Minimum ratio to total mentions required to add a new name to synonyms
MIN_MENTION_RATIO = 0.01

COUNT_KEY = 'pubtator:count'
MISSPELLING = 'synonymtype:misspelling'
MENTION = 'synonymtype:mention'

EXACT, CASE, ALIGN, NOMATCH = range(4)
UPDATED, KEPT = range(2)


def pretty_dump(obj, out=sys.stdout):
    return json.dump(obj, out, sort_keys=True, indent=2,
                     separators=(',', ': '))


def load_json(fn):
    with open(fn) as f:
        mapping = json.load(f)
    return mapping


def contains_synonym(synonyms, value):
    for s in synonyms:
        try:
            svalue = s['val']
        except KeyError:
            warn('missing synonym value: {}'.format(synonyms))
            continue
        if svalue == value:
            return True
    return False


def add_synonym(synonyms, value, predicate='hasExactSynonym',
                xrefs=['synonymtype:label'], count=None):
    synonym = {
        'pred': predicate,
        'val': value,
        'xrefs': copy(xrefs),
    }
    if count is not None:
        synonym[COUNT_KEY] = count
    synonyms.append(synonym)
    return synonym


def find_best_match(synonyms, name):
    # exact match
    for s in synonyms:
        if s.get('val') == name:
            find_best_match.stats[EXACT] += 1
            return s

    # case-insensitive match
    for s in synonyms:
        if s.get('val').lower() == name.lower():
            find_best_match.stats[CASE] += 1
            return s

    # string alignment
    best, best_score = None, 0
    for s in synonyms:
        score = needlemanwunsch(s.get('val'), name)
        if score > best_score:
            best, best_score = s, score
    if best is not None:
        find_best_match.stats[ALIGN] += 1
        debug('aligned "{}" to. "{}" (from {})'.format(name, best.get('val'), " --- ".join(['"{}"'.format(s.get('val')) for s in synonyms])))
        return best

    # nothing matched
    debug('NO MATCH: "{}" vs. {}'.format(name, " --- ".join(['"{}"'.format(s.get('val')) for s in synonyms])))
    find_best_match.stats[NOMATCH] += 1
    return None
find_best_match.stats = defaultdict(int)


def write_stats(out):
    for i, s in ((EXACT, 'exact match'),
                 (CASE, 'case insensitive'),
                 (ALIGN, 'aligned match'),
                 (NOMATCH, 'no match')):
        print('{}: {}'.format(s, find_best_match.stats[i]), file=out)
    for i, s in ((UPDATED, 'updated labels'),
                 (KEPT, 'unmodified labels')):
        print('{}: {}'.format(s, update_labels.stats[i]), file=out)


def is_frequent_name(name, count, total, synonyms):
    """Return whether name is sufficiently frequent to add as a synonym."""
    return count >= MIN_MENTION_COUNT and 1.*count/total >= MIN_MENTION_RATIO


def add_counts(data, mapping):
    for node in data['graphs']['nodes']:
        if node.get('type') != 'CLASS':
            info('skipping non-class: {}'.format(node))
            continue
        id_ = node['id']
        try:
            label = node['lbl']
        except KeyError:
            info('missing lbl: {}'.format(node))
            label = None
        try:
            meta = node['meta']
        except KeyError:
            warn('missing meta: {}'.format(node))
            continue
        counts = mapping.get(id_, {})
        total = sum(counts.values())
        meta[COUNT_KEY] = total

        synonyms = meta.get('synonyms', [])
        if isinstance(synonyms, dict):
            synonyms = [synonyms]    # wrap

        if label is None and not synonyms:
            continue    # no names, cannot process

        if label is not None and not contains_synonym(synonyms, label):
            # Label must be in synonyms to allow attaching counts.
            info('adding {}'.format(label.encode('utf-8')))
            add_synonym(synonyms, label)

        sorted_counts = sorted(counts.items(), key=lambda nc: -nc[1])
        for name, count in sorted_counts:
            synonym = find_best_match(synonyms, name)
            if synonym is not None:
                synonym[COUNT_KEY] = synonym.get(COUNT_KEY, 0) + count
            elif is_frequent_name(name, count, total, synonyms):
                # No match in existing synonyms for a frequent name, so add
                info('adding synonym {} ({}) to {}'.format(name, count, label))
                add_synonym(synonyms, name, 'hasRelatedSynonym',
                            ['pubtator', MENTION], count)
            else:
                info('ignoring {} ({}) for {}'.format(name, count, label))

        if synonyms:
            if len(synonyms) == 1:
                synonyms = synonyms[0]    # unwrap
            meta['synonyms'] = synonyms


def is_candidate_label(synonym, label):
    """Return whether synonym should be as replacement for label."""
    xrefs, value = synonym.get('xrefs', []), synonym.get('val')
    if not isinstance(xrefs, list):
        xrefs = [xrefs]    # wrap
    # Filter out by particular synonym types
    for xref in xrefs:
        if xref == MISSPELLING:
            info('rejecting misspelling "{}"'.format(value))
            return False
        elif xref == MENTION:
            # This prevents e.g. "patients" (the most common mention form)
            # from becoming the formal label for NCBITaxon:9606
            info('rejecting mention-derived synonym "{}"'.format(value))
            return False
    # Filter out plurals (simple heuristic)
    if value in (label+'s', label+'es'):
        return False
    return True


def replace_label(label_count, max_count):
    if max_count < 2:
        return False    # no changes for singletons
    else:
        return max_count > label_count


def update_labels(data):
    for node in data['graphs']['nodes']:
        if node.get('type') != 'CLASS':
            continue
        try:
            label = node['lbl']
            meta = node['meta']
            synonyms = meta['synonyms']
        except KeyError:
            continue
        if isinstance(synonyms, dict):
            synonyms = [synonyms]    # wrap

        label_count = 0
        for s in synonyms:
            if s.get('val') == label:
                label_count = s.get(COUNT_KEY, 0)
                break

        max_count, max_label = 0, None
        for s in synonyms:
            if not is_candidate_label(s, label):
                continue    # ignore
            if s.get(COUNT_KEY, 0) > max_count and s.get('val'):
                max_count, max_label = s[COUNT_KEY], s['val']

        if replace_label(label_count, max_count):
            warn('replacing label "{}" ({}) with "{}" ({})'.format(
                label, label_count, max_label, max_count))
            node['lbl'] = max_label
            update_labels.stats[UPDATED] += 1
        else:
            update_labels.stats[KEPT] += 1
update_labels.stats = defaultdict(int)


def main(argv):
    if len(argv) != 3:
        print('Usage: {} MAP JSONLD'.format(__file__), file=sys.stderr)
        return 1
    mapfn, infn = argv[1:]
    mapping = load_json(mapfn)
    data = load_json(infn)
    add_counts(data, mapping)
    update_labels(data)
    write_stats(sys.stderr)
    pretty_dump(data)
    

if __name__ == '__main__':
    sys.exit(main(sys.argv))
