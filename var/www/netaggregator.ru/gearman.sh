#!/bin/bash

# https://blog.lysender.com/2016/06/install-gearman-module-to-ubuntu-xenial-with-php-7
# Install additional packages for compiling
apt -y install wget unzip re2c libgearman-dev

# Install from source
mkdir -p /tmp/install
cd /tmp/install || exit
wget https://github.com/wcgallego/pecl-gearman/archive/master.zip
unzip master.zip
cd pecl-gearman-master || exit
phpize
./configure
make install
echo "extension=gearman.so" > /etc/php/7.4/mods-available/gearman.ini
phpenmod -v ALL -s ALL gearman
rm -rf /tmp/install/pecl-gearman-master
rm /tmp/install/master.zip

# Verify if module is really installed
php -m | grep gearman
