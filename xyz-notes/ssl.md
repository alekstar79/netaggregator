###### links

> [ssl-error](https://stackoverflow.com/questions/32211301/ssl-error-ssl3-get-server-certificatecertificate-verify-failed)  
> [ssl-verification](https://forum.directadmin.com/threads/ssl-certificate-verification-on-php-5-6.50885)  
> [ssl-failed](https://www.dahelp.ru/zametki/php-56-ssl-operation-failed-with-code-1)  

#### Настроика шифрованного соединения на сервере
````
openssl_get_cert_locations()

array(8) {
  "default_cert_file" => "/usr/lib/ssl/cert.pem"
  "default_cert_file_env" => "SSL_CERT_FILE"
  "default_cert_dir" => "/usr/lib/ssl/certs"
  "default_cert_dir_env" => "SSL_CERT_DIR"
  "default_private_dir" => "/usr/lib/ssl/private"
  "default_default_cert_area" => "/usr/lib/ssl"
  "ini_cafile" => ""
  "ini_capath" => ""
}
````

И так проверяем настройки:
````
php -r 'print_r(openssl_get_cert_locations());' | grep '\[default_cert_file\]' | awk '{print $3}'
````

Результатом должна быть одна строка, указывающая на CA пакет (cafile):
````
/usr/ssl/cert.pem
/usr/lib/ssl/cert.pem
/usr/local/etc/ssl/cert.pem
````

В зависимости от используемой ОС и сборки PHP путь может отличаться. Главное убедиться,
что указанный файл существует, он не пустой и соддержит информацию. Если файла нет,
скачать CA пакет по [ссылке](http://curl.haxx.se/ca/cacert.pem) и разместить
/usr/lib/ssl/cert.pem, либо прописать в настройках php.ini необходимые пути:

openssl openssl.cafile "Значение по умолчанию не задано" // путь до файла  
openssl openssl.capath "Значение по умолчанию не задано" // путь до директории

    wget http://curl.haxx.se/ca/cacert.pem
