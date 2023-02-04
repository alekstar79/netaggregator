const document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {}

/**
* @see https://github.com/sindresorhus/screenfull.js
*/
export const screenfull = (function(fullscreen) {
    const isEnabled = false, fn = {}

    if (!fullscreen.some(map => {
        if (map[1] in document) {
            for (let i = 0; i < map.length; i++) {
                fn[fullscreen[0][i]] = map[i]
            }

            return true
        }

        return false
    })) {
        return { isEnabled }
    }

    const eventMap = { change: fn.fullscreenchange, error: fn.fullscreenerror },

        handler = {
            request(element, options)
            {
                const self = this

                return new Promise((resolve, reject) => {
                    const onFullScreenEntered = () => {
                        self.off('change', onFullScreenEntered)
                        resolve(self.isFullscreen)
                    }

                    self.on('change', onFullScreenEntered)

                    element || (element = document.documentElement)

                    let returnPromise = element[fn.requestFullscreen](options)

                    if (returnPromise instanceof Promise) {
                        returnPromise.then(onFullScreenEntered).catch(reject)
                    }
                })
            },
            exit()
            {
                const self = this

                return new Promise((resolve, reject) => {
                    if (!self.isFullscreen) {
                        resolve(false)
                        return
                    }

                    const onFullScreenExit = () => {
                        self.off('change', onFullScreenExit)
                        resolve(self.isFullscreen)
                    }

                    self.on('change', onFullScreenExit)

                    let returnPromise = document[fn.exitFullscreen]()

                    if (returnPromise instanceof Promise) {
                        returnPromise.then(onFullScreenExit).catch(reject)
                    }
                })
            },
            toggle(element, options)
            {
                return this.isFullscreen ? this.exit() : this.request(element, options)
            },
            onchange(callback)
            {
                this.on('change', callback)
            },
            onerror(callback)
            {
                this.on('error', callback)
            },
            on(event, callback)
            {
                const eventName = eventMap[event]

                if (eventName) {
                    document.addEventListener(eventName, callback, false)
                }
            },
            off(event, callback)
            {
                const eventName = eventMap[event]

                if (eventName) {
                    document.removeEventListener(eventName, callback, false)
                }
            }
        }

    Object.defineProperties(handler, {
        isFullscreen: {
            get() {
                return Boolean(document[fn.fullscreenElement])
            }
        },
        element: {
            enumerable: true,
            get() {
                return document[fn.fullscreenElement]
            }
        },
        isEnabled: {
            enumerable: true,
            get() {
                return Boolean(document[fn.fullscreenEnabled])
            }
        }
    })

    return handler

})([
    [
        'requestFullscreen',
        'exitFullscreen',
        'fullscreenElement',
        'fullscreenEnabled',
        'fullscreenchange',
        'fullscreenerror'
    ],[
        'webkitRequestFullscreen',
        'webkitExitFullscreen',
        'webkitFullscreenElement',
        'webkitFullscreenEnabled',
        'webkitfullscreenchange',
        'webkitfullscreenerror'
    ],[
        'webkitRequestFullScreen',
        'webkitCancelFullScreen',
        'webkitCurrentFullScreenElement',
        'webkitCancelFullScreen',
        'webkitfullscreenchange',
        'webkitfullscreenerror'
    ],[
        'mozRequestFullScreen',
        'mozCancelFullScreen',
        'mozFullScreenElement',
        'mozFullScreenEnabled',
        'mozfullscreenchange',
        'mozfullscreenerror'
    ],[
        'msRequestFullscreen',
        'msExitFullscreen',
        'msFullscreenElement',
        'msFullscreenEnabled',
        'MSFullscreenChange',
        'MSFullscreenError'
    ]
])
