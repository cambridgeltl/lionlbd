#!/bin/bash

# Rebuild entity data from sources.

set -eu

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for script in "$SCRIPTDIR/scripts/"[0-9][0-9]*.sh; do
    echo "Running $script ..." >&2
    "$script"
done
