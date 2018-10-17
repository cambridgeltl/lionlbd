#!/bin/bash

# Note: does not create indices, run createindices.sh for that.
# For best performance, insert data before creating indices.

set -eu

if [[ $# -gt 0 && $1 != -* ]]; then
    db="$1"
    shift
else
    db="lion-dev"
fi

# createdb if it doesn't exist (from https://stackoverflow.com/a/36591842)
psql postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$db'" \
    | egrep -q 1 \
    || createdb "$db"

psql "$db" <<EOF
CREATE TABLE documents (
    id TEXT NOT NULL,
    text TEXT NOT NULL
);
EOF

psql "$db" <<EOF
CREATE TABLE mentions (
    id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    data JSONB NOT NULL
);
EOF

psql "$db" <<EOF
CREATE TABLE relations (
    id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    data JSONB NOT NULL
);
EOF

# Denormalized columns (optional)

if [[ $# -gt 0 && "$1" == "-d" ]]; then
    psql "$db" <<EOF
ALTER TABLE relations ADD COLUMN __from_data_body_id TEXT DEFAULT NULL;
ALTER TABLE relations ADD COLUMN __to_data_body_id TEXT DEFAULT NULL;
EOF
fi
