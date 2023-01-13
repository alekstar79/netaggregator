#!/bin/bash

PATH=$(dirname "$(readlink -e "$0")")

/usr/bin/node $PATH/weather-update.mjs "$1"
