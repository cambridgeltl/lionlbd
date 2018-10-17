#!/bin/bash

db=${1:-lion-neoplasms}
dir=${2:-/srv/lion/pubtator/data/converted/neoplasms/}
max=${3:-100000000}

yes | ./reset.sh "$db" -d

echo "Import text start ..."
time python importtext.py -n "$db" -m "$max" -r "$dir"
echo "Import text done."$'\n'

echo "Import ann start ..."
time python importann.py -n "$db" -m "$max" -d -r "$dir"
echo "Import ann done."$'\n'

echo "Create indices start ..."
time ./createindices.sh "$db" -d
echo "Create indices done."$'\n'

./getstatistics.sh "$db"

echo $'\n'"REBUILD DONE."$'\n'
