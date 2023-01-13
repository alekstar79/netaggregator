## Restart and reboot

````
systemctl restart {nginx,php7.4-fpm}

service php7.4-fpm restart
service nginx reload

/etc/init.d/php7.4-fpm restart
/etc/init.d/nginx restart

reboot
````

## Monitor resource usage and system performance

````
cat /proc/meminfo
ps aux --sort -rss
free -h

sudo apt install nmon
nmon

sudo apt install atop
atop
````
