export community from './community'

export intro from './intro'
export steps from './steps'
export slide from './slide'
export error from './error'
export login from './login'

/**
* @param {Number} timeoutId
* @return {Function}
*/
function canceler(timeoutId)
{
    window.addEventListener('popstate', eventHandler)

    function eventHandler()
    {
        window.removeEventListener('popstate', eventHandler)
        clearTimeout(timeoutId)
    }

    return eventHandler
}

/**
* @param {Function} callback
* @param {Number} ms
* @return {Function}
*/
function executer(callback, ms = 900)
{
    return canceler(
        setTimeout(() => {
            try {

                callback()

            } catch (e) {
            }

        }, ms)
    )
}

export const goBack = {
    methods: {
        async goBack(to = null, alt = '/chatbot')
        {
            try {

                return await this.$router.push(to)

            } catch (e) {
            }

            let removeEvent, origin, history, current, prev, path

            origin = document.referrer.includes(window.location.host)

            if (this.$routerHistory.hasPrevious()) {
                path = (this.$routerHistory.previous()?.path || '').split('?', 2)[0]

                if (path === window.location.pathname) {
                    path = undefined
                }
            }
            if (!path && (history = this.$routerHistory.getHistory()).length > 1) {
                current = this.$routerHistory.getCurrent()

                prev = current > 0 ? current - 1 : history.length - 1
            }
            if (prev && history[prev]) {
                path = history[prev].split('?', 2)[0]

                if (path === window.location.pathname) {
                    path = undefined
                }
            }

            path || (path = alt)

            removeEvent = executer(() => this.$router.push(alt))

            try {

                await (
                    origin && window.history.length > 2
                        ? this.$router.go(-1)
                        : this.$router.push(path)
                )

                removeEvent()

            } catch (e) {
            }
        }
    }
}

export const hide = {
    methods: {
        hide()
        {
            this.$nextTick(() => {
                // Content Security Policy: unsafe-inline
                // this.$refs.combobox.$refs.input.setAttribute('onfocus', 'blur();')
                this.$refs.combobox.$refs.input.setAttribute('readonly', 'readonly')
                this.$refs.combobox.$refs.input.setAttribute('tabindex', '-1')
            })
        }
    }
}

export const wrapper = {
    watch: {
        '$store.state.app.window': 'calcScreen',
        $screen: {
            handler: 'setWrapper',
            deep: true
        }
    },
    methods: {
        calcScreen({ width, height })
        {
            let v = 1000000000 / Math.pow(width, 3)

            if (v < 1.1) v = 0

            document.documentElement.style.setProperty('--screen-height', height)
            document.documentElement.style.setProperty('--screen-width', width)
            document.documentElement.style.setProperty('--swp', `${v}%`)
        },
        setWrapper()
        {
            const { clientHeight: height, clientWidth: width } = this.$el,
                screen = this.$screen,

                payload = {
                    window: {
                        diagonal: Math.ceil(Math.hypot(screen.height, screen.width)),
                        height: screen.height,
                        width: screen.width
                    },
                    wrapper: {
                        height,
                        width
                    }
                }

            this.$store.commit('app/set', payload)
            this.$bus.$emit('window:changed')
        }
    },
    mounted()
    {
        this.$nextTick().then(this.setWrapper)// .then(this.calcScreen)
    }
}

export const codemirror = {
    methods: {
        cmImport()
        {
            if (!process.client || this.$store.state.app.codemirror) return

            import(/* webpackChunkName: "codemirror" */ '~/plugins/codemirror').then(() => {
                this.$store.commit('app/set', { codemirror: true })
            })
        }
    }
}

export const round = {
    filters: {
        round(num)
        {
            return Math.round((num + Number.EPSILON) * 100) / 100
        }
    }
}

export const context = {
    methods: {
        setContext(event)
        {
            this.$store.commit('context/set', { event })
        }
    }
}

export const help = {
    computed: {
        color() {
            return this.$vuetify.theme.dark ? 'grey' : this.$store.state.app.color
        },
        mobile() {
            return !!(this.$BROWSER || {}).IS_MOBILE
        }
    },
    data: () => ({
        smooth: null
    }),
    methods: {
        initScroll()
        {
            if (this.smooth) return

            if (this.mobile) {
                import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                    .then(m => m.default || m)
                    .then(Scrollbar => {
                        this.smooth = Scrollbar(this.$el, {
                            scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' },
                            overflowBehavior: { x: 'hidden', y: 'scroll' }
                        })
                    })

            } else {
                import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                    .then(m => m.default || m)
                    .then(Scrollbar => {
                        this.smooth = Scrollbar.init(this.$el, {
                            damping: this.mobile ? .5 : 1,
                            continuousScrolling: false
                        })

                        this.smooth.updatePluginOptions('overscroll', {
                            enable: false
                        })
                    })
            }
        }
    },
    mounted()
    {
        this.$nextTick().then(this.initScroll)
    }
}

export const cache = {
    methods: {
        clearCache()
        {
            if ('serviceWorker' in navigator) {
                (async () => { try {
                    const w = await window.$workbox

                    for (const e of Object.values(w)) {
                        if (e instanceof ServiceWorkerRegistration) {
                            await e.unregister()

                            for (const cache of await caches.keys()) {
                                await caches.delete(cache)
                            }

                            await w.register()

                            setTimeout(() => {
                                window.location.reload()
                            }, 250)
                        }
                    }

                } catch (e) {

                } })()
            }
        }
    }
}
