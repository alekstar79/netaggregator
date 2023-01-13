#### [snap-svg-with-vue](https://stackoverflow.com/a/56191720)

Instead of hacking webpack, use [snapsvg-cjs](https://www.npmjs.com/package/snapsvg-cjs)

> This project simply unwraps the excellent SnapSVG from its published AMD format and
> hosts it on NPM as CommonJS in a package called snapsvg-cjs. This package then works
> out-of-the-box with Webpack, without needing any import-loader hax.

````
npm install snapsvg-cjs
````

the only line of code you'll need:
````
import 'snapsvg-cjs'
````

### Adding Snap.svg to Vue.js and Nuxt.js Projects
#### Getting Snap.svg Working with Vue.js

Out of the gate, there’s some hurdles because Snap mounts itself on the browser’s window
object, so if you’re trying to load Snap through WebPack (as opposed to just including it in
a project using a conventional script tag), you need to do some gymnastics to get WebPack’s
JavaScript loader to feed the window object into Snap’s initialization logic.
You can find an overview of the problem in this GitHub issue which illustrates the obstacles
in the context of using React, but the issues as they relate to Vue.js are the same.

I’m assuming you have a Vue.js webpack project that you started with vue-cli or from
a template that has everything basically running okay, so you’ve already got Node
and webpack and all your other infrastructure in place.

For starters, you’ll want to install Snap.svg and add it to your project dependencies,
so from a terminal window open and sitting in the directory where your project’s
package.json/package-lock.json sit…

    npm install --save snapsvg

That will download and install a copy of the Snap.svg source into your node_modules directory
and you’ll have it available for WebPack to grab.

Normally you’d be able to use a package installed like this by using an import statement
somewhere, and you’d think you could do this in your Vue project’s main.js file,
if you start down this path you’ll get the window undefined issue described
in that GitHub link above.

The tricky bit though is getting WebPack to load the Snap properly, and to do that we’ll need
a WebPack plugin that lets us load as a JavaScript dependency and pass some bindings to it.
So, in that same directory install the WebPack imports-loader plugin…

    npm install --savedev imports-loader

To tell the imports-loader when it needs to do its magic, we have to add it to the WebPack
configuration. I changed my webpack.base.conf.js file to include the following inside
the array of rules inside the module object…
````
module: {
    rules: [
        ...
        {
            test: require.resolve('snapsvg'),
            use: 'imports-loader?this=>window,fix=>module.exports=0'
        },
        ...
    ]
}
````

Now we can load Snap.svg in our JavaScript, but imports-loader uses the node require syntax
to load the file. So in our main.js, we can attach Snap.svg by telling WebPack to invoke
the exports loader like this…

````
const snap = require(`imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js`)
````

…and then attach it to our root Vue instance, still in main.js, something like this…

````
const vue = new Vue({
    el: '#app',
    snap,
    router,
    axios,
    store,
    template: '<App/>',
    components: { App }
});

export { vue }
````

There is some redundancy in that require() call and the way we setup the module resolution
in the WebPack configuration. I’m fuzzy about why I seemed to need this in both spots,
but it works so I’m running with it.


##### Getting Snap.svg Working with nuxt.js

Nuxt requires a slightly different twist, because as you’re aware a typical Nuxt project
doesn’t have either a main.js file or a native copy of the WebPack configuration.
We need to make the same changes, but just in a slightly different spots.

You need to install both snapsvg and imports-loader just like we did above…
````
npm install --save snapsvg
npm install --savedev imports-loader
````

The way we modify the WebPack configuration in a Nuxt project is to create a function
that accepts and extends the WebPack configuration from with your nuxt.config.js file…

````
build: {
    extend(config, ctx) {
        config.module.rules.push({
            test: require.resolve('snapsvg'),
            use: 'imports-loader?this=>window,fix=>module.exports=0'
        })
    }
}
````

Since we don’t have a main.js, we need to use a Vue.js plugin to inject shared objects
and code into Vue. In your projects plugins folder, create a file named snap.js
that contains code to attach a snap object created again using imports-loader…

````
export default ({ app }, inject) => {
  app.snap = require(`imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js`);
}
````

…and back in your nuxt.config.js file, include this plugin…

````
plugins: [
   ...
   { src: '~/plugins/snap' },
   ...
]
````

These approaches seem to work well for me in both a standard Vue.js and Nuxt.js projects,
but both of these setups have been cobbled together from reading a lot of other bits
and pieces…
