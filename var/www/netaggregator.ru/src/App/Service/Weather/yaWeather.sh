#!/bin/bash

# see https://www.linux.org.ru/forum/development/14960640

UA="Mozilla/5.0 (Windows NT 6.1; rv:94.0) Gecko/20100101 Firefox/94.0"
URL="https://export.yandex.ru/bar/reginfo.xml?region=11070"

curl -s -A "$UA" $URL | grep -m 1 "<temperature class_name" | awk -F ">" '{ print $2 }' | sed 's/[^0-9.-]//g'
