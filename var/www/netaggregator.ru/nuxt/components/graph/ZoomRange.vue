<template>
    <client-only>
        <vue-slider
            v-model="scale"
            v-bind="options"
            :class="{ mobile, active }"
            @drag-start="active = true"
            @drag-end="active = false"
            direction="btt"
            height="80vh"
            width="8px"
        >
            <template #tooltip="{ value }">
                <div class="vue-slider-dot-tooltip vue-slider-dot-tooltip-left">
                    <div class="vue-slider-dot-tooltip-inner vue-slider-dot-tooltip-inner-left">
                        <span class="vue-slider-dot-tooltip-text">{{ value | round }}</span>
                    </div>
                </div>
            </template>
        </vue-slider>
        <!--<v-slider
            v-model="scale"
            :min="limit.min"
            :max="limit.max"
            :track-color="color"
            :color="color"
            height="100%"
            v-ripple="false"
            hide-details
            vertical
        />-->
    </client-only>
</template>

<script>
    import { tracker } from '~/mixins/canvas/index.mjs'

    const zMin = .25, zMax = 2

    export default {
        mixins: [tracker],

        components: {
            VueSlider: () => import(/* webpackChunkName: "slider" */ 'vue-slider-component')
        },
        filters: {
            round(s) {
                return (s + .5 | 0) + '%'
            }
        },
        computed: {
            color() {
                return this.$store.state.app.color
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            scaled: {
                set(scaled) {
                    this.$store.commit('canvas/set', { scaled })
                },
                get() {
                    return this.$store.state.canvas.scaled
                }
            },
            scale: {
                set(v) {
                    this.zoom(((v / 100) - this.scaled.scale) > 0 ? .01 : -.01)
                },
                get() {
                    const s = 100 * this.scaled.scale.toFixed(2),
                        { max, min } = this.options

                    return s >= max ? max : s <= min ? min : s + .5 | 0
                }
            }
        },
        data() {
            const { height, width } = this.$store.state.canvas.origin,
                { diagonal } = this.$store.state.canvas,
                hypot = Math.hypot(width, height),

                max = (100 * diagonal * zMax / hypot) + .5 | 0,
                min = (100 * diagonal * zMin / hypot) + .5 | 0,

                interval = (max - min) / 100

            return {
                active: false,

                options: {
                    processStyle: { backgroundColor: '#5181b8' },
                    useKeyboard: true,
                    clickable: true,
                    direction: 'btt',
                    duration: .3,
                    dotSize: 20,
                    interval,
                    min,
                    max
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .vue-slider.vue-slider-btt {
        position: absolute;
        right: 40px;
        top: 50%;

        transform: translateY(-50%);

        ::v-deep .vue-slider-rail {
            background-color: rgba(204,204,204,.1) !important;
            cursor: pointer;

            .vue-slider-process {
                background-color: rgba(81,129,184,.1) !important;
            }
        }
        &.mobile {
            right: 25px;
        }
        &.active {
            ::v-deep .vue-slider-rail {
                background-color: rgba(204,204,204,.5) !important;

                .vue-slider-process {
                    background-color: rgba(81,129,184,.5) !important;
                }
            }
        }
    }
    /* .v-input__slider.v-input__slider--vertical {
        position: absolute;
        right: 50px;
        top: 50%;

        height: 80%;
        width: 8px;

        transform: translateY(-50%);

        ::v-deep .v-input__slot {
            height: 100%;

            .v-slider.v-slider--vertical {
                height: 100%;

                .v-slider__track-container {
                    width: 8px;

                    cursor: pointer;

                    .v-slider__track-background,
                    .v-slider__track-fill {
                        background-color: rgba(81,129,184,.1) !important;
                    }
                }
                .v-slider__thumb-container {
                    .v-slider__thumb {
                        height: 20px;
                        width: 20px;
                        left: -10px;

                        cursor: pointer;

                        box-shadow:
                            0 3px 1px -2px rgba(0,0,0,.2),
                            0 2px 2px 0 rgba(0,0,0,.14),
                            0 1px 5px 0 rgba(0,0,0,.12) !important;

                        &::before {
                            display: none;
                            height: 0;
                            width: 0;
                        }
                    }
                }
                &.v-slider--active {
                    .v-slider__track-container {
                        .v-slider__track-background,
                        .v-slider__track-fill {
                            background-color: rgba(81,129,184,.5) !important;
                        }
                    }
                    .v-slider__thumb-container {
                        .v-slider__thumb {
                            height: 30px;
                            width: 30px;
                            left: -15px;
                        }
                    }
                }
            }
        }
    } */
</style>
