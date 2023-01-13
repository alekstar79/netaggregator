// import WebpackObfuscatorPlugin from 'webpack-obfuscator'

import WorkerPlugin from 'worker-plugin'
import path from 'path'

require('dotenv').config()

const ALLOWED_HOSTS = ['*.jsdelivr.net', '*.gstatic.com', 'vk.com', '*.vk.com', '*.rollbar.com', 'yoomoney.ru', '*.yoomoney.ru', 'yookassa.ru', '*.online-metrix.net', '*.sbrf.ru', '*.sberbank.ru', '*.online.sberbank.ru', 'mirconnect.ru', '*.mirconnect.ru', 'pixabay.com'],
    YANDEX_METRIKA = ['webvisor.com', '*.webvisor.com', '*.yandex.com', '*.yandex.com.tr', '*.yandex.ru', '*.yandex.md', 'yandex.site'],
    GOOGLE_ANALYTICS = ['*.google-analytics.com', '*.google.com', '*.googletagmanager.com', '*.doubleclick.net'],

    dirs = ['components','directives','layouts','middleware','mixins','plugins','utils','lang','workers'],
    preCaching = ['/img/sidebar/c01.jpg','/img/sidebar/c04.jpg','/img/sidebar/c07.jpg'],
    viewport = 'width=device-width, initial-scale=1, viewport-fit=cover',

    { NODE_ENV, LOC  } = process.env,
    IS_DEV = NODE_ENV !== 'production'

