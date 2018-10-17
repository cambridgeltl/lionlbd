#!/bin/bash

# http://stackoverflow.com/a/246128
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -eu

db=${1:-lion-ent}

read -p "Really DELETE DB $db and recreate empty DB? [y/n] " answer
if [[ $answer != "y" && $answer != 'Y' ]]; then
    echo "Exiting without changes."
    exit
fi

dropdb "$db" || true    # don't exit on failed drop

. "$SCRIPTDIR/createdb.sh" "$@"
