[CLI (Command Line Interface)](https://help.ubuntu.ru/wiki/%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%BD%D0%B0%D1%8F_%D1%81%D1%82%D1%80%D0%BE%D0%BA%D0%B0)

#### PHP-CPP [documentation](http://www.php-cpp.com/documentation/install)

- sudo apt install php7.x-dev

````
git clone https://github.com/CopernicaMarketingSoftware/PHP-CPP.git
cd PHP-CPP

# make && make install
````

#### Boost [getting started](https://www.boost.org/doc/libs/1_73_0/more/getting_started/unix-variants.html)

[How to install Boost](https://stackoverflow.com/a/41272796)

- sudo apt install build-essential g++ python-dev autotools-dev libicu-dev libbz2-dev

````
wget -O boost_1_78_0.tar.gz https://sourceforge.net/projects/boost/files/boost/1.78.0/boost_1_78_0.tar.gz/download
tar xzvf boost_1_78_0.tar.gz
cd boost_1_78_0/

./bootstrap.sh --prefix=/usr/local
````

##### Simple install:
````
# ./b2 && ./b2 --without-mpi --without-graph_parallel install
````

##### If you want MPI then you need to set the flag in the user-config.jam file:
````
user_config=`find $PWD -name user-config.jam`
echo "using mpi ;" >> $user_config
````

Find the maximum number of physical cores:
````
n=`cat /proc/cpuinfo | grep "cpu cores" | uniq | awk '{print $NF}'`
````

And install boost in parallel:
````
# ./b2 && ./b2 --with=all -j $n install
````

Assumes you have /usr/local/lib setup already. if not, you can add it to your LD LIBRARY PATH:
````
# sh -c 'echo "/usr/local/lib" >> /etc/ld.so.conf.d/local.conf'
````

Reset the ldconfig:
````
# ldconfig
````

#### Intl dtpg [repos](https://devhub.io/repos/ksimka-intl_dtpg)

- git clone https://github.com/ksimka/intl_dtpg.git

````
cd intl_dtpg

phpize
./configure --with-php-config=/usr/bin/php-config7.4 && make && make install

echo extension=intl_dtpg.so >> /etc/php/7.4/mods-available/intl_dtpg.ini
# ln -s /etc/php/7.4/mods-available/intl_dtpg.ini /etc/php/7.4/fpm/conf.d/20-intl_dtpg.ini
# ln -s /etc/php/7.4/mods-available/intl_dtpg.ini /etc/php/7.4/cli/conf.d/20-intl_dtpg.ini

for isp-manager

echo extension=intl_dtpg.so >> /opt/php74/etc/mods-available/intl_dtpg.ini
# ln -s /opt/php74/etc/mods-available/intl_dtpg.ini /opt/php74/etc/php.d/20-intl_dtpg.ini
````

#### GRPC (for google/cloud-dialogflow)

- pecl install grpc

````
echo extension=grpc.so >> /etc/php/7.4/mods-available/grpc.ini
# ln -s /etc/php/7.4/mods-available/grpc.ini /etc/php/7.4/fpm/conf.d/20-grpc.ini
# ln -s /etc/php/7.4/mods-available/grpc.ini /etc/php/7.4/cli/conf.d/20-grpc.ini

for isp-manager

echo extension=grpc.so >> /opt/php74/etc/mods-available/grpc.ini
# ln -s /opt/php74/etc/mods-available/grpc.ini /opt/php74/etc/php.d/20-grpc.ini
````

#### Protobuf (for google/cloud-dialogflow)

- pecl install protobuf

````
echo extension=protobuf.so >> /etc/php/7.4/mods-available/protobuf.ini
# ln -s /etc/php/7.4/mods-available/protobuf.ini /etc/php/7.4/fpm/conf.d/20-protobuf.ini
# ln -s /etc/php/7.4/mods-available/protobuf.ini /etc/php/7.4/cli/conf.d/20-protobuf.ini

for isp-manager

echo extension=protobuf.so >> /opt/php74/etc/mods-available/protobuf.ini
# ln -s /opt/php74/etc/mods-available/protobuf.ini /opt/php74/etc/php.d/20-protobuf.ini
````

#### libuv [github](https://github.com/libuv/libuv)

- git clone https://github.com/libuv/libuv.git

````
cd libuv

sh autogen.sh
# ./configure && make && make install
````

#### php-uv

- git clone https://github.com/bwoebi/php-uv.git

````
cd php-uv

phpize
# ./configure --with-php-config=/usr/bin/php-config7.4 && make && make install

echo extension=uv.so >> /etc/php/7.4/mods-available/uv.ini
# ln -s /etc/php/7.4/mods-available/uv.ini /etc/php/7.4/fpm/conf.d/20-uv.ini
# ln -s /etc/php/7.4/mods-available/uv.ini /etc/php/7.4/cli/conf.d/20-uv.ini

for isp-manager

echo extension=uv.so >> /opt/php74/etc/mods-available/uv.ini
# ln -s /opt/php74/etc/mods-available/uv.ini /opt/php74/etc/php.d/20-uv.ini
````

#### PostgreSQL

> [Install and use postgresql](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04-ru)  
> [Password authentication failed](https://stackoverflow.com/questions/7695962/postgresql-password-authentication-failed-for-user-postgres)  
> [Dump DB 1](https://shra.ru/2017/01/perenos-bazy-postgresql-s-servera-na-server)  
> [Dump DB 2](https://server-gu.ru/postgres-dump)

- sudo apt install postgresql postgresql-contrib  
- sudo -u postgres psql -c "ALTER USER alekstar79 PASSWORD 'iPhone5s';"


#### MongoDB

- sudo apt install mongodb-server  
- systemctl enable mongodb  
- systemctl status mongodb

````
pecl install mongodb

echo extension=mongodb.so >> /etc/php/7.4/mods-available/mongodb.ini
# ln -s /etc/php/7.4/mods-available/mongodb.ini /etc/php/7.4/fpm/conf.d/20-mongodb.ini
# ln -s /etc/php/7.4/mods-available/mongodb.ini /etc/php/7.4/cli/conf.d/20-mongodb.ini

for isp-manager

echo extension=mongodb.so >> /opt/php74/etc/mods-available/mongodb.ini
# ln -s /opt/php74/etc/mods-available/mongodb.ini /opt/php74/etc/php.d/20-mongodb.ini
````

#### Gearman [github](https://github.com/php/pecl-networking-gearman)  

- sudo apt install libgearman-dev gearman-job-server gearman-tools  
- git clone https://github.com/php/pecl-networking-gearman.git

````
cd pecl-networking-gearman

phpize
# ./configure --with-php-config=/usr/bin/php-config7.4 && make && make install

echo extension=gearman.so >> /etc/php/7.4/mods-available/gearman.ini
# ln -s /etc/php/7.4/mods-available/gearman.ini /etc/php/7.4/fpm/conf.d/20-gearman.ini
# ln -s /etc/php/7.4/mods-available/gearman.ini /etc/php/7.4/cli/conf.d/20-gearman.ini

for isp-manager

echo extension=gearman.so >> /opt/php74/etc/mods-available/gearman.ini
# ln -s /opt/php74/etc/mods-available/gearman.ini /opt/php72/etc/php.d/20-gearman.ini
````

#### php-imagik [github](https://github.com/Imagick/imagick)  

> [phpimagick.com](https://www.phpimagick.com)  
> [obu4alka](https://obu4alka.ru/ustanovka-imagick-dlya-php-na-ubuntu-server.html)  

If you need to compile Imagick from source, first you should install [ImageMagick](https://github.com/ImageMagick/ImageMagick)

- sudo apt install imagemagick php7.x-imagick  
- phpenmod imagick  
- systemctl restart {nginx,php7.4-fpm}
