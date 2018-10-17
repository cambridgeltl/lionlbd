#!/usr/bin/env python

# Compact OBO Graphs with respect to JSON-LD context.

# Known issues:
# - The assumption that 'oboInOwl' is the base for relative IRIs fails
#   for at least 'is_a': ('rdfs:subClassOf') and 'inverseOf' (likely
#   'owl:inverseOf')
# - The "val" values are a mix of strings (e.g. "1.2" for version) and
#   IRIs (e.g. "http://purl.obolibrary.org/obo/NCBITaxon_species" for
#   NCBITaxon rank). The latter should be compacted into CURIEs.

from __future__ import print_function

import sys
import json

from six import string_types
from logging import warn

from pyld import jsonld


# Base URL to use for OBO Graphs identifiers.
ogbase = 'https://github.com/geneontology/obographs#'

# assume relative IRIs in oboInOwl
baseiri = 'oboInOwl:'

# JSON-LD context for OBO Graphs. Note that OBO Graphs is not defined
# as a JSON-LD format, and this is a custom context rather than an
# official one.
context = {
    '@base': baseiri,

    'id': '@id',    # alias JSON-LD '@id' to 'id'

    # RDF/OWL prefixes
    'rdf' : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rdfs' : 'http://www.w3.org/2000/01/rdf-schema#',
    'owl' : 'http://www.w3.org/2002/07/owl#',
    'oboInOwl': 'http://www.geneontology.org/formats/oboInOwl#',

    # OBO Graphs basic data model
    'sub': { '@id': 'rdf:subject', '@type': '@id' },
    'pred': { '@id': 'rdf:predicate', '@type': '@id' },
    'obj': { '@id': 'rdf:object', '@type': '@id' },
    'val': 'rdf:value',
    'lbl': 'rdfs:label',
    'comments': 'rdfs:comment',

    # OBO in OWL terms
    'xrefs': 'oboInOwl:DbXref',
    'synonyms': 'oboInOwl:Synonym',
    'hasExactSynonym': 'oboInOwl:hasExactSynonym',
    'hasRelatedSynonym': 'oboInOwl:hasRelatedSynonym',
    'hasBroadSynonym': 'oboInOwl:hasBroadSynonym',

    # Unmapped OBO Graphs terms (TODO?)
    'graphs': ogbase+'graphs',
    'nodes': ogbase+'nodes',
    'edges': ogbase+'edges',
    'type': ogbase+'type',
    'meta': ogbase+'meta',
    'version': ogbase+'version',
    'subsets': ogbase+'subsets',
    'domainRangeAxioms': ogbase+'domainRangeAxioms',
    'equivalentNodesSets': ogbase+'equivalentNodesSets',
    'logicalDefinitionAxioms': ogbase+'logicalDefinitionAxioms',
    'propertyChainAxioms': ogbase+'propertyChainAxioms',
    'basicPropertyValues': ogbase+'basicPropertyValues',
}

# Ontology prefixes (see https://github.com/prefixcommons/biocontext)
context.update({
    'BFO' : 'http://purl.obolibrary.org/obo/BFO_',
    'RO' : 'http://purl.obolibrary.org/obo/RO_',
    'CHEBI': 'http://purl.obolibrary.org/obo/CHEBI_',
    'IAO' : 'http://purl.obolibrary.org/obo/IAO_',
    'NCBITaxon': 'http://purl.obolibrary.org/obo/NCBITaxon_',
    'GO': 'http://purl.obolibrary.org/obo/GO_',
    'PR': 'http://purl.obolibrary.org/obo/PR_',
})

# Ontology vocabularies (TODO: reconsider prefixes?)
context.update({
    'chebi': 'http://purl.obolibrary.org/obo/chebi#',
    'ncbitaxon': 'http://purl.obolibrary.org/obo/ncbitaxon#',
    'go': 'http://purl.obolibrary.org/obo/go#',
    'pr': 'http://purl.obolibrary.org/obo/pr#',
})

# Compaction algorithm options
options = {
    'base': baseiri,
    'graph': False,    # True to always output a top-level graph
    'compactArrays': True,    # Compact arrays to values when appropriate
    'skipExpansion': False,    # Assume input is expanded and skip expansion
    'expandContext': context,
}


def pretty_dumps(obj):
    return json.dumps(obj, sort_keys=True, indent=2, separators=(',', ': '))


def _relativize(obj, iri_terms, base):
    # relativize() implementation
    if isinstance(obj, string_types):
        pass
    elif isinstance(obj, list):
        for o in obj:
            _relativize(o, iri_terms, base)
    elif isinstance(obj, dict):
        for k, v in obj.iteritems():
            if (k in iri_terms and isinstance(v, string_types) and
                v.startswith(base)):
                obj[k] = v[len(base):]
            else:
                _relativize(v, iri_terms, base)
    else:
        warn('_relativize: unexpected type {}'.format(type(obj)))


def relativize(obj, context, base=None):
    """Replace absolute IRIs/CURIE values with relative ones.

    Done for further normalization because (at least with pyld) jsonld
    compaction, relative URLs are preserved but prefixes matching the
    base are not removed, giving equivalent objects different
    representation depending on the presence of base prexixes in
    input.

    >>> context = { '@base': 'http://ex.org/', 'ex:': 'http://ex.org/' }
    >>> jsonld.compact({ '@id': '1', '@type': tt.pypy}, context)
    { ... '@id': '1', '@type': t.pyt'}
    >>> jsonld.compact({ '@id': 'ex:1', '@type': 'ext.pyt' }, context)
    { ... '@id': 'ex:1', '@type': 'ext.pyt'}

    The object must have been compacted with respect to the given
    context. Implementation does not support advanced JSON-LD features
    such as embedded contexts.
    """
    if base is None:
        base = context.get('@base')
    if base is None:
        raise ValueError('relativize: no @base')

    # Parse context to determine which terms have IRI values. See
    # http://json-ld.org/spec/latest/json-ld/#the-context .
    # Note: only checks top-level terms.
    iri_terms = set()
    for k, v in context.iteritems():
        if isinstance(v, dict) and v.get('@type') == '@id':
            iri_terms.add(k)

    _relativize(obj, iri_terms, base)
    return obj


def process(fn, out=sys.stdout):
    with open(fn) as f:
        d = json.load(f)
    d = jsonld.compact(d, context, options)
    d = relativize(d, context, baseiri)
    print(pretty_dumps(d), file=out)


def main(argv):
    for fn in argv[1:]:
        process(fn)


if __name__ == '__main__':
    sys.exit(main(sys.argv))
