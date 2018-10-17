#!/bin/bash

set -eu

DATADIR=${1:-sample-data}

python importtext.py -r $DATADIR
python importann.py -r $DATADIR
