[about-sys-ubuntu](https://losst.ru/sbor-informatsii-o-sisteme-ubuntu)

#### Hardinfo
````
sudo apt install hardinfo

hardinfo | less
````

Утилита умеет генерировать отчёт в HTML:
````
hardinfo -f html > hardinfo.report.html
````

Также подобное действие можно выполнить через lshw:
````
sudo apt install lshw
````

Смотрим так:
````
lshw | less
````

Ею тоже можно создать отчёт в HTML виде:
````
lshw -html > lshw.report.html
````
