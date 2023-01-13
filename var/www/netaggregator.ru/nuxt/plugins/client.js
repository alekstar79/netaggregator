import browser, { indexedDBtest } from '~/middleware/browser'

import { MemoryStore } from '~/utils/memory-store'
import { IdbStore } from '~/utils/idb-store'

import { injectEventBus } from './common'
import { hint } from '~/directives/hint'

import VueRouterBackButton from 'vue-router-back-button'
import VueViewer from 'v-viewer'
import Vue from 'vue'

import 'viewerjs/dist/viewer.css'
import 'swiper/swiper.scss'

const allowed = ['dir','log','info','group','groupEnd']
const exclude = ['trace','error','warn']

function _console(fn)
{
    return !exclude.includes(fn)
        ? (log => (...args) => {
            args = args.filter(
                data => typeof data !== 'string' || ![
                    /development mode/i,
                    /vue[- ]?devtools/i,
                    /background/i
                ].some(r => r.test(data))
            )

            if (args.length || fn === 'groupEnd') {
                log.call(console, ...args)
            }

        })(console[fn])
        : function() {}
}

/**
* Disable console.info - "You are running Vue in development mode"
* while maintaining the ability to output to the console
*/
if (process.env.NODE_ENV === 'production') {
    allowed.concat(exclude).forEach(fn => console[fn] = _console(fn))
}

String.prototype.replaceAll || (String.prototype.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement)
})

String.prototype.splice || (String.prototype.splice = function(index, del, ...chars) {
    return this.slice(0, index) + chars.join('') + this.slice(index + Math.abs(del))
})

/**
* @see https://gist.github.com/hanayashiki/8dac237671343e7f0b15de617b0051bd
* @type {_arrayBuffer}
*/
File.prototype.arrayBuffer = File.prototype.arrayBuffer || _arrayBuffer
Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || _arrayBuffer

/**
* @typedef _arrayBuffer
* @return {Promise<ArrayBuffer>}
*/
function _arrayBuffer()
{
    return new Promise(resolve => {
        const fr = new FileReader()

        fr.onload = () => {
            resolve(fr.result)
        }

        fr.readAsArrayBuffer(this)
    })
}

async function injectStorage(context, inject)
{
    inject('ls', (context.$ls = (await indexedDBtest()) ? new IdbStore() : new MemoryStore()))
}

function injectBrowser(context, inject)
{
    return new Promise(resolve => {
        inject('BROWSER', (context.$BROWSER = browser()))
        resolve(context.$BROWSER)
    })
}

/**
* @see https://vk.com/dev/openapi
*/
function injectVkOpenApi(context, inject)
{
    inject('vkOpenApi', (context.$vkOpenApi = () => {
        if (window.VK || document.getElementById('vk_api_transport')) return

        document.body.insertAdjacentHTML('afterbegin', `
            <div id="vk_api_transport"></div>
            <script type="text/javascript">
                setTimeout(() => {
                    const el = document.createElement('script');
    
                    el.async = el.defer = true;
                    el.type = 'text/javascript';
                    el.src = 'https://vk.com/js/api/openapi.js?169';
    
                    document.getElementById('vk_api_transport').appendChild(el)
                    
                }, 100)
            </script>
        `)
    }))
}

/**
* @see https://github.com/liriliri/eruda
*/
/* function erudaInit({ IS_MOBILE, IS_DEV })
{
    if (!IS_MOBILE || !IS_DEV) return

    import(/* webpackChunkName: "eruda" *!/ 'eruda')
        .then(m => m.default || m)
        .then(eruda => {
            eruda.init()
        })
} */

/**
* @see https://qastack.ru/programming/821011/prevent-a-webpage-from-navigating-away-using-javascript
*/
window.addEventListener('beforeunload', () => '', false)

export default async (context, inject) => {
    Vue.use(VueRouterBackButton, { router: context.app.router })
    Vue.use(VueViewer, { defaultOptions: { focus: false } })
    Vue.directive('hint', hint)

    context.$BROWSER || (await injectBrowser(context, inject))
    context.$bus || (await injectEventBus(context, inject))
    context.$ls || (await injectStorage(context, inject))

    injectVkOpenApi(context, inject)

    const { app, store, $ls, $vuetify, $BROWSER } = context,
        { color: cl, cover: cv, theme: tm } = store.state.app,
        { IS_MOBILE } = $BROWSER

    // erudaInit($BROWSER)

    if (store.state.app.locale) {
        app.i18n.locale = store.state.app.locale
    }
    if (store.state.app.user || store.state.app.vkapp) {
        store.commit('socket/init')
    }

    try {

        const [{ color = cl, cover = cv, theme = tm, hints = !IS_MOBILE }, owner] = await $ls.getMany(
            ['theme', 'owner'],
            [{}, false]
        )

        $vuetify.theme.dark = theme === 'dark'

        store.commit('app/set', {
            ...(color && { color }),
            ...(cover && { cover }),
            ...(theme && { theme }),
            ...(hints && { hints }),
            owner
        })

    } catch (e) {
    }

    app.$bus.$emit('theme:inited')

    store.dispatch('nuxtClientInit', context)
}
