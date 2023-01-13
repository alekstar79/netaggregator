#### Установка node через NVM

##### LINKS

1. [Управление версиями Node.js и NPM с помощью NVM](https://habr.com/ru/company/timeweb/blog/541452)
2. [Permission denied when installing npm modules](https://stackoverflow.com/questions/47252451/permission-denied-when-installing-npm-modules-in-osx/47252840#47252840)
3. [npm throws error without sudo](https://stackoverflow.com/questions/16151018/npm-throws-error-without-sudo/24404451#24404451)
4. [node: permission denied](https://github.com/nvm-sh/nvm/issues/1407#issuecomment-316858947)

Шаг 1. При установке Node.js воспользуемся NVM(Node Version Manager), с помощью которого
упрощается установка сразу нескольких версий Node.JS и переключение между ними.

Приступаем к установке nvm. Программа часто обновляется, поэтому каждый раз берем скрипт
установки со страницы проекта на github (https://github.com/nvm-sh/nvm)
В командной строке набираем:
````
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
````

Чтобы функциональность nvm стала доступна, можно воспользоваться следующей командой:
````
source ~/.profile
````
Проверяем:
````
nvm --version
````
Команда должна вывести установленную версию nvm

Шаг 2. Когда NVM установлен, приступаем к установке Node.js. Чтобы посмотреть список
доступных версий программы, используем команду
````
nvm ls-remote
````

Команда выведет полный список версий, находим или последнюю или нужную,
в нашем случае это v10.20.1 и устанавливаем:
````
nvm install 10.20.1
````
Для установки других версий используется команда вида:
````
nvm install <номер версии>
````
Посмотреть список уже установленных Node.js можно командой:
````
nvm ls
````
Данная команда выводит подробную информацию о доступных установках Node.js:

> текущая - используемая в данный момент;  
> default - используемая по умолчанию, при открытии консоли;  
> node - используемая при работе с командой node;  
> stable - стабильная версия;  
> LTS - версия с раширенной поддержкой.  

Для получения информации о текущей версии Node.js выполним
````
nvm current
````
Чтобы использовать нужную версию по умолчанию, пропишем alias
````
nvm alias default <номер версии>
````
Переключаться между версиями можно с помощью команды вида:
````
nvm use <номер версии>
````
Исполняемая версия и будет называться node, чтобы проверить наберем команду:
````
node -v
````
Чтобы узнать директорию установки node, наберем команду:
````
which node или nvm which node
````
Аналогичным образом можно найти директорию установки других версий:
````
nvm which <номер версии>
````

Конфигурирование:

    npm config set <key> <value> [-g|--global]
    npm config get <key>
    npm config delete <key>
    npm config list [-l] [--json]
    npm config edit
    npm get <key>
    npm set <key> <value> [-g|--global]

Пример:
    
    npm set audit false

Rebuild:

[stackowerflow](https://stackoverflow.com/a/48643374)

    npm rebuild <package> --update-binary

example:

    npm rebuild canvas --update-binary

Misc:

    npm install -g npm
    npm cache clean --force
    rm -rf node_modules
