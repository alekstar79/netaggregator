#!/bin/bash

NUXT=$(dirname "$(readlink -e "$0")")
ROOT=$(dirname "${NUXT}")

SOURCE=$NUXT/.nuxt/dist/client
TARGET=$NUXT/static/app

printf "\nStarted\n\n"
echo "SOURCE: $SOURCE"
echo "TARGET: $TARGET"
printf "\n"

# clean
/bin/rm -rf "${TARGET:?}/*"
echo "Removing accomplished"

# copy
/bin/cp -rT "${SOURCE}" "${TARGET}"
echo "Copying accomplished"

# convert
if [ -d "${TARGET}"/icons ]; then
  "${ROOT}"/webp-convert.sh "${TARGET}"/icons
  echo "Icons converted"
fi

printf "\nComleted\n\n"
