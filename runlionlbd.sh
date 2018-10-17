#!/bin/bash

# TODO activate relevant virtual environment

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

python "$SCRIPTDIR"/runlionlbd.py
