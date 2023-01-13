// import { detectUserAgent } from '../utils/common/user-agent.mjs'

async function chrome76Detection()
{
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const { quota } = await navigator.storage.estimate()

        return quota < 120000000
    } else {
        return false
    }
}

function isNewChrome(userAgent)
{
    const pieces = userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/)

    return pieces == null || pieces.length !== 5
        ? undefined
        : pieces.map(piece => parseInt(piece, 10))[1] >= 76
}

const PrivateWindow = new Promise(resolve => {
    // const userAgent = detectUserAgent()

    try {

        const isSafari = navigator?.vendor && navigator.vendor.includes('Apple') && navigator?.userAgent &&
            !navigator.userAgent.includes('CriOS') &&
            !navigator.userAgent.includes('FxiOS')

        /* const isSafari = navigator.vendor && navigator.vendor.includes('Apple') &&
            !userAgent.includes('CriOS') && !userAgent.includes('FxiOS') */

        if (isSafari) { // Safari
            let e = false
            if (window.safariIncognito) {
                e = true
            } else {
                try {
                    window.openDatabase(null, null, null, null)
                    window.localStorage.setItem('test', '1')
                    resolve(false)
                } catch (t) {
                    e = true
                    resolve(true)
                }
            }
            if (!e) {
                window.localStorage.removeItem('test')
            }
        } else if (userAgent.includes('Firefox')) { // Firefox
            const db = indexedDB.open('test')
            db.onsuccess = resolve.bind(null, false)
            db.onerror = resolve.bind(null, true)
        } else if (userAgent.includes('Edge') || userAgent.includes('Trident') || userAgent.includes('msie')) { // Edge or IE
            if (!window.indexedDB && (window.PointerEvent || window.MSPointerEvent)) {
                resolve(true)
            } else {
                resolve(false)
            }
        } else { // Normally ORP or Chrome
            if (isNewChrome(userAgent)) {
                return resolve(chrome76Detection())
            }

            const fs = window.RequestFileSystem || window.webkitRequestFileSystem

            if (!fs) {
                resolve(null)
            } else {
                fs(window.TEMPORARY, 100, () => {
                    resolve(false)
                }, () => {
                    resolve(true)
                })
            }
        }

    } catch (e) {
        resolve(null)
    }
})

export function isPrivateWindow(callback)
{
    PrivateWindow.then(callback)
}
