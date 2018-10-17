#!/bin/bash

# Convert preprocessed datasets to obographs.

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

CONVERTER="$SCRIPTDIR/../obographs/bin/ogger"
CONVERTERURL="https://github.com/geneontology/obographs"

INDIR="$SCRIPTDIR/../data/preprocessed"
OUTDIR="$SCRIPTDIR/../data/obographs"

set -eu

if [ ! -e "$CONVERTER" ]; then
    cat <<EOF >&2
Error: $CONVERTER not found (available from $CONVERTERURL)"
Try the following:

    git clone https://github.com/geneontology/obographs.git
    cd obographs
    mvn install

EOF
    exit 1
fi

mkdir -p "$OUTDIR"

for f in $(find "$INDIR" -maxdepth 1 -name '*.obo'); do
    b=$(basename $f .obo)
    o="$OUTDIR/$b.og"
    if [[ -s "$o" && "$o" -nt "$f" ]]; then
	echo "Newer $o exists, skipping ..." >&2
    else
	echo "Converting $f to $o..." >&2
	OBOGRAPHS_MEMORY="20G" "$CONVERTER" "$f" > "$o"
    fi
done
