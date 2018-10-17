import os
import psycopg2

from time import time
from collections import OrderedDict
from StringIO import StringIO
from getpass import getuser
from logging import debug, info, error

from psycopg2.extras import execute_batch


DEFAULT_DB = ""
DEFAULT_USER = getuser()


def _getdb(dbname=DEFAULT_DB, user=DEFAULT_USER, **kwargs):
    key = (dbname, user, tuple(sorted(kwargs.items())))    # hashable
    if key not in _getdb.cache:
        connection = psycopg2.connect(dbname=dbname, user=user, password="")
        connection.set_session(deferrable=True)
        cursor = connection.cursor()
        _getdb.cache[key] = (connection, cursor)
    return _getdb.cache[key]
_getdb.cache = {}


def execute_sql(query, variables=None, **kwargs):
    connection, cursor = _getdb(**kwargs)
    debug('execute_sql: {}'.format(cursor.mogrify(query, variables)))
    return cursor.execute(query, variables)


def execute_batched(query, variables=None, **kwargs):
    """Execute queries in batches.

    Note: execution is deferred until invocation of execute_pending() or
    commit(). Execution order is only preserved for identical queries.
    """
    # TODO: differentiate pending by kwargs
    if query not in execute_batched.pending:
        debug('new pending query: {}'.format(query.strip().replace('\n', ' ')))
        execute_batched.pending[query] = []
    execute_batched.pending[query].append(variables)
execute_batched.pending = OrderedDict()


def execute_pending(**kwargs):
    connection, cursor = _getdb(**kwargs)
    pending = execute_batched.pending
    if pending:
        info('executing {} pending queries with {} variables'.format(
            len(pending), sum(len(v) for v in pending.values())))
    for query, varlist in pending.iteritems():
        debug('executing pending: {} x {}'.format(
            len(varlist), query.strip().replace('\n', ' ')))
        execute_batch(cursor, query, varlist)
    execute_batched.pending = OrderedDict()


def _insert_sql(table, columns):
    return '''
INSERT INTO {} ({})
VALUES ({})'''.format(table, ','.join(columns), ','.join(len(columns)*['%s']))


def insert(table, columns, values, **kwargs):
    return execute_sql(_insert_sql(table, columns), values, **kwargs)


def insert_batched(table, columns, values, **kwargs):
    return execute_batched(_insert_sql(table, columns), values, **kwargs)


def _escape_for_copy(s):
    # https://www.postgresql.org/docs/current/static/sql-copy.html:
    # "the following characters must be preceded by a backslash if they
    # appear as part of a column value: backslash itself, newline,
    # carriage return, and the current delimiter character."
    return s.replace('\\', '\\\\').replace('\n', '\\\n').replace('\r', '\\\r').replace('\t', '\\\t')


def _format_for_copy(values):
    return '\t'.join(_escape_for_copy(str(v)) for v in values)


def copy(table, columns, values, **kwargs):
    f = StringIO(_format_for_copy(values))
    connection, cursor = _getdb(**kwargs)
    # TODO: null='None' will not work for the general case as it cannot
    # distinguish between a Null string value and the string "Null".
    cursor.copy_from(f, table, columns=columns, null='None')


def copy_batched(table, columns, values, **kwargs):
    """Insert values using COPY in batches.

    Note: execution is deferred until invocation of copy_pending() or
    commit(). Insertion order is only preserved for identical table/column
    combinations.
    """
    # TODO: differentiate pending by kwargs
    key = (table, tuple(columns))
    if key not in copy_batched.pending:
        info('new pending insert: {} {}'.format(table, tuple(columns)))
        copy_batched.pending[key] = []
    copy_batched.pending[key].append(values)
copy_batched.pending = OrderedDict()


def copy_pending(**kwargs):
    connection, cursor = _getdb(**kwargs)
    pending = copy_batched.pending
    if pending:
        info('copying {} pending rows with {} values'.format(
            len(pending), sum(len(v) for v in pending.values())))
    for (table, columns), vallist in pending.iteritems():
        debug('copying pending: {} x {} {}'.format(
            len(vallist), table, columns))
        f = StringIO('\n'.join(_format_for_copy(v) for v in vallist))
        # TODO: null='None' will not work for the general case as it cannot
        # distinguish between a Null string value and the string "Null".
        cursor.copy_from(f, table, columns=columns, null='None')
    copy_batched.pending = OrderedDict()


def commit(**kwargs):
    execute_pending(**kwargs)
    copy_pending(**kwargs)
    connection, cursor = _getdb(**kwargs)
    connection.commit()


def _insert_files(files, insert_func, options, count=0, recursed=False,
                  **kwargs):
    if not recursed:
        _insert_files.start = time()
    if options.max_documents is not None and count >= options.max_documents:
        return count
    for fn in files:
        if (options.max_documents is not None and
            count >= options.max_documents):
            break
        _, ext = os.path.splitext(os.path.basename(fn))
        if os.path.isfile(fn) and recursed and ext != options.suffix:
            continue
        elif os.path.isfile(fn):
            try:
                insert_func(fn, options, **kwargs)
            except:
                error('failed insert for {}'.format(fn))
                raise
            count += 1
        elif os.path.isdir(fn):
            if options.recurse:
                df = [os.path.join(fn, n) for n in os.listdir(fn)]
                count = _insert_files(df, insert_func, options, count, True,
                                      **kwargs)
            else:
                info('skipping directory {}'.format(fn))
        if count % 100 == 0:
            elapsed = time() - _insert_files.start
            info('processed {} in {:.1f}s ({:.1f}/s) ...'.format(
                count, elapsed, 1.*count/elapsed))
        if options.commit_every < 2 or count % options.commit_every == 0:
            if options.commit_every > 100:
                info('committing ...')
            commit(**kwargs)
    if not recursed:
        commit(**kwargs)
    return count
_insert_files.start = None


def insert_files(files, insert_func, options, **kwargs):
    return _insert_files(files, insert_func, options, **kwargs)
