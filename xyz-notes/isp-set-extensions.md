##### [Установка ISPmanager 5 Lite/Business на Linux-сервер](https://1cloud.ru/help/linux/ispmanagerinstall)

[источник 1](https://docs.ispsystem.ru/ispmanager-lite/php/ustanovka-rasshireniya-php-vruchnuyu)  
[источник 2](https://docs.ispsystem.ru/ispmanager-lite)

#### Установка расширения для нативной версии PHP

    apt install <имя пакета>

#### Установка для альтернативной версии PHP

Вручную можно установить расширение для альтернативной версии PHP:

    - с помощью пакетного менеджера pecl
    - из исходного кода

##### Установка с помощью пакетного менеджера pecl

Алгоритм установки на примере расширения memcache:

- Установите пакеты:

````
apt install autoconf gcc zlib1g-dev
````

> Обратите внимание! При установке других расширений могут потребоваться дополнительные пакеты.

- Установите расширение:

````
/opt/<директория версии PHP>/bin/pecl install memcache
````

- Подключите расширение для нужной версии PHP:

````
echo extension=<имя библиотеки расширения> >> /opt/<директория версии PHP>/etc/php.d/<наименование расширения>.ini
````

Например:

echo extension=memcache.so >> /opt/<директория версии PHP>/etc/php.d/memcache.ini

#### Установка из исходного кода

- Скачайте и распакуйте архив с исходным кодом расширения:

````
cd /tmp
wget -O env.tar.gz http://pecl.php.net/get/env
tar xzvf env.tar.gz
cd env-0.2.1/
````

- Запустите конфигурирование и сборку расширения:

````
/opt/<директория версии PHP>/bin/phpize
./configure --with-php-config=/opt/<директория версии PHP>/bin/php-config && make && make install
````

- Включите расширение глобально для нужной версии PHP:

````
echo 'extension=env.so' > /opt/<директория версии PHP>/etc/php.d/20-env.ini
````

> Обратите внимание! Сборка расширения может потребовать установки дополнительных пакетов.
