[composer update](https://coderteam.ru/blog/obnovlyaemsya-do-composer-2-na-ubuntu)

#### COMPOSER UPDATE

- Используем:
````
composer self-update --2
````
- Если видим ошибку: Command "self-update" is not defined
````
which composer

````
- Вывод, например:
````
/usr/bin/composer
````
- запоминаем путь и создаем файл
````
nano cs.sh
````
с содержимым
````
#!/bin/sh

EXPECTED_CHECKSUM="$(wget -q -O - https://composer.github.io/installer.sig)"
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
ACTUAL_CHECKSUM="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"

if [ "$EXPECTED_CHECKSUM" != "$ACTUAL_CHECKSUM" ]
then
    >&2 echo 'ERROR: Invalid installer checksum'
    rm composer-setup.php
    exit 1
fi

php composer-setup.php --quiet --install-dir /usr/bin --filename composer
RESULT=$?
rm composer-setup.php
exit $RESULT
````
где --install-dir /usr/bin --filename composer - путь до composer, это /usr/bin и имя файла composer, запускаем
````
bash cs.sh
````
- проверяем
````
composer
````
