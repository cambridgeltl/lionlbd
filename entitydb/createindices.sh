#!/bin/bash

set -eu

if [[ $# -gt 0 && $1 != -* ]]; then
    db="$1"
    shift
else
    db="lion-end"
fi

# Key constraints: entities

psql "$db" <<EOF
ALTER TABLE entities
    ADD CONSTRAINT entities_pkey PRIMARY KEY (id);
EOF
