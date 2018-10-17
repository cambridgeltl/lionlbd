#!/bin/bash

# http://stackoverflow.com/a/246128
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

db=${1:-lion-dev}

read -p "Really DROP TABLEs from $db and recreate empty? [y/n] " answer
if [[ $answer != "y" && $answer != 'Y' ]]; then
    echo "Exiting without changes."
    exit
fi

psql "$db" <<EOF
DROP TABLE documents CASCADE;
DROP TABLE mentions CASCADE;
DROP TABLE relations CASCADE;
EOF

. $SCRIPTDIR/createtables.sh "$@"
