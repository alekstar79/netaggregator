// import { detectUserAgent } from '../utils/common/user-agent.mjs'
import { browser as B } from './default'

function getPrefixedProp(prop)
{
    return ['', 'webkit', 'moz', 'ms'].map(e => e === '' ? prop : `-${e}-${prop}`)
}

export function backdropFilterSupport()
{
    try {

        return getPrefixedProp('backdrop-filter')
            .map(e => window.CSS.supports(e, 'blur(1px)'))
            .some(e => e)

    } catch (e) {
    }

    return false
}

export function cssElementSupport()
{
    try {

        return getPrefixedProp('element(#a)')
            .map(e => window.CSS.supports('background', e))
            .some(e => e)

    } catch (e) {
    }

    return false
}

export function storageAvailable(type)
{
    try {

        const storage = window[type],
            x = '__storage_test__'

        storage.setItem(x, x)
        storage.removeItem(x)

        return true
    } catch (e) {
        return false
    }
}

/**
* @see https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
*/
export function touchEnabled()
{
    if (('ontouchstart' in window) || window.TouchEvent ||
        (window.DocumentTouch && document instanceof DocumentTouch)) {
        return true
    }

    const prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
        mq = query => window.matchMedia(query).matches

    return mq(['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join(''))
}

export function dragAndDropSupport()
{
    const div = document.createElement('div')

    if ('FormData' in window && 'FileReader' in window) {
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)
    }

    return false
}

/**
* @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
*/
export function passiveSupport()
{
    let supported = false

    try {

        const options = Object.defineProperty({}, 'passive', {
            get() { supported = true }
        })

        window.addEventListener('test', null, options)
        window.removeEventListener('test', null, options)

    } catch (e) {
    }

    return supported
}

/**
* @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
*/
export function localeDateStringSupport()
{
    try {

        new Date().toLocaleDateString('i')

    } catch ({ name }) {
        return name === 'RangeError'
    }

    return false
}

/**
* Сжатие данных при передаче от браузера к серверу [10 июля 2013]
* @see https://habr.com/ru/post/186202
*/
export function compressionSupport()
{
    return !['Uint16Array','Uint32Array','ArrayBuffer','Blob','FormData'].some(c => !(c in window))
}

export function backgroundSize()
{
    return 'backgroundSize' in window.document.createElement('video').style
}

export function devicePixelRatio()
{
    return window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1
}

export function IDBaccessible()
{
    if (window.indexedDB) {
        return 'indexedDB'
    }
    if (window.mozIndexedDB) {
        return 'mozIndexedDB'
    }
    if (window.webkitIndexedDB) {
        return 'webkitIndexedDB'
    }
    if (window.msIndexedDB) {
        return 'msIndexedDB'
    }

    return false
}

export function transaction()
{
    if (window.IDBTransaction) {
        return 'IDBTransaction'
    }
    if (window.webkitIDBTransaction) {
        return 'webkitIDBTransaction'
    }
    if (window.msIDBTransaction) {
        return 'msIDBTransaction'
    }

    return false
}

export function keyRange()
{
    if (window.IDBKeyRange) {
        return 'IDBKeyRange'
    }
    if (window.webkitIDBKeyRange) {
        return 'webkitIDBKeyRange'
    }
    if (window.msIDBKeyRange) {
        return 'msIDBKeyRange'
    }

    return false
}

export function indexedDBtest()
{
    let idb, req

    return new Promise(resolve => {
        try {

            if (!(idb = IDBaccessible())) {
                return resolve(false)
            }
            if ((req = window[idb]?.open('__test__'))) {
                req.onsuccess = req.onupgradeneeded = () => {
                    window[idb].deleteDatabase('__test__')
                    resolve(true)
                }

                req.onerror = () => {
                    resolve(false)
                }

                return
            }

        } catch (e) {
        }

        resolve(false)
    })
}

export default function()
{
    try {

        if (process.server) return B

        B.USER_AGENT = (window.navigator && window.navigator.userAgent) || '' // detectUserAgent()

        const webkitVersionMap = /AppleWebKit\/([\d.]+)/i.exec(B.USER_AGENT),
            appleWebkitVersion = webkitVersionMap
                ? parseFloat(webkitVersionMap.pop())
                : null

        B.IS_FIREFOX = /Firefox/i.test(B.USER_AGENT)
        B.IS_WEBKIT = /WebKit/i.test(B.USER_AGENT)
        B.IS_EDGE = /Edge/i.test(B.USER_AGENT)

        B.IS_IPAD = /iPad/i.test(B.USER_AGENT)
        B.IS_IPHONE = /iPhone/i.test(B.USER_AGENT) && !B.IS_IPAD
        B.IS_IPOD = /iPod/i.test(B.USER_AGENT)

        B.IS_IOS = B.IS_IPHONE || B.IS_IPAD || B.IS_IPOD
        B.IOS_VERSION = (B.USER_AGENT.match(/OS (\d+)_/i) || [])[1] || null

        B.IS_ANDROID = /Android/i.test(B.USER_AGENT)
        B.ANDROID_VERSION = (function() {
            const match = B.USER_AGENT.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i)

            if (!match) return null

            const major = match[1] && parseFloat(match[1]),
                minor = match[2] && parseFloat(match[2])

            return major && minor
                ? parseFloat(match[1] + '.' + match[2])
                : major
        }())

        B.IS_OLD_ANDROID = B.IS_ANDROID && B.IS_WEBKIT && B.ANDROID_VERSION < 2.3
        B.IS_NATIVE_ANDROID = B.IS_ANDROID && B.ANDROID_VERSION < 5 && appleWebkitVersion < 537

        B.IS_CHROME = !B.IS_EDGE && (/Chrome/i.test(B.USER_AGENT) || /CriOS/i.test(B.USER_AGENT))
        B.CHROME_VERSION = (function() {
            const v = (B.USER_AGENT.match(/(Chrome|CriOS)\/(\d+)/) || [])[2]
            return v ? parseFloat(v) : null
        }())

        B.IS_IE8 = /MSIE\s8\.0/.test(B.USER_AGENT)
        B.IE_VERSION = (function() {
            let result = /MSIE\s(\d+)\.\d/.exec(B.USER_AGENT),
                version = result && parseFloat(result[1])

            if (!version &&
                /Trident\/7.0/i.test(B.USER_AGENT) &&
                /rv:11.0/.test(B.USER_AGENT)) {
                version = 11.0
            }

            return version
        }())

        B.IS_SAFARI = /Safari/i.test(B.USER_AGENT) && !B.IS_CHROME && !B.IS_ANDROID && !B.IS_EDGE
        B.IS_ANY_SAFARI = (B.IS_SAFARI || B.IS_IOS) && !B.IS_CHROME && !B.IS_FIREFOX

        B.MOBILE = /webOS|BlackBerry|IEMobile|Opera Mini/i.test(B.USER_AGENT)
        B.IS_MOBILE = B.IS_ANDROID || B.IS_IOS || B.MOBILE

        B.NATIVE_APP = !B.IS_CHROME && !B.IS_FIREFOX && !B.IS_SAFARI && !B.IS_EDGE && !B.IS_IE8 && /Mobile\/\d*/i.test(B.USER_AGENT)
        B.TAPTIC_ENGINE_SUPPORT = false

        B.SESSION_STORAGE_AVAILABLE = storageAvailable('sessionStorage')
        B.LOCAL_STORAGE_AVAILABLE = storageAvailable('localStorage')
        B.LOCALE_DATE_STRING_SUPPORTED = localeDateStringSupport()
        B.BACKDROP_FILTER_SUPPORTED = backdropFilterSupport()
        B.BACKGROUND_SIZE_SUPPORTED = backgroundSize()
        B.COMPRESSION_SUPPORTED = compressionSupport()
        B.DRAG_AND_DROP_CAPABLE = dragAndDropSupport()
        B.DEVICE_PIXEL_RATIO = devicePixelRatio()
        B.PASSIVE_SUPPORTED = passiveSupport()
        B.CSS_ELEMENT = cssElementSupport()
        B.TOUCH_ENABLED = touchEnabled()
        B.INDEXED_DB = IDBaccessible()
        B.IDB_TRANSACTION = transaction()
        B.IDB_KEY_RANGE = keyRange()

    } catch (e) {
    }

    return B
}
