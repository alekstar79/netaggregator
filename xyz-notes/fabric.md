### Некоторые аспекты для установки и функционирования fabric.js

Версия node [10.20.1 or 12.18.0]

````
sudo apt install build-essential g++ libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libgirepository1.0-dev

npm install -g node-gyp node-pre-gyp
cd node_modules/canvas
node-gyp rebuild
````

#### Issues:

- [702](https://github.com/nodejs/node-gyp/issues/702)  
- [1709](https://github.com/nodejs/node-gyp/issues/1709)


#### Examples to research

[vue-fabric-wrapper](https://github.com/bensladden/vue-fabric-wrapper)  
[vue-fabric 1](https://github.com/purestart/vue-fabric)  
[vue-fabric 2](https://github.com/mudin/vue-fabric)
