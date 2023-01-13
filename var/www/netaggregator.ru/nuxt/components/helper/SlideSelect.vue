<template>
    <div :class="`slide-select theme--${$vuetify.theme.dark ? 'dark' : 'light'}`" ref="wrapper">
        <v-icon class="mx-prev">
            mdi-chevron-left
        </v-icon>

        <swiper :options="sliderOptions" auto-destroy>
            <template v-for="(m, i) in options">
                <swiper-slide :key="`widget-${i}-${m.id}`">
                    {{ m.desc }}
                </swiper-slide>
            </template>
        </swiper>

        <v-icon class="mx-next">
            mdi-chevron-right
        </v-icon>
    </div>
</template>

<script>
    import { Swiper as SwiperClass, Navigation } from 'swiper/core'
    import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter'

    SwiperClass.use([Navigation])

    export default {
        components: {
            ...getAwesomeSwiper(SwiperClass)
        },
        props: {
            value: {
                required: true
            },
            options: {
                required: true,
                type: Array
            }
        },
        computed: {
            selected: {
                set(v) {
                    this.$emit('input', v)
                },
                get() {
                    return this.value
                }
            }
        },
        data() {
            const self = this

            return {
                sliderOptions: {
                    touchStartPreventDefault: false,
                    allowTouchMove: true,
                    grabCursor: true,

                    on: {
                        slideChange: ({ realIndex: id }) => self.selected = self.options[id]
                    },
                    navigation: {
                        nextEl: '.mx-next',
                        prevEl: '.mx-prev'
                    }
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .slide-select {
        display: flex;
        height: 60px;

        .swiper-container {
            display: flex;
            height: 100%;

            .swiper-slide {
                max-width: 100%;
                text-align: center;
                line-height: 60px;
                user-select: none;
            }
        }
        i {
            cursor: pointer;
            font-size: 32px;
            text-indent: 0;
        }
    }
</style>
