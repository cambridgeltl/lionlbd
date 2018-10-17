from __future__ import print_function
from __future__ import absolute_import

import json

from six import string_types

from lionlbd.sqldb import execute_sql, row_to_dict, rows_to_dicts

from config import MENTION_DB_CREDENTIALS as MDB
from config import MENTION_DB_DENORMALIZED


def get_documents(offset=0, limit=100):
    """Get documents."""
    sql = '''
SELECT * FROM documents
OFFSET %s LIMIT %s'''
    if limit > 10000:    # TODO avoid magic number
        raise ValueError('query limit {} too high'.format(limit))
    cursor = execute_sql(sql, (offset, limit), **MDB)
    rows = cursor.fetchall()
    return rows_to_dicts(rows, cursor)


def get_document(id_):
    """Get document with given id."""
    sql = '''
SELECT * FROM documents
WHERE id = %s'''
    cursor = execute_sql(sql, (id_, ), **MDB)
    if cursor.rowcount == 0:
        raise KeyError
    assert cursor.rowcount == 1    # id is primary key
    return row_to_dict(cursor.fetchone(), cursor)


def get_document_mentions(document_id):
    """Return mention annotations for document."""
    sql = '''
SELECT * FROM mentions
WHERE document_id = %s'''
    cursor = execute_sql(sql, (document_id, ), **MDB)
    rows = cursor.fetchall()
    # TODO: KeyError instead of empty list return when doc not in DB?
    mentions = rows_to_dicts(rows, cursor)
    return [_db_mention_to_jsonld(m) for m in mentions]


def get_document_relations(document_id):
    """Return relation annotations for document."""
    sql = '''
SELECT * FROM relations
WHERE document_id = %s'''
    cursor = execute_sql(sql, (document_id, ), **MDB)
    rows = cursor.fetchall()
    # TODO: KeyError instead of empty list return when doc not in DB?
    relations = rows_to_dicts(rows, cursor)
    return [_db_relation_to_jsonld(r) for r in relations]


def get_document_annotations(document_id):
    """Return annotations for document."""
    return (get_document_mentions(document_id) +
            get_document_relations(document_id))


def get_entity_mentions(entity_id, offset, limit):
    """Return mention annotations grounded to entity."""
    sql = '''
SELECT * FROM mentions
WHERE  data @> %s
OFFSET %s
LIMIT  %s'''
    e_str = json.dumps({ "body": { "id": entity_id } })
    cursor = execute_sql(sql, (e_str, offset, limit), **MDB)
    rows = cursor.fetchall()
    mentions = rows_to_dicts(rows, cursor)
    return [_db_mention_to_jsonld(m) for m in mentions]


def get_relation_instances(entity1_id, entity2_id, offset, limit):
    """Return instances of relations between mention annotations grounded
    to given entities."""
    if not MENTION_DB_DENORMALIZED:
        implementation = _get_relation_instances_join
    else:
        implementation = _get_relation_instances_denormalized
    return implementation(entity1_id, entity2_id, offset, limit)


def get_mention(id_):
    """Get mention."""
    sql = '''
SELECT * FROM mentions
WHERE  id = %s'''
    cursor = execute_sql(sql, (id_, ), **MDB)
    if cursor.rowcount == 0:
        raise KeyError
    assert cursor.rowcount == 1    # id is primary key
    mention = row_to_dict(cursor.fetchone(), cursor)
    return _db_mention_to_jsonld(mention)


def get_relation(id_):
    """Get relation."""
    sql = '''
SELECT * FROM relations
WHERE  id = %s'''
    cursor = execute_sql(sql, (id_, ), **MDB)
    if cursor.rowcount == 0:
        raise KeyError
    assert cursor.rowcount == 1    # id is primary key
    relation = row_to_dict(cursor.fetchone(), cursor)
    return _db_relation_to_jsonld(relation)


def get_annotation(id_):
    """Get annotation."""
    try:
        return get_mention(id_)
    except KeyError:
        pass    # assume relation
    return get_relation(id_)


def get_resource(id_):
    """Get resource."""
    # TODO avoid parsing ID
    if id_.endswith('/text'):
        return {
            'id': id_,
            'value': get_document(id_[:-5])['text']
        }
    elif '/ann/' in id_:
        return get_annotation(id_)
    else:
        raise NotImplementedError('get_resource({})'.format(id_))


