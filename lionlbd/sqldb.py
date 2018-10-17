from __future__ import print_function
from __future__ import absolute_import

import psycopg2

from logging import debug, info

from config import SQL_DATABASE, SQL_USERNAME, SQL_PASSWORD


def execute_sql(query, variables=None, **kwargs):
    cursor = get_cursor(**kwargs)
    debug('execute_sql:\n{}'.format(cursor.mogrify(query, variables)))
    debug('query_plan:\n{}'.format(query_plan(query, variables, cursor)))
    cursor.execute(query, variables)
    return cursor


def query_plan(query, variables, cursor):
    """Return string explaining plan for executing given query."""
    cursor.execute('EXPLAIN '+cursor.mogrify(query, variables))
    return '\n'.join([r[0] for r in cursor.fetchall()])


def get_connection(**kwargs):
    """Return connection to SQL DB."""
    return _getdb(*args, **kwargs)


def get_cursor(**kwargs):
    """Return cursor using connection to SQL DB."""
    connection = _getdb(**kwargs)
    return connection.cursor()


def row_to_dict(row, cursor):
    """Return dicts keyed by column names with values from row."""
    colnames = [d[0] for d in cursor.description]
    return dict(zip(colnames, row))


def rows_to_dicts(rows, cursor):
    """Return list of dicts keyed by column names with values from rows."""
    colnames = [d[0] for d in cursor.description]
    dicts = [dict(zip(colnames, row)) for row in rows]
    return dicts


def _getdb(dbname=SQL_DATABASE, user=SQL_USERNAME, password=SQL_PASSWORD,
           **kwargs):
    key = (dbname, user, password, tuple(sorted(kwargs.items())))    # hashable
    if key not in _getdb.cache:
        connection = psycopg2.connect(dbname=dbname, user=user,
                                      password=password, **kwargs)
        _getdb.cache[key] = connection
    return _getdb.cache[key]
_getdb.cache = {}
