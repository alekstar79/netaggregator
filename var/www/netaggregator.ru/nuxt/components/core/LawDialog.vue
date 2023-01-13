<template>
    <v-dialog v-model="show"
        content-class="help-dialog"
        :max-width="mobile ? '100%' : '700px'"
        :fullscreen="mobile || force"
        :persistent="force"
        no-click-animation
        eager
    >
        <core-help
            :hint="hint"
            :fullscreen="mobile || force"
            :module="lawModules[lawModuleIdx]"
            @middle="toggleState"
            @close="show = false"
            @next="next"
            @prev="prev"
        >
            <swiper :options="sliderOptions" @ready="onReady" auto-destroy>
                <template v-for="h in lawModules">
                    <swiper-slide :key="h.module">
                        <lazy-component
                            @close="show = false"
                            :fullscreen="mobile || force"
                            :is="h.module"
                        />
                    </swiper-slide>
                </template>
            </swiper>
        </core-help>
    </v-dialog>
</template>

<script>
    import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter'
    import { Swiper as SwiperClass } from 'swiper/core'

    import { debounce } from '~/utils/common/debounce.mjs'
    import { rclamp } from '~/utils/common/clamp.mjs'

    export default {
        props: {
            value: {
                type: Boolean,
                required: true
            }
        },
        model: {
            event: 'toggle',
            prop: 'value'
        },
        components: getAwesomeSwiper(SwiperClass),
        // components: {
        //     SwiperSlide: () => import(/* webpackChunkName: "swiper" */ 'vue-awesome-swiper').then(m => m.SwiperSlide),
        //     Swiper: () => import(/* webpackChunkName: "swiper" */ 'vue-awesome-swiper').then(m => m.Swiper)
        // },
        computed: {
            lawModules() {
                return [
                    { module: 'docs-agreement', tab: 'agreement', section: 'global' },
                    { module: 'docs-privacy',   tab: 'privacy',   section: 'global' },
                    { module: 'docs-payment',   tab: 'payment',   section: 'global' }
                ]
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            show: {
                set(v) {
                    this.$emit('toggle', v)
                },
                get() {
                    return this.value
                }
            }
        },
        watch: {
            force: 'updateSwiper',

            show(v) {
                v ? this.updateSwiper() : this.reset()
            }
        },
        data: () => ({
            lawModuleIdx: 0,
            swiper: null,

            force: false,
            hint: false,

            sliderOptions: {
                observer: true,
                observeSlideChildren: true,
                touchStartPreventDefault: false,
                allowTouchMove: true,
                centeredSlides: true,
                autoHeight: true,
                spaceBetween: 20
            }
        }),
        methods: {
            onReady(swiper)
            {
                if (this.swiper) return

                this.swiper = swiper

                this.attachEvents()
                this.updateSwiper()
            },
            attachEvents()
            {
                this.swiper.off('slideNextTransitionStart', this.next)
                this.swiper.off('slidePrevTransitionStart', this.prev)

                if (this.sliderOptions.allowTouchMove) {
                    this.swiper.on('slideNextTransitionStart', this.next)
                    this.swiper.on('slidePrevTransitionStart', this.prev)
                }
            },
            toggleState()
            {
                const key = this.mobile ? 'show' : 'force'

                this[key] = !this[key]
            },
            updateSwiper: debounce(function()
            {
                this.swiper && this.swiper.update()

            }, 300),
            showDoc({ id })
            {
                const multiply = this.slideTo(id),
                    ms = rclamp(100 * multiply, 100, 500)

                setTimeout(() => {
                    this.hint = true
                    this.show = true

                }, ms)
            },
            slideTo(idx)
            {
                if (idx < 0 || !this.lawModules[idx]) return 0

                this.lawModuleIdx = idx

                if (!this.sliderOptions.allowTouchMove) {
                    this.swiper && this.swiper.slideTo(idx)
                    return .75 * idx
                }

                return 0
            },
            next()
            {
                this.slideTo(this.lawModuleIdx + 1)
            },
            prev()
            {
                this.slideTo(this.lawModuleIdx - 1)
            },
            reset()
            {
                this.force = false
                this.hint = false
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('show:doc', this.showDoc)
        },
        created()
        {
            this.$bus.$on('show:doc', this.showDoc)
        },
        beforeMount()
        {
            this.sliderOptions.allowTouchMove = this.mobile
        }
    }
</script>
