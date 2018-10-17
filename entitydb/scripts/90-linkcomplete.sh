#!/bin/bash

# Link completed version of entity data.

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -eu

if [[ ! -e "$SCRIPTDIR/../data/completed" ]]; then
    ln -s "$SCRIPTDIR/../data/countsadded" "$SCRIPTDIR/../data/completed"
fi
