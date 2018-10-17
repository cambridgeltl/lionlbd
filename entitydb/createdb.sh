#!/bin/bash

set -eu

if [[ $# -gt 0 && $1 != -* ]]; then
    db="$1"
    shift
else
    db="lion-ent"
fi

createdb "$db"

psql "$db" <<EOF
CREATE TABLE entities (
    id TEXT NOT NULL,
    data JSONB NOT NULL
);
EOF
