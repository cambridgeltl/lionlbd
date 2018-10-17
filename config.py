from getpass import getuser

NEO4J_USERNAME=""
NEO4J_PASSWORD=""

# Hostname of SQL database
SQL_HOST = ''

# Username to connect to SQL database
SQL_USERNAME = ''

# Password to connect to SQL database
SQL_PASSWORD = ''

# Database to connect to on SQL database
SQL_DATABASE = ''

# Database name to connect to mention SQL database
MENTION_DB_DBNAME = ''

# Username to connect to mention SQL database
MENTION_DB_USER = ''

# Password to connect to mention SQL database
MENTION_DB_PASSWORD = ''

# Credentials to connect to mention SQL database
MENTION_DB_CREDENTIALS = {
    'dbname': MENTION_DB_DBNAME,
    'user': MENTION_DB_USER,
    'password': MENTION_DB_PASSWORD
}

MENTION_DB_DENORMALIZED = True

# Database name to connect to entity SQL database
ENTITY_DB_DBNAME = ''

# Username to connect to entity SQL database
ENTITY_DB_USER = ''

# Password to connect to entity SQL database
ENTITY_DB_PASSWORD = ''

# Credentials to connect to entity SQL database
ENTITY_DB_CREDENTIALS = {
    'dbname': ENTITY_DB_DBNAME,
    'user': ENTITY_DB_USER,
    'password': ENTITY_DB_PASSWORD
}
