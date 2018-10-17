#!/bin/bash

# Compact obographs as JSON-LD.

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

INDIR="$SCRIPTDIR/../data/obographs"
OUTDIR="$SCRIPTDIR/../data/compacted"

set -eu

mkdir -p "$OUTDIR"

for f in $(find "$INDIR" -maxdepth 1 -name '*.og'); do
    b=$(basename $f .og)
    o="$OUTDIR/$b.jsonld"
    if [[ -s "$o" && "$o" -nt "$f" ]]; then
	echo "Newer $o exists, skipping ..." >&2
    else
	echo "Compacting $f to $o..." >&2
	python "$SCRIPTDIR/compact_og.py" "$f" > "$o"
    fi
done
