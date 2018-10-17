#!/bin/bash

set -eu

# Copy data->body->id from "from" and "to" mentions into relation data.

# w/1K docs : UPDATE 2577, real 0m0.326s, before 32M/var/lib/postgresql/9.5/main/base, after 35M /var/lib/postgresql/9.5/main/base
# w/10K docs: UPDATE 259358, real 0m42.824s, before 294M/var/lib/postgresql/9.5/main/base, after 617M /var/lib/postgresql/9.5/main/base
# w/100K docs: UPDATE 2845920, real 21m41.156s, before 2.9G/var/lib/postgresql/9.5/main/base, after 6.2G /var/lib/postgresql/9.5/main/base
# w/200K docs: UPDATE 5719295, real 55m25.189s, before 5.8G/var/lib/postgresql/9.5/main/base, after 13G/var/lib/postgresql/9.5/main/base

echo "Running ALTER TABLEs and UPDATEs on relations" >&2
time psql lion-dev <<EOF
ALTER TABLE relations ADD COLUMN __from_data_body_id TEXT DEFAULT NULL;
ALTER TABLE relations ADD COLUMN __to_data_body_id TEXT DEFAULT NULL;

UPDATE relations r
SET    __from_data_body_id = f.data->'body'->>'id',
       __to_data_body_id = t.data->'body'->>'id'
FROM   mentions f, mentions t
WHERE  r.from_id = f.id
AND    r.to_id = t.id;
EOF

echo "Running CREATE INDEXs on relations" >&2
time psql lion-dev <<EOF
CREATE INDEX idx_relations_from_to_data_body_id ON relations (
    __from_data_body_id, __to_data_body_id
);
EOF
