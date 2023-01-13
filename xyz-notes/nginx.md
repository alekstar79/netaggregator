###### links

[502-bad-gateway](https://losst.ru/chto-znachit-502-bad-gateway-nginx)  
[also see](https://gist.github.com/philipstanislaus/654adafad91efb6de230845b5bdeae61)  
[config-generator](https://www.reg.ru/web-tools/nginx-config-generator)

Резервная копия NGINX конфигурации:
````
tar -czvf nginx_$(date +'%F_%H-%M-%S').tar.gz nginx.conf sites-available/ sites-enabled/ common/ modules-enabled/
````

Ключи Диффи-Хеллмана:
````
openssl dhparam -out /etc/nginx/dhparam.pem 2048
````

Директория хранения ACME-challenge (для Let's Encrypt):
````
mkdir -p /var/www/_letsencrypt
chown www-data /var/www/_letsencrypt
````

Закомментируйте директивы, связанные с SSL в конфигурации:
````
sed -i -r 's/(listen .*443)/\1; #/g; s/(ssl_(certificate|certificate_key|trusted_certificate) )/#;#\1/g; s/(server \{)/\1\n    ssl off;/g' /etc/nginx/sites-available/netaggregator.ru.conf
````

Перезагрузите свой NGINX сервер:
````
sudo nginx -t && sudo systemctl reload nginx
````

Получите SSL сертификат Let's Encrypt используя Certbot:
````
certbot certonly --webroot -d netaggregator.ru --email alekstar79@yandex.ru -w /var/www/_letsencrypt -n --agree-tos --force-renewal
````

Раскомментируйте директивы, связанные с SSL в конфигурации:
````
sed -i -r -z 's/#?; ?#//g; s/(server \{)\n    ssl off;/\1/g' /etc/nginx/sites-available/netaggregator.ru.conf
````

Перезагрузите свой NGINX сервер:
````
sudo nginx -t && sudo systemctl reload nginx
````

Настройте Certbot, чтобы перезагрузить NGINX, когда сертификаты успешно обновятся:
````
echo -e '#!/bin/bash\nnginx -t && systemctl reload nginx' | sudo tee /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh
sudo chmod a+x /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh
````


### Install NGINX

- Install software-properties-common package to give us add-apt-repository package:
````
sudo apt install -y software-properties-common python-software-properties
````
- Install latest nginx version from community maintained ppa
````
sudo add-apt-repository ppa:nginx/stable
````
- Update packages after adding ppa
````
sudo apt update
````
- Install nginx
````
sudo apt install -y nginx
````
- Check status
````
sudo service nginx status
````
- Start nginx if it is not already running
````
sudo service nginx start
````
   
> At this point you should have NGINX up and running, open http://localhost
> on your browser and you should see a welcome page from NGINX

#### Reinstall NGINX

[source](https://coderteam.ru/blog/udalenie-i-pereustanovka-nginx)

- удаляем nginx и все связанные пакеты
````
sudo apt-get remove nginx*
````

- удаляем рабочие директории и логи
````
sudo rm -rf /etc/nginx/ /usr/sbin/nginx /usr/share/man/man1/nginx.1.gz
````

- удаляем остатки nginx из базы apt
````
sudo apt-get --purge autoremove nginx && sudo dpkg --purge nginx
````

- устанавливаем nginx заново с чистыми конфигами
````
sudo apt-get -o DPkg::options::=--force-confmiss --reinstall install nginx
````

#### Install PHP7.2 and PHP7.2-FPM

- check what is the latest PHP version supplied by UBUNTU
````
sudo apt-cache show php
````
> You should get something like below where 'Version' would tell us the latest version available in my case is 7.0
>  
> Package: php  
> Architecture: all  
> Version: 1:7.0+35ubuntu6.1  
> Priority: optional  
> Section: php  
> Source: php-defaults (35ubuntu6.1)  
> Origin: Ubuntu  
> Maintainer: Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>  
> Original-Maintainer: Debian PHP Maintainers <pkg-php-maint@lists.alioth.debian.org>  
> Bugs: https://bugs.launchpad.net/ubuntu/+filebug  
> Installed-Size: 11  
> Depends: php7.0  
> Filename: pool/main/p/php-defaults/php_7.0+35ubuntu6.1_all.deb  
> Size: 2862  
> MD5sum: c5db88de62d1dcb9679e9ae328d7c94a  
> SHA1: 49d3f1d1850ac867fedf6fbc5635c33227dfde53  
> SHA256: 0b1ccf22b958163669e677d6f660888eec7951d6eda3ae0f49a8e3409773cd87  
> Description: server-side, HTML-embedded scripting language (default)  
> Description-md5: b955c03ceec2872c327e77278c943d6a  
> Phased-Update-Percentage: 90  
> Supported: 5y  

- Add Repository which gives us the latest php version 7.2
````
sudo add-apt-repository ppa:ondrej/php
````
- Update packages after adding ppa
````
sudo apt update
````
- Lets now check what is the latest PHP version available now after the repository is added
````
sudo apt-cache show php
````

> You should now get something like below and notice the latest version is changed i.e Version: 1:7.2+60+ubuntu16.04.1+deb.sury.org+1
>  
> Package: php  
> Source: php-defaults (60+ubuntu16.04.1+deb.sury.org+1)  
> Priority: optional  
> Section: php  
> Installed-Size: 12  
> Maintainer: Debian PHP Maintainers <pkg-php-maint@lists.alioth.debian.org>  
> Architecture: all  
> Version: 1:7.2+60+ubuntu16.04.1+deb.sury.org+1  
> Depends: php7.2  
> Filename: pool/main/p/php-defaults/php_7.2+60+ubuntu16.04.1+deb.sury.org+1_all.deb  
> Size: 5654  
> MD5sum: 1089c40cb9763d667b1ba2bfb0b6b2c4  
> SHA1: d34c619a14854708f43ae432daf5fe5e73737072  
> SHA256: 6b2b24f7232f980818a688f66fd3f9759ac9d1eb0466dee30faa5b2f4c2b36df  
> Description: server-side, HTML-embedded scripting language (default)  
> Description-md5: 2ccdfdb6b598dc9bdf5572917b808dcb  

- Lets now install php7.2 and some important modules which we will need.
````
sudo apt install php7.2-cli php7.2-fpm php7.2-curl php7.2-gd php7.2-mysql php7.2-pgsql php7.2-mbstring zip unzip
sudo apt install php7.4-cli php7.4-fpm php7.4-curl php7.4-gd php7.4-mbstring zip unzip
````

Some modules require you to authenticate installation and prompt you for some information such as:
    
    Please select the geographic area in which you live. Subsequent configuration questions will narrow this down  
    by presenting a list of cities, representing the time zones in which they are located.
    
    1. Africa   3. Antarctica  5. Arctic  7. Atlantic  9. Indian    11. SystemV  13. Etc
    2. America  4. Australia   6. Asia    8. Europe    10. Pacific  12. US
    
    Geographic area: 8
    
    Please select the city or region corresponding to your time zone.
    
    1. Amsterdam   9. Brussels     17. Guernsey     25. Lisbon      33. Monaco     41. Rome        49. Stockholm  57. Vienna
    2. Andorra     10. Bucharest   18. Helsinki     26. Ljubljana   34. Moscow     42. Samara      50. Tallinn    58. Vilnius
    3. Astrakhan   11. Budapest    19. Isle_of_Man  27. London      35. Nicosia    43. San_Marino  51. Tirane     59. Volgograd
    4. Athens      12. Busingen    20. Istanbul     28. Luxembourg  36. Oslo       44. Sarajevo    52. Tiraspol   60. Warsaw
    5. Belfast     13. Chisinau    21. Jersey       29. Madrid      37. Paris      45. Saratov     53. Ulyanovsk  61. Zagreb
    6. Belgrade    14. Copenhagen  22. Kaliningrad  30. Malta       38. Podgorica  46. Simferopol  54. Uzhgorod   62. Zaporozhye
    7. Berlin      15. Dublin      23. Kiev         31. Mariehamn   39. Prague     47. Skopje      55. Vaduz      63. Zurich
    8. Bratislava  16. Gibraltar   24. Kirov        32. Minsk       40. Riga       48. Sofia       56. Vatican
    
    Time zone: 27

- Once done all basic modules will be installed now, lets check the version now

```
php -v

PHP 7.2.2-3+ubuntu16.04.1+deb.sury.org+1 (cli) (built: Feb  6 2018 16:11:23) ( NTS )
Copyright (c) 1997-2018 The PHP Group
Zend Engine v3.2.0, Copyright (c) 1998-2018 Zend Technologies
    with Zend OPcache v7.2.2-3+ubuntu16.04.1+deb.sury.org+1, Copyright (c) 1999-2018, by Zend Technologies
```

- Lets also check if the PHP7.2-FPM is running, if not start it
````
sudo service php7.2-fpm status
sudo service php7.4-fpm status
sudo service php7.2-fpm start (if the service isn't running already)
sudo service php7.4-fpm start (if the service isn't running already)
````

Now we need to configure the Gateway so that PHP-FPM uses the UNIX socket for executing PHP files.
For this we need to check where is the PHP7.2-fpm service running from and where are their configurations stored
````
sudo ps aux | grep php (this will list php process)
````

You will see the output something like below depending on how many processes are running
````
root     13122  0.0  0.0 412040 14752 ?        Ss   12:17   0:00 php-fpm: master process (/etc/php/7.2/fpm/php-fpm.conf)
www-data 13123  0.0  0.0 412040  8424 ?        S    12:17   0:00 php-fpm: pool www
www-data 13124  0.0  0.0 412040  8424 ?        S    12:17   0:00 php-fpm: pool www
root     13126  0.0  0.0  11288   868 pts/1    S+   12:17   0:00 grep --color=auto php
````

You will see the php-fpm master process is its location as /etc/php/7.2/fpm/php-fpm.conf.
We now need to check the socket details from the PHP7.2-fpm by view this file.

vim /etc/php/7.2/fpm/php-fpm.conf
nano /etc/php/7.4/fpm/php-fpm.conf

> You will see at the end of the file something like 'include=/etc/php/7.2/fpm/pool.d/*.conf' which means this process manager is using configurations
> from the pool.d directory. When viewing the /etc/php/7.2/fpm/pool.d/www.conf you will see that  
> the PHP7.2-fpm (process manager) is listening to the socket at 'listen = /run/php/php7.2-fpm.sock'  
> Copy the socket location i.e. /run/php/php7.2-fpm.sock and we will use this socket to tell nginx to use this socket

vim /etc/nginx/sites-available/default
nano /etc/nginx/sites-available/default

You will need to tell NGINX to process the index.php files as well so replace the following line
````
index index.html index.htm index.nginx-debian.html; -> index index.html index.htm index.php;
````

Also you will see something like the following block for 'location'

````
location ~ \.php$ {
       include snippets/fastcgi-php.conf;

       # With php-fpm (or other unix sockets):
       fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;
       # With php-cgi (or other tcp sockets):
       fastcgi_pass 127.0.0.1:9000;
}
````

Make changes so to the above block so you have the following one:
````
location ~ \.php$ {
       include snippets/fastcgi-php.conf;

       # With php-fpm (or other unix sockets):
       fastcgi_pass unix:/run/php/php7.2-fpm.sock;
       # With php-cgi (or other tcp sockets):
       fastcgi_pass 127.0.0.1:9000;
}
````

> **Note**: we have uncommented the location, and fastcgi_pass lines
> and also pasted the correct socket that is used  
> by our php7.2-fpm (process manager)

lets now restart both nginx and php7.2-fpm
````
sudo service nginx reload
sudo service php7.2-fpm restart

systemctl stop apache2.service
systemctl disable apache2.service
systemctl restart nginx.service
systemctl status nginx.service
````
