#!/bin/bash

set -eu

if [[ $# -gt 0 && $1 != -* ]]; then
    db="$1"
    shift
else
    db="lion-dev"
fi

echo "Running ADD CONSTRAINTs on documents"
time psql "$db" <<EOF
ALTER TABLE documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
EOF
echo "Done running ADD CONSTRAINTs on documents"$'\n'

echo "Running ADD CONSTRAINTs on mentions"
time psql "$db" <<EOF
ALTER TABLE mentions
    ADD CONSTRAINT mentions_pkey PRIMARY KEY (id);

ALTER TABLE mentions
    ADD CONSTRAINT mentions_document_id_fkey FOREIGN KEY (document_id)
    REFERENCES documents (id);
EOF
echo "Done running ADD CONSTRAINTs on mentions"$'\n'

echo "Running ADD CONSTRAINTs on relations"
time psql "$db" <<EOF
ALTER TABLE relations
    ADD CONSTRAINT relations_pkey PRIMARY KEY (id);

ALTER TABLE relations
    ADD CONSTRAINT relations_document_id_fkey FOREIGN KEY (document_id)
    REFERENCES documents (id);

ALTER TABLE relations
    ADD CONSTRAINT relations_from_id_fkey FOREIGN KEY (from_id)
    REFERENCES mentions (id) DEFERRABLE;

ALTER TABLE relations
    ADD CONSTRAINT relations_to_id_fkey FOREIGN KEY (to_id)
    REFERENCES mentions (id) DEFERRABLE;
EOF
echo "Done running ADD CONSTRAINTs on relations"$'\n'

echo "Running CREATE INDEXs on mentions"
time psql "$db" <<EOF
CREATE INDEX idx_mentions_document_id ON mentions (document_id);
CREATE INDEX idx_mentions_data ON mentions USING GIN (data);
EOF
echo "Done running CREATE INDEXs on mentions"$'\n'

echo "Running CREATE INDEXs on relations"
time psql "$db" <<EOF
CREATE INDEX idx_relations_document_id ON relations (document_id);
CREATE INDEX idx_relations_from_id ON relations (from_id);
CREATE INDEX idx_relations_to_id ON relations (to_id);
CREATE INDEX idx_relations_data ON relations USING GIN (data);
EOF
echo "Done running CREATE INDEXs on relations"$'\n'

if [[ $# -gt 0 && "$1" == "-d" ]]; then
    echo "Running CREATE INDEXs for denormalized columns"
    time psql "$db" <<EOF
CREATE INDEX idx_relations_from_to_data_body_id ON relations (
    __from_data_body_id, __to_data_body_id
);
EOF
    echo "Done running CREATE INDEXs for denormalized columns"$'\n'
fi
