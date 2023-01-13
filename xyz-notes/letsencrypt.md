##Принудительное продление сертификат Let’s Encrypt

[продлить-сертификат](https://itsecforu.ru/2020/05/05/%F0%9F%94%8F-%D0%BA%D0%B0%D0%BA-%D0%BF%D1%80%D0%B8%D0%BD%D1%83%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE-%D0%BF%D1%80%D0%BE%D0%B4%D0%BB%D0%B8%D1%82%D1%8C-%D1%81%D0%B5%D1%80%D1%82%D0%B8%D1%84/)

В Linux и Unix существует несколько способов выпуска и обновления сертификатов Letsencrypt TLS / SSL.

Всегда можем принудительно продлить срок действия сертификата, даже если срок его действия истек.

В этом руководстве будут использоваться два наиболее популярных инструмента командной строки:

    certbot – запросить новый сертификат с помощью команды certbot renew – force-renewal. Можно указать домены, используя опцию -d.
    Например, certbot -d netaggragator.ru, www.netaggregator.ru, test.netaggregator.ru
    acme.sh – принудительно обновить сертификат , используя acme.sh -f -r -d www.netaggregator.ru

Обновление сертификата LetsEncrypt с помощью certbot.

Certbot – самый популярный инструмент для:

    Автоматического доказательства Let Encrypt CA, что вы контролируете веб-сайт.
    Получение сертификата и настройки его на своем веб-сервере.
    Отслеживания, когда истечет срок действия вашего сертификата, и продление его срока.
    Помощи пользователям в отозыве сертификата, если это когда-нибудь понадобится.
    Обновления сертификата принудительно, если возникнет такая необходимость.

Основной целью инструмента командной строки certbot является настройка HTTPS-сервера и автоматическое получение доверенного сертификата
без вмешательства человека. Однако в некоторых случаях процесс обновления завершается неудачей по разным причинам, и для принудительного
обновления необходимо выполнить следующую команду вручную:
````
certbot --force-renewal  
certbot --force-renewal -d domain-name-1-here,domain-name-2-here  
certbot --force-renewal -d netaggregator.ru  

для получения дополнительной информации используйте следующую команду:  

certbot --help  
certbot --help all  

отфильтруйте опцию обновления, используя команду grep / egrep  

certbot --help all | grep -i force  
certbot --help all | egrep -i 'renewal|force'  
````
Как обновить определенный сертификат с помощью acme.sh

Синтаксис выглядит следующим образом:
````
acme.sh -f -r -d {your-domain-here}  
acme.sh --force --renew --domain {your-domain-name-here}  
acme.sh -f -r -d www.netaggregator.ru  
acme.sh -f -r -d www.netaggregator.ru -d netaggregator.ru
````
Где:

> – renew или -r: обновить сертификат.  
> – domain или -d: указывает домен, используемый для выдачи, продления или отзыва и т. д.   
> – force или -f: используется для принудительной установки или немедленного обновления сертификата.

Перезапустите / перезагрузите ваш веб-сервер и сервис

Наконец, перезапуск сервера Nginx, чтобы изменения вступили в силу.

Другими словами, вам нужно перезапустить ваш веб-сервер, чтобы клиенты могли видеть обновленные сертификаты:
````
sudo service nginx reload

# или

sudo service httpd reload

## Systemd GNU/Linux ##
sudo systemctl reload nginx.service
sudo systemctl reload httpd.service
sudo systemctl reload apache2.service
````