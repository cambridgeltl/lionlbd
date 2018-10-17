#!/bin/bash

# Add mention occurrence counts to JSON-LD data.

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

INDIR="$SCRIPTDIR/../data/compacted"
OUTDIR="$SCRIPTDIR/../data/countsadded"

MAPFILE="/srv/lion/pubtator/id-str-map.json"

set -eu

mkdir -p "$OUTDIR"

for f in $(find "$INDIR" -maxdepth 1 -name '*.jsonld'); do
    b=$(basename $f .jsonld)
    o="$OUTDIR/$b.jsonld"
    if [[ -s "$o" && "$o" -nt "$f" ]]; then
	echo "Newer $o exists, skipping ..." >&2
    else
	echo "Adding counts to $f, storing as $o..." >&2
	python "$SCRIPTDIR/addcounts.py" "$MAPFILE" "$f" > "$o"
    fi
done
