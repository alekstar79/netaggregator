import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter'
import { Swiper as SwiperClass } from 'swiper/core'

import { debounce } from '~/utils/common/debounce.mjs'

function resolve() {}

export default {
    components: getAwesomeSwiper(SwiperClass),

    data: () => ({
        currentModuleIdx: 0,
        swiper: null,

        tid: null,
        sid: null,

        resolve,

        /**
         * @see https://swiperjs.com/api
         */
        options: {
            observer: true,
            observeSlideChildren: true,

            touchStartPreventDefault: false,
            allowTouchMove: true,

            centeredSlides: true,
            autoHeight: true,
            userAgent: null,

            spaceBetween: 20
        }
    }),
    computed: {
        mobile() {
            return !!(this.$BROWSER || {}).IS_MOBILE
        }
    },
    watch: {
        '$store.state.app.window': 'updateSwiper',

        swiper: 'onReady'
    },
    methods: {
        onReady(swiper)
        {
            this.$emit('swiper:ready')

            this.swiper = swiper

            this.attachEvents()
            this.updateSwiper()

            /* if (!this.mobile) {
                this.toggleTilt()
            } */
        },
        attachEvents: debounce(function()
        {
            this.swiper.off('slideNextTransitionStart', this.next)
            this.swiper.off('slidePrevTransitionStart', this.prev)
            this.$bus.$off('context:on-change', this.changeEntity)

            if (this.options.allowTouchMove) {
                this.swiper.on('slideNextTransitionStart', this.next)
                this.swiper.on('slidePrevTransitionStart', this.prev)
            } else {
                this.$bus.$on('context:on-change', this.changeEntity)
            }

        }, 10),
        updateSwiper(/* { update } = {} */)
        {
            this.sid && clearTimeout(this.sid)

            this.sid = setTimeout(() => { try {
                this.swiper && this.swiper.update()
                // update && this.$forceUpdate()

            } catch (e) {
            } })
        },
        /* toggleTilt()
        {
            this.$store.state.app.tilt ? this.tiltOn() : this.tiltOff()
        },
        tiltOff()
        {
            if (!this.swiper || !this.swiper.el) return

            if (this.swiper.el.vTilt) {
                this.swiper.el.vTilt.destroy()
            }
        },
        tiltOn()
        {
            if (!this.swiper) return

            import(/* webpackChunkName: "tilt" *!/ '~/utils/tilt').then(({ Tilt }) => {
                Tilt.init(this.swiper.el, { speed: 400, axis: 'x', max: 4 })

            }).catch(e => {
                this.$bus.$emit('snack', {
                    content: e.message,
                    color: 'error'
                })
            })
        }, */
        setActiveContext()
        {
            const { active } = this.$store.state.context

            this.$store.commit('context/set', {
                active: { ...active, [this.module]: this.entity }
            })
        },
        slideTo(idx)
        {
            if (!this.modules[idx]) return

            this.currentModuleIdx = idx

            if ('entity' in this.modules[idx]) {
                this.entity = this.modules[idx].entity
                this.setActiveContext()
            }
        },
        swipe(transit)
        {
            this.tid && this.free()

            return new Promise(resolve => {
                this.resolve = resolve

                this.tid = setTimeout(() => {
                    this.tid = null

                    try {

                        this.currentModuleIdx = transit.next

                        const speed = this.presentation ? 390 : 1e3

                        if (this.swiper.slideTo(transit.next, speed, false)) {
                            this.$bus.$emit('swipe:completed')
                        }

                    } catch (e) {
                    }

                    resolve({ update: true })
                })
            })
        },
        free()
        {
            clearTimeout(this.tid)

            this.resolve()
        },
        next()
        {
            this.slideTo(this.currentModuleIdx + 1)
        },
        prev()
        {
            this.slideTo(this.currentModuleIdx - 1)
        },
        changeEntity: debounce(function({ icon })
        {
            this.entity = icon

        }, 10)
    },
    beforeDestroy()
    {
        if (!this.options.allowTouchMove) {
            this.$bus.$off('context:on-change', this.changeEntity)
            this.setContext && this.setContext(null)
        }
        if (this.module) {
            this.$bus.$off(`${this.module}:next`, this.next)
            this.$bus.$off(`${this.module}:prev`, this.prev)
        }
    },
    beforeMount()
    {
        this.options.url || (this.options.url = window.location.href)

        this.options.allowTouchMove = this.mobile
    },
    created()
    {
        this.currentModuleIdx = this.modules.findIndex(m => m.entity === this.entity)
        this.options.userAgent = this.$useragent

        if (this.module) {
            this.$bus.$on(`${this.module}:next`, this.next)
            this.$bus.$on(`${this.module}:prev`, this.prev)
        }
        if (this.$url) {
            this.options.url = this.$url
        }
    }
}
