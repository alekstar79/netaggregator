<template>
    <section v-scroll="onScroll" :class="{ smallscreen }" class="testimonials__one" id="testimonials">
        <!--<img src="/img/starter/shapes/contact-shape-3.png" class="app-shot__shape-1" alt="">-->
        <!--<img src="/img/starter/shapes/contact-shape-2.png" class="app-shot__shape-2" alt="">-->
        <!--<img src="/img/starter/shapes/testi-shape-1.png" class="testimonials__one-shape-1" alt="">-->
        <!--<img src="/img/starter/shapes/testi-shape-2.png" class="testimonials__one-shape-2" alt="">-->
        <!--<img src="/img/starter/shapes/map-1-1.png" class="map-img" alt="">-->

        <zimed-world-map class="map-img" />

        <div class="container">
            <div class="row">
                <div v-if="!smallscreen" class="col-lg-6 d-flex">
                    <div v-wow class="my-auto wow fadeInUp" data-wow-duration="1500ms">
                        <div id="testimonials-slider-pager">
                            <svg viewBox="0 0 474 474" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="237" cy="237" r="130" stroke="none" stroke-width="0" fill="#000" fill-opacity="0.05" />
                                <circle cx="237" cy="237" r="180" stroke="none" stroke-width="0" fill="#000" fill-opacity="0.05" />
                                <circle cx="237" cy="237" r="230" transform="rotate(90 237 237)" stroke="url(#testi-circle-gradient)" stroke-width="10" fill="none" />

                                <defs>
                                    <linearGradient id="testi-circle-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stop-color="#B230A7" />
                                        <stop offset="100%" stop-color="#4B0E8F" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <zimed-pager v-bind="{ slides: pager1, active }" class="testimonials-slider-pager-one" />
                            <zimed-pager v-bind="{ slides: pager2, active }" class="testimonials-slider-pager-two" />
                        </div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="block-title text-left">
                        <span class="block-title__bubbles" />
                        <p>{{ $t('zimed.benefits_block') }}</p>
                    </div>

                    <client-only>
                        <swiper :options="options" class="bx-wrapper" auto-destroy>
                            <template v-for="({ title, text }, i) in slides">
                                <swiper-slide :key="i">
                                    <h1>{{ $t(`zimed.${title}`) }}</h1>
                                    <p>{{ $t(`zimed.${text}`) }}</p>
                                </swiper-slide>
                            </template>
                        </swiper>
                    </client-only>

                    <div class="bx-controls-direction">
                        <v-icon class="bx-prev">
                            mdi-chevron-left
                        </v-icon>
                        <v-icon class="bx-next">
                            mdi-chevron-right
                        </v-icon>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import { Swiper as SwiperClass, Navigation, Pagination, Autoplay } from 'swiper/core'
    import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter'

    import { getCoords } from '~/utils/common/coords.mjs'
    import { wow } from '~/directives/wow'

    SwiperClass.use([Navigation, Pagination, Autoplay])

    /**
     * todo: place in utilities
     */
    function polarToCartesian(cx, cy, r, angle)
    {
        angle = (angle - 90) * Math.PI / 180

        return {
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        }
    }

    export default {
        components: {
            ...getAwesomeSwiper(SwiperClass)
        },
        directives: {
            wow
        },
        props: {
            slides: {
                type: Array,
                required: true
            }
        },
        computed: {
            pager1() {
                const ds = this.radius - 30

                return this.slides.map(({ src }, i) => {
                    const { x, y } = polarToCartesian(ds, ds, this.radius, this.angle * i)

                    return {
                        src,
                        style: {
                            left: Math.round(x) + 'px',
                            top: Math.round(y) + 'px'
                        }
                    }
                })
            },
            pager2() {
                return this.slides.map(({ src }) => ({ src, style: {} }))
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            smallscreen() {
                // const { window: size } = this.$store.state.app

                return this.mobile

                /* return size
                    ? this.mobile && size.diagonal < 927
                    : this.mobile */
            }
        },
        data() {
            const self = this

            return {
                swiper: null,

                angle: 360 / this.slides.length,
                radius: 232,
                active: 0,
                min: 0,
                max: 0,

                options: {
                    wrapperClass: 'slider testimonials-slider',
                    slideClass: 'testimonials__one__single',
                    touchStartPreventDefault: false,
                    allowTouchMove: true,
                    autoHeight: true,
                    grabCursor: true,
                    loop: true,

                    on: {
                        slideChange: ({ realIndex }) => self.active = realIndex
                    },
                    pagination: {
                        el: '.testimonials-slider-pager-one',
                        bulletActiveClass: 'active',
                        bulletClass: 'pager-item',
                        clickable: true,
                        type: 'custom'
                    },
                    navigation: {
                        nextEl: '.bx-next',
                        prevEl: '.bx-prev'
                    },
                    autoplay: {
                        disableOnInteraction: false,
                        delay: 5000
                    }
                }
            }
        },
        watch: {
            '$store.state.app.window': 'positioning'
        },
        methods: {
            positioning()
            {
                const { top, height } = getCoords(this.$el)

                this.max = top + height
                this.min = top
            },
            emitVisibility(data)
            {
                this.$bus.$emit('scroll:goal', { id: 'testimonials', ...data })
            },
            onScroll(event)
            {
                const offsetTop = event.target.scrollingElement.scrollTop

                if (offsetTop > this.min && offsetTop < this.max) {
                    this.emitVisibility({ min: this.min, max: this.max })
                }
            }
        },
        mounted()
        {
            this.$nextTick().then(this.positioning)
        }
    }
</script>

<style lang="scss" scoped>
    .testimonials__one .container {
        ::v-deep .swiper-container {
            max-width: 100%;
            margin-bottom: 20px;
            overflow: hidden;

            .testimonials-slider {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;

                .testimonials__one__single {
                    user-select: none;
                    flex-shrink: 0;
                    cursor: move;
                }
            }
        }
    }
</style>