/**
* Asynchronous Configuration
* @see https://nuxtjs.org/docs/features/configuration/#asynchronous-configuration
*
* export default async () => {
*   const data = await axios.get('https://api.nuxtjs.dev/posts')
*   return {
*     head: {
*       title: data.title
*       //... rest of config
*     }
*   }
* }
*/
export default {
    target: 'server',
    ssr: true,

    /**
    * Autoimport components: https://go.nuxtjs.dev/config-components
    */
    components: true,

    loading: '~/components/helper/Loading.vue',

    env: {
        ORIGIN: { URL: process.env.ORIGIN_URL },
        LOCAL:  { URL: process.env.LOCAL_URL },
        OWNER:  { ID:  process.env.OWNER_ID },
        APP: {
            SECRET: process.env.APP_SECRET,
            USCOPE: process.env.APP_USCOPE,
            GSCOPE: process.env.APP_GSCOPE,
            URI: process.env.APP_URI,
            ID: process.env.APP_ID
        },
        PIXABAY: {
            KEY: process.env.PIXABAY_KEY,
            API: process.env.PIXABAY_API
        },

        NODE_ENV,
        IS_DEV,
        LOC
    },

    /**
    * @see https://go.nuxtjs.dev/config-head
    */
    head: {
        titleTemplate: '%s | Netaggregator',

        htmlAttrs: {
            prefix: 'og: http://ogp.me/ns#',
            lang: 'ru'
        },
        meta: [
            { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge,chrome=1' },
            { name: 'description', hid:  'description', content: process.env.npm_package_description },
            { name: 'msapplication-TileColor', content: '#5bbad5' },
            { name: 'theme-color', content: '#ededed' },
            { name: 'viewport', content: viewport },

            { hid: 'vk:image', property: 'vk:image', content: 'https://netaggregator.ru/icon.png' },
            { hid: 'fb:image', property: 'fb:image', content: 'https://netaggregator.ru/icon.png' },
            {
                hid: 'twitter:image',
                property: 'twitter:image',
                content: 'https://netaggregator.ru/icon.png'
            }
        ],
        link: [
            { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
            { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5'       },
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'                  },

         // Preconnected links should be used in moderation and only for the most significant sources
            { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net', crossorigin: 'anonymous' },
         // { rel: 'preconnect',   href: 'https://cdn.jsdelivr.net', crossorigin: 'anonymous' },
            { rel: 'dns-prefetch', href: 'https://yookassa.ru', crossorigin: 'anonymous' },
         // { rel: 'preconnect',   href: 'https://yookassa.ru', crossorigin: 'anonymous' },
            { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com', crossorigin: 'anonymous' },
         // { rel: 'preconnect',   href: 'https://www.googletagmanager.com', crossorigin: 'anonymous' },
            { rel: 'dns-prefetch', href: 'https://mc.yandex.ru', crossorigin: 'anonymous' },
         // { rel: 'preconnect',   href: 'https://mc.yandex.ru', crossorigin: 'anonymous' },
            { rel: 'dns-prefetch', href: 'https://vk.com', crossorigin: 'anonymous' },
            { rel: 'preconnect',   href: 'https://vk.com', crossorigin: 'anonymous' }
        ],
        script: [{
            hid: 'checkout-widget',
            src: 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js',
            async: true,
            defer: true
        }]
    },

    /**
     * @see https://go.nuxtjs.dev/config-css
     */
    css: [
        { src: 'normalize.css'           },
        { src: '~/assets/css/fonts.css'  },
        { src: '~/assets/css/global.css' }
    ],

    /**
    * @see https://go.nuxtjs.dev/config-plugins
    */
    plugins: [
     // { src: '~/plugins/observable' },
     // { src: '~/plugins/socket', mode: 'server' },
        { src: '~/plugins/client', mode: 'client' },
        { src: '~/plugins/common' }
    ],

    /* serverMiddleware: [
        { path: '/node', handler: '~/api/index.js' }
    ], */

    router: {
        mode: 'history',
        prefetchLinks: false,
        middleware: []

        /* extendRoutes(routes, resolve) {
            routes.splice(0, routes.length, ...routes.map(route => {
                return { ...route, component: resolve(__dirname, route.component) }
            }))
        } */
    },

    render: {
        /**
        * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin
        */
        crossorigin: '', // 'anonymous' | 'use-credentials' | ''
        resourceHints: true,
        asyncScripts: true,
        compressor: false,
        etag: false,

        static: {
            etag: false
        },
        http2: {
            push: true

            /**
            * @see https://habr.com/ru/post/445264
            * @see https://web.dev/link-prefetch
            */
            /* pushAssets: (req, res, publicPath, preloadFiles) => preloadFiles.filter(f => f.asType === 'style')
                .map(f => `<${publicPath}${f.file}>; rel=preload; as=${f.asType}`)
                .concat(preCaching.map(img => `<${img}>; rel=prefetch; as=image`)) */
        },
        /**
        * @see https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-render#csp
        * @see https://csplite.com/ru/csp215
        */
        csp: {
            reportOnly: false,
            // hashAlgorithm: 'sha256',
            // unsafeInlineCompatibility: true,
            policies: {
                'base-uri': `${process.env.ORIGIN_URL}`,
                'report-uri': `${process.env.ORIGIN_URL}/api/scp/reports`,
                'default-src': ["'self'",'https:','blob:','data:'],
                'worker-src': [
                    process.env.ORIGIN_URL,
                    'blob:',
                    'data:'
                ],
                'img-src': [
                    'https:',
                    'data:',
                    'blob:',
                    ...GOOGLE_ANALYTICS
                ],
                'font-src': [
                    'data:',
                    process.env.ORIGIN_URL,
                    ...GOOGLE_ANALYTICS,
                    ...YANDEX_METRIKA,
                    ...ALLOWED_HOSTS
                ],
                'style-src': [
                    "'unsafe-inline'",
                    '*.googleapis.com',
                    process.env.ORIGIN_URL,
                    ...GOOGLE_ANALYTICS,
                    ...YANDEX_METRIKA,
                    ...ALLOWED_HOSTS
                ],
                'script-src': [
                    "'unsafe-eval'",
                    "'unsafe-inline'",
                    "'report-sample'",
                    process.env.ORIGIN_URL,
                    ...GOOGLE_ANALYTICS,
                    ...YANDEX_METRIKA,
                    ...ALLOWED_HOSTS
                ],
                'connect-src': [
                    'blob:',
                    'wss:',
                    process.env.ORIGIN_URL,
                    ...GOOGLE_ANALYTICS,
                    ...YANDEX_METRIKA,
                    ...ALLOWED_HOSTS
                ],
                'frame-ancestors': ["'self'", 'vk.com'],
                'form-action': ["'self'"],
                'object-src': ["'self'"]
            }
        }
    },

    /**
    * @see https://github.com/victor-perez/nuxt-helmet
    * @see https://helmetjs.github.io
    * helmet: {
    *    contentSecurityPolicy: {}
    * }
    */

    /**
    * Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    * @see https://github.com/nuxt-community/router-module
    * @see https://github.com/nuxt-community/dotenv-module
    * @see https://github.com/nuxt-community/eslint-module
    * @see https://github.com/nuxt-community/vuetify-module
    * @see https://github.com/nuxt-community/pwa-module
    */
    buildModules: [
        ['@nuxtjs/router', { keepDefaultRouter: true }],
        ['@nuxtjs/eslint-module'],
        ['@nuxtjs/vuetify'],
        ['@nuxtjs/dotenv'],
        ['@nuxtjs/pwa']
    ],

    /**
    * @see https://github.com/nuxt-community/gtm-module
    * @see https://github.com/nuxt-community/axios-module
    * @see https://github.com/microcipcip/cookie-universal
    * @see https://github.com/reegodev/vue-screen
    */
    modules: [
        ['cookie-universal-nuxt'],
        ['vue-screen/nuxt'],
        ['@nuxtjs/axios'],
        ['@nuxtjs/i18n'],
        ['@nuxtjs/gtm']
    ],

    /**
    * @see https://go.nuxtjs.dev/config-axios
    */
    axios: {
        baseURL: process.env.BASE_URL,
        browserBaseURL: '/api',
        progress: false,
        proxy: true
    },

    /**
    * @see https://axios.nuxtjs.org/options
    * @see https://github.com/chimurai/http-proxy-middleware/issues/171
    */
    proxy: {
        '/api/': {
            target: IS_DEV && LOC ? process.env.LOCAL_URL : process.env.ORIGIN_URL,
            headers: { Connection: 'keep-alive' },
            changeOrigin: true,
            secure: false,
            https: true
        }
    },

    /**
    * @see https://go.nuxtjs.dev/pwa
    */
    pwa: {
        manifest: {
            name: 'Netaggregator',
            short_name: 'NA',
            lang: 'ru',

            background_color: '#ededed',
            theme_color: '#ededed'
        },
        meta: {
            title: 'Netaggregator',
            author: 'alekstar79',
            description: process.env.npm_package_description,
            ogDescription: process.env.npm_package_description,
            ogImage: 'https://netaggregator.ru/icon.png',
            viewport
        },
        icon: {
            purpose: 'any'
        },
        /**
        * @see https://habr.com/ru/company/domclick/blog/523106
        */
        workbox: {
            // workboxURL: '/workbox/workbox-sw.js',
            offlineAnalytics: true,
            preCaching,

            runtimeCaching: [
                { urlPattern: '/api/viewer', handler: 'NetworkFirst', strategyOptions: { cacheName: 'viewer-cache' }   },
                { urlPattern: '\\.(?:wxg|json)', handler: 'NetworkOnly', strategyOptions: { cacheName: 'data-cache' } },
                { urlPattern: 'https://oauth\\.vk\\.com', handler: 'NetworkOnly' },
                { urlPattern: 'https://vk\\.com', handler: 'NetworkOnly' },
                { urlPattern: '/(login|logout)/', handler: 'NetworkOnly' },
                {
                    urlPattern: '/api/',
                    handler: 'NetworkOnly',
                    strategyOptions: { cacheName: 'api-cache' }
                },
                {
                    urlPattern: '\\.(?:png|jpg|jpeg|svg|webp)',
                    strategyOptions: { cacheName: 'img-cache' },
                    handler: 'CacheFirst'
                }
            ]
        }
    },

    /**
    * @see: https://go.nuxtjs.dev/config-vuetify
    */
    vuetify: {
        customVariables: ['~/assets/scss/variables.scss'],
        optionsPath: '~/vuetify.options.js',
        defaultAssets: false,
        treeShake: true,
        options: {
            customProperties: true
        }
    },

    /**
    * @see https://github.com/nuxt-community/nuxt-i18n
    */
    i18n: {
        detectBrowserLanguage: false,
        strategy: 'no_prefix',
        fallbackLocale: 'ru',
        defaultLocale: 'ru',
        langDir: '~/lang/',

        loadLanguagesAsync: true,
        lazy: true,

        locales: [
            { code: 'en', iso: 'en-US', file: 'en.js', dir: 'ltr' },
            { code: 'ru', iso: 'ru-RU', file: 'ru.js', dir: 'ltr' }
        ]
    },

    /**
    * GTM initialization
    */
    gtm: {
        id: 'GTM-KXSNTSS'
    },

    /**
    * @see https://go.nuxtjs.dev/config-build
    */
    build: {
        publicPath: '/app/',
        indicator: false,

        optimization: {
            minimize: !IS_DEV,
            runtimeChunk: true,
            splitChunks: {
                chunks: 'all',
                maxSize: 512000
            }
        },

        splitChunks: {
            layouts: true
        },

        /**
        * @see https://nuxtjs.org/api/configuration-build/#presets
        * @see https://www.npmjs.com/package/@nuxt/babel-preset-app
        */
        babel: {
            plugins: [
                '@babel/plugin-proposal-nullish-coalescing-operator',
                '@babel/plugin-proposal-export-default-from',
                '@babel/plugin-proposal-throw-expressions',
                '@babel/plugin-transform-runtime'
            ]
            /*, presets({ envName }, [/* preset, options *!/])
            {
                const envTargets = {
                    client: { browsers: ['last 2 versions'], ie: 11 },
                    modern: { esmodules: true },
                    server: { node: 'current' }
                }

                return [
                    [
                        '@nuxt/babel-preset-app-edge',
                        {
                            targets: envTargets[envName],
                            corejs: { version: 3 },
                            modules: false
                        }
                    ]
                ]
            } */
        },

        terser: {
            parallel: true,
            terserOptions: {
                safari10: true,
                /**
                * @see https://github.com/terser/terser#compress-options
                */
                compress: {
                    drop_console: false
                }
            }
        },

        transpile: ['intersection-observer', 'vue-lazyload', 'bson'],

        ...(!IS_DEV && { extractCSS: true, ignoreOrder: true }),

        optimizeCss: true,

        filenames: {
            font: () => 'fonts/[name].[ext]'
        },

        /**
        * @see https://jamesscheller.com/adding-snap-svg-to-vue-js-and-nuxt-js-projects
        */
        extend(config, { /* isClient, isDev, loaders */ })
        {
            dirs.map(d => config.resolve.alias[d] = path.resolve(__dirname, d))

            config.resolve.extensions.push('.ts','.tsx','.css','.scss','.sass')
            config.resolve.mainFiles = (config.resolve.mainFiles || [])
                .concat(['index','Index'])

            config.module.rules
                .filter(r => r.test.toString().match(/\(.*svg.*\)/))
                .forEach(r => {
                    r.test = /\.(png|jpe?g|gif|webp)$/
                    r.use = [{ loader: 'url-loader' }]
                })

            config.module.rules.push({
                test: /\.svg$/,
                oneOf: [
                    {
                        resourceQuery: /inline/,
                        use: [{
                            loader: 'vue-svg-loader',
                            options: {
                                extract: true,
                                svgo: false
                            }
                        }]
                    },
                    { resourceQuery: /data/, loader: 'url-loader' },
                    { resourceQuery: /raw/,  loader: 'raw-loader' },
                    { loader: 'file-loader' }
                ]
            })
        },

        plugins: [
            /**
            * @see https://github.com/GoogleChromeLabs/worker-plugin
            * @see https://github.com/nuxt/docs/blob/master/en/api/configuration-build.md#plugins
            */
            new WorkerPlugin({ globalObject: 'self', sharedWorker: true })
            /**
            * @see https://github.com/javascript-obfuscator/webpack-obfuscator
            * @see https://stackoverflow.com/a/67195445/6399083
            */
            // new WebpackObfuscatorPlugin({ stringArray: false }, ['node_modules/**/*.js']),
        ]
    }

    /**
    * Server using HTTPS configuration
    * @see https://nuxtjs.org/docs/configuration-glossary/configuration-server#example-using-https-configuration
    * @see https://debbie.codes/blog/nuxt-configure-server-to-see-site-on-mobile
    */
    /* server: {
        https: {
            cert: fs.readFileSync(path.resolve(__dirname, '../server.crt')),
            key: fs.readFileSync(path.resolve(__dirname, '../server.key'))
        },
        port: 8080, // default: 3000
        host: '0.0.0.0', // default: localhost
        timing: false
    } */
}
