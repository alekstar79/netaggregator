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
            :module="helpModules[helpModuleIdx]"
            @middle="toggleState"
            @close="show = false"
            @next="next"
            @prev="prev"
        >
            <swiper :options="sliderOptions" @ready="onReady" auto-destroy>
                <template v-for="h in helpModules">
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
            helpModules() {
                const help = this.$store.state.help

                return help.section === 'common'
                    ? Object.keys(help).filter(k => !['designer','section'].includes(k))
                        .reduce((acc, k) => ([...acc, ...help[k]]), [])

                    : help.designer
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
            show(v) {
                v ? this.updateSwiper() : this.reset()
            },
            '$store.state.help.section'(v) {
                switch (v) {
                    case 'designer':
                        this.slideTo(0)
                        break

                    case 'common':
                        this.slideTo(2)
                        break
                }
            }
        },
        data: () => ({
            sliderOptions: {
                observer: true,
                observeSlideChildren: true,
                touchStartPreventDefault: false,
                allowTouchMove: true,
                centeredSlides: true,
                autoHeight: true,
                spaceBetween: 20
            },

            helpModuleIdx: 0,
            swiper: null,

            force: false,
            hint: false
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
            updateSwiper()
            {
                this.swiper && this.swiper.update()
            },
            showHint({ entity, id })
            {
                entity = this.$store.state.help[entity][id]

                const multiply = this.slideTo(this.helpModules.findIndex(h => h.module === entity?.module)),
                    ms = rclamp(100 * multiply, 100, 500)

                setTimeout(() => {
                    this.hint = this.show = true

                }, ms)
            },
            slideTo(idx)
            {
                if (idx < 0 || !this.helpModules[idx]) return 0

                this.helpModuleIdx = idx

                if (!this.sliderOptions.allowTouchMove) {
                    this.swiper && this.swiper.slideTo(idx)
                    return .75 * idx
                }

                return 0
            },
            next()
            {
                this.slideTo(this.helpModuleIdx + 1)
            },
            prev()
            {
                this.slideTo(this.helpModuleIdx - 1)
            },
            reset()
            {
                this.force = this.hint = false
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('show:hint', this.showHint)
        },
        created()
        {
            this.$bus.$on('show:hint', this.showHint)
        },
        beforeMount()
        {
            this.sliderOptions.allowTouchMove = this.mobile
        }
    }
</script>
