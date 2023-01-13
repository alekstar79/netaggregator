#!/bin/sh

NOW=$(date +'%a %b %e %H:%M:%S %Z %Y')
DESC='Start to concat cert with key'

# base directory
BASE=/etc/letsencrypt/live/netaggregator.ru
DIR=$(dirname "$0")

# Constant redirection of output to the log file
exec 1>> $DIR/concat.log

# A renew action
# see https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx
# see https://certbot.eff.org/docs/using.html
# certbot renew

# concat files
# shellcheck disable=SC2046
cat $BASE/fullchain.pem $BASE/privkey.pem > $DIR/cert.pem

echo $DESC
echo $NOW
echo ""
