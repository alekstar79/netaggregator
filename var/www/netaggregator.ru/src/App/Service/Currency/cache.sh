#!/bin/sh

set -e

mkdir -p /var/cache/cbr
cd /var/cache/cbr

# see https://askubuntu.com/questions/1083537/how-do-i-properly-install-a-systemd-timer-and-service
# see https://habr.com/ru/company/ruvds/blog/512868

# see https://www.cbr-xml-daily.ru
# for file in daily_utf8.xml daily.xml daily_eng.xml daily_eng_utf8.xml daily_json.js latest.js
# do wget --timestamping --no-verbose https://cbr-xml-daily.ru/$file
# done 2>&1 | xargs -I{} logger --tag $0 --id=$$ "{}"

wget --no-verbose -O XML_daily.xml https://cbr.ru/scripts/XML_daily.asp
