#!/bin/bash

# https://www.dmosk.ru/miniinstruktions.php?mini=postgresql-dump
# https://askdev.ru/q/kak-peredat-parol-v-damp-pg-8183

export DB=postgresql://alekstar79:iPhone5s@127.0.0.1:5432/app_db
path=$(dirname "$(readlink -e "$0")")

find "$path" \( -name "*-1[^5].*" -o -name "*-[023]?.*" \) -ctime +61 -delete
pg_dump --dbname=$DB | gzip > "$path"/pgsql_"$(date "+%Y-%m-%d")".sql.gz

unset DB
