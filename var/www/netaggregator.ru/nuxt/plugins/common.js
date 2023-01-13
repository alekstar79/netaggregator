// import { detectUserAgent } from '../utils/common/user-agent.mjs'
// import { validation } from '../utils/check-sign.mjs'

import { ErrorServiceManager, IS_DEV } from './errors-service'
import messages from '../lang'

import { stringify } from 'qs'
import crypto from 'crypto'

import NuxtJsonld from 'nuxt-jsonld'
import Schema from './microdata'
import Vue from 'vue'

const esm = ErrorServiceManager.instance

Vue.config.errorHandler = esm.error.bind(esm)
Vue.config.warnHandler = esm.warn.bind(esm)
Vue.config.productionTip = false
Vue.config.devtools = IS_DEV
Vue.config.debug = IS_DEV
Vue.config.silent = !IS_DEV

Vue.use(NuxtJsonld)
Vue.use(Schema)

export function injectEventBus(context, inject)
{
    return new Promise(resolve => {
        inject('bus', (context.$bus = new Vue()))
        resolve(context.$bus)
    })
}

function extract(query)
{
    let p, ordered = {}

    Object.keys(query).forEach(k => {
        if (k.slice(0,3) === 'vk_') {
            p = query[k]

            ordered[k] = p && !isNaN(p)
                ? parseInt(p)
                : p
        }
    })

    return ordered
}

function h(params, key)
{
    return crypto
        .createHmac('sha256', key)
        .update(stringify(params))
        .digest()
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=$/, '')
}

/**
* @see https://github.com/vuejs/devtools/issues/1385#issuecomment-848339263
* Fix for DevTools failed. In developer tools in chrome browser, go to settings (click the gear icon on the same bar as the console tab).
* Find and uncheck box that says Enable Javascript Sourcemap. Exit settings and reload (I did a hard reload/empty cache).
* The error should be gone. For the firefox, do the same steps.
*/

/* function requestInterceptor({ $cookies }, config)
{
    const { baseURL, url, method, headers: { common } } = config
    console.log('REQUEST', { baseURL, url, method, headers: common, cookies: $cookies.getAll() })

    return config
}

function responseInterceptor(response)
{
    const { status, request: { path, method }, headers, data } = response
    console.log('RESPONSE', { status,  path, method, headers, data })

    return response
} */

export default async (context, inject) => {
    context.$bus || (await injectEventBus(context, inject))

    let locale, url, agent, vkapp = {}, { req, query, app, store, env, $cookies } = context

    // $axios.interceptors.request.use(requestInterceptor.bind(null, app))
    // $axios.interceptors.response.use(responseInterceptor)

    app.i18n.setLocaleMessage('en', messages.en)
    app.i18n.setLocaleMessage('ru', messages.ru)

    if (typeof process !== 'undefined' && !process.browser) {
        if (Object.prototype.hasOwnProperty.call(query, 'vk_app_id')) {
            vkapp = extract(query)

            if (query.sign === h(vkapp, env.APP.SECRET)) {
                store.commit('app/set', { vkapp })
            }
        }
        if ((locale = $cookies.get('locale') || vkapp.vk_language)) {
            store.commit('app/set', { locale })
            app.i18n.locale = locale
        }

        await store.dispatch('app/settingsLoad')

        agent = req.headers['user-agent']
        url = req.url.split('?')[0]
    }
    if (typeof navigator !== 'undefined') {
        agent = navigator.userAgent // detectUserAgent()
    }
    if (typeof agent !== 'undefined') {
        context.$useragent = agent
        inject('useragent', agent)
    }
    if (typeof url !== 'undefined') {
        context.$url = url
        inject('url', url)
    }
}
