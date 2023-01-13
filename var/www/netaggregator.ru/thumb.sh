#!/bin/bash

ROOT_DIR=$(dirname "$(readlink -e "$0")")
WORK_DIR=$ROOT_DIR/nuxt/static/dcover/default
SRC=$WORK_DIR/template/$1.png
DST=$WORK_DIR/thumb/$1.png

magick convert $SRC -resize 42% $DST;
pngcrush -s -reduce $DST $DST;

chown -R www-data:www-data $WORK_DIR;
./webp-convert.sh $WORK_DIR
