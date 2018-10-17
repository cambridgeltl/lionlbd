#!/bin/bash

# Preprocess downloaded datasets for entity DB.

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

INDIR="$SCRIPTDIR/../data/original-data"
OUTDIR="$SCRIPTDIR/../data/preprocessed"

set -eu

mkdir -p "$OUTDIR"

for f in $(find "$INDIR" -maxdepth 1 -name '*.obo'); do
    o="$OUTDIR/"$(basename $f)
    if [[ -s "$o" && "$o" -nt "$f" ]]; then
	echo "Newer $o exists, skipping ..." >&2
    else
	echo "Preprocessing $f to $o ..." >&2
	python "$SCRIPTDIR/preprocess_obo.py" "$f" > "$o"
    fi
done
