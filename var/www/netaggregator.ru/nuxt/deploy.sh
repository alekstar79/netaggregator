#!/bin/bash

# https://losst.ru/rsync-primery-sinhronizatsii
# https://habr.com/ru/company/ruvds/blog/471092

NUXT=$(dirname "$(readlink -e "$0")")
ROOT=$(dirname "${NUXT}")

SOURCE=$NUXT/.nuxt/dist/client
TARGET=$NUXT/static/app

printf "\nDeploy started\n\n"
echo "SOURCE: $SOURCE"
echo "TARGET: $TARGET"
printf "\n"

# clean
/bin/rm -rf "${TARGET:?}"/*
echo "Removing accomplished"

# copy
/bin/cp -rT "${SOURCE}" "${TARGET}"
echo "Copying accomplished"

# convert
if [ -d "${TARGET}"/icons ]; then
  "${ROOT}"/webp-convert.sh "${TARGET}"/icons
  echo "Icons converted"
fi

# rsync -r -t -p -o -v --progress --delete -l -s /var/www/cloudvps.loc/var/www/netaggregator.ru/ ubuntu@130.61.18.130:/var/www/netaggregator.ru/
# rsync -rt --delete -s /var/www/cloudvps.loc/var/www/netaggregator.ru/nuxt/node_modules/ root@130.61.18.130:/var/www/netaggregator.ru/nuxt/node_modules
rsync -rt --delete -s "${NUXT}"/static/app/ root@130.61.18.130:/var/www/netaggregator.ru/nuxt/static/app
rsync -rt --delete -s "${NUXT}"/.nuxt/ root@130.61.18.130:/var/www/netaggregator.ru/nuxt/.nuxt

# printf "\nDeploy comleted\n\n"