def _get_relation_instances_denormalized(entity1_id, entity2_id, offset, limit):
    # Implementation using copies of mention data in relation
    if entity1_id > entity2_id:
        # Assuming symmetry, relations are stored so that the e1id < e2id
        entity1_id, entity2_id = entity2_id, entity1_id
    sql = '''
SELECT *
FROM   relations
WHERE  __from_data_body_id = %s
AND    __to_data_body_id = %s
OFFSET %s
LIMIT  %s'''
    cursor = execute_sql(sql, (entity1_id, entity2_id, offset, limit), **MDB)
    rows = cursor.fetchall()
    relations = rows_to_dicts(rows, cursor)
    return [_db_relation_to_jsonld(r) for r in relations]


def _get_relation_instances_join(entity1_id, entity2_id, offset, limit):
    # Implementation with double join (slow for large DBs)
    sql = '''
SELECT r.*
FROM   relations AS r,
       mentions AS m1,
       mentions AS m2
WHERE  m1.data @> %s
  AND  m2.data @> %s
  AND  r.from_id = m1.id
  AND  r.to_id = m2.id
OFFSET %s
LIMIT  %s'''
    e1_str = json.dumps({ 'body': { 'id': entity1_id } })
    e2_str = json.dumps({ 'body': { 'id': entity2_id } })
    cursor = execute_sql(sql, (e1_str, e2_str, offset, limit), **MDB)
    rows = cursor.fetchall()
    relations = rows_to_dicts(rows, cursor)
    return [_db_relation_to_jsonld(r) for r in relations]


def _db_mention_to_jsonld(mention):
    """Map from DB format as dict to JSON-LD format."""
    # The DB ID matches JSON-LD ID, rest of JSON-LD fields are stored
    # in the DB in the JSON column data. (see mentiondb/importann.py)
    # Keys starting with '__' are DB-internal.
    jsonld = { 'id': mention['id'] }
    jsonld.update(mention['data'])
    jsonld = { k: v for k, v in jsonld.items() if not k.startswith('__') }
    return jsonld


def _db_relation_to_jsonld(relation):
    """Map from DB format as dict to JSON-LD format."""
    # The DB ID matches JSON-LD ID, from_id and to_id in the DB map to
    # body.from and body.to (resp.), and the rest of the JSON-LD fields
    # are stored in the DB in data column. (see mentiondb/importann.py)
    # Keys starting with '__' are DB-internal.
    jsonld = { 'id': relation['id'] }
    jsonld.update(relation['data'])
    if 'body' not in jsonld:
        jsonld['body'] = {}
    jsonld['body'].update({
        'from': relation['from_id'],
        'to': relation['to_id']
    })
    jsonld = { k: v for k, v in jsonld.items() if not k.startswith('__') }
    return jsonld


def get_entity(id_):
    """Get entity with given id."""
    sql = '''
SELECT * FROM
(
	SELECT DISTINCT ON (LOWER(t2.name)) t2.id AS id, t2.label AS label, t2.name AS name, t2.score AS score FROM 
	(
		SELECT t.oid AS id, c.label AS label, t.text AS name, t.score AS score FROM node_text AS t, node_category AS c WHERE t.oid = c.oid AND t.oid = %s ORDER BY t.text
	)
	AS t2 
) 
AS t3 
ORDER BY score DESC
LIMIT 1'''		
    cursor = execute_sql(sql, (id_, ), **MDB)
    rows = cursor.fetchall()
    if not rows:
        raise KeyError
    assert len(rows) == 1    # id is primary key
    return rows_to_dicts(rows, cursor)[0]


def _expand_references(resource, seen, expanded):
    # recursive implementation of expand_references()
    if isinstance(resource, string_types):
        if resource in seen:
            pass    # already included
        else:
            expanded.append(get_resource(resource))
            seen.add(resource)
    elif isinstance(resource, list):
        for r in resource:
            _expand_references(r, seen, expanded)
    elif isinstance(resource, dict):
        for k, v in resource.iteritems():
            if k in ('id', 'type'):
                pass    # not expanded
            else:
                _expand_references(v, seen, expanded)
    elif isinstance(resource, int):
        return resource
    else:
        raise NotImplementedError('_expand_references({})'.format(
            type(resource)))
    return expanded


def expand_references(resources):
    """Inline references to resources in JSON-LD data."""
    seen = { r['id'] for r in resources if 'id' in r }
    expanded = []
    resources.extend(_expand_references(resources, seen, expanded))
    return resources
