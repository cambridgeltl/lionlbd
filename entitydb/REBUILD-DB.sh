#!/bin/bash

set -eu

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

db=${1:-lion-ent}
dir=${2:-"$SCRIPTDIR/data/completed"}

yes | ./resetdb.sh "$db" -d

echo "Import ent start ..."
time python importent.py -n "$db" "$dir/"*.jsonld
echo "Import ent done."

echo "Create indices start ..."
time ./createindices.sh "$db"
echo "Create indices done."
