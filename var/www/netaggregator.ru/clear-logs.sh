#!/bin/bash

# https://question-it.com/questions/649024/komanda-rekursivno-ochistit-mnogo-fajlov

# find ~/.pm2/logs/ -type f -ctime +7 -exec rm {} \;
# find ~/.pm2/logs/ -type f -exec sh -c '> "$1"' _ {} \;

find ~/.pm2/logs/ -type f -name '*.log' -exec sh -c '> "$1"' _ {} \;
