<template>
    <graph-drag
        hash="text"
        @close="cancel"
        class="drag-text"
        :title="$t('graph.text')"
        :close="true"
        :snap="snap"
    >
        <div class="text-pane">
            <v-select
                v-model="current"
                item-text="family"
                :label="$t('graph.font')"
                :color="color"
                :items="list"
                class="pt-1"
                return-object
                hide-details
                outlined
                dense
                :menu-props="{
                    contentClass: 'text-fonts-menu',
                    maxWidth: 200
                }"
            >
                <template #item="{ item, on }">
                    <v-list-item v-on="on" class="ellipsisfont" :class="item.value">
                        {{ item.family }}
                    </v-list-item>
                </template>
            </v-select>

            <v-flex class="fill-color pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.fill_color') }}
                    </template>

                    <template #content>
                        <v-menu
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    :color="$store.state.canvas.textOptions.fill"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    {{ rgbaFill.a >= .01 ? '&nbsp;' : 'transparent' }}
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    v-model="rgbaFill"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('rgbaFill')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="stroke-color pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.stroke_color') }}
                    </template>

                    <template #content>
                        <v-menu
                            transition="slide-y-transition"
                            content-class="stroke-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    :color="$store.state.canvas.textOptions.stroke"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    {{ rgbaStroke.a >= .01 ? '&nbsp;' : 'transparent' }}
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    v-model="rgbaStroke"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('rgbaStroke')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="stroke-width pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.stroke_width') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="strokeWidth" v-bind="options" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>
        </div>
    </graph-drag>
</template>

<script>
    import { VColorPickerPatched as VColorPicker } from '~/utils/v-color-picker-patch'
    import { rgbaStringify } from '~/utils/common/rgba-stringify.mjs'
    import { rgbaParse } from '~/utils/common/rgba-parse.mjs'
    import { lock, unlock } from '~/utils/canvas'

    import { fonts as list } from '~/assets/data/fonts.mjs'

    const drawer = () => ({ apply: () => Promise.reject() })

    /**
    * @see https://css-tricks.com/converting-color-spaces-in-javascript
    */
    function RGBAToHexA({ r, g, b, a })
    {
        a = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase()

        r = (+r).toString(16).padStart(2, '0').toUpperCase()
        g = (+g).toString(16).padStart(2, '0').toUpperCase()
        b = (+b).toString(16).padStart(2, '0').toUpperCase()

        return '#' + r + g + b + a
    }

    export default {
        components: {
            VueSlider: () => import(/* webpackChunkName: "slider" */ 'vue-slider-component'),
            VColorPicker
        },
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            strokeWidth: {
                set(strokeWidth) {
                    this.$store.commit('canvas/setTextOption', { strokeWidth })
                },
                get() {
                    return this.$store.state.canvas.textOptions.strokeWidth
                }
            },
            rgbaStroke: {
                get() {
                    const color = this.$store.state.canvas.textOptions.stroke

                    return rgbaParse(color)
                },
                set(v) {
                    this.$store.commit('canvas/setTextOption', {
                        stroke: rgbaStringify(v)
                    })
                }
            },
            rgbaFill: {
                get() {
                    const color = this.$store.state.canvas.textOptions.fill

                    return rgbaParse(color)
                },
                set(v) {
                    this.$store.commit('canvas/setTextOption', {
                        fill: rgbaStringify(v)
                    })
                }
            },
            drawers() {
                return this.$parent.drawers || []
            },
            drawer() {
                return this.$parent.drawer || drawer()
            },
            canvas() {
                return this.$parent.canvas || {}
            }
        },
        data: () => ({
            // url: 'https://fonts.googleapis.com/css?family={font}&subset=latin,cyrillic',
            // link: null,

            defaultCursor: null,
            canceleled: false,
            current: list[0],
            list,

            options: {
                processStyle: { backgroundColor: '#5181b8' },
                useKeyboard: true,
                clickable: true,
                duration: .5,
                dotSize: 10,
                interval: 1,
                width: 'auto',
                height: 4,
                max: 5,
                min: 0
            }
        }),
        watch: {
            current: 'apply'
        },
        methods: {
            copy(prop)
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(RGBAToHexA(this[prop])))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            setCursor(c)
            {
                const cursor = c || this.defaultCursor

                this.canvas.freeDrawingCursor = cursor
                this.canvas.defaultCursor = cursor

                this.$parent.fixedCursor = c
            },
            apply()
            {
                this.drawer.apply(this.current).then(() => {
                    this.$emit('change', this.drawer.drawingMode)

                }).catch(() => {
                })
            },
            cancel(emit = true)
            {
                if (this.canceleled) return

                this.canceleled = true

                this.setCursor()

                unlock(this.canvas)

                this.canvas.off({ 'mouse:up': this.onMouseUp })
                this.$parent.setMode(false)

                emit && this.$emit('tool:cancel')
            },
            onMouseUp(/* event */)
            {
                lock(this.canvas)
            }
            /**
            * Dropdown font selection
            * @see https://javascript.ru/forum/events/45083-kak-sdelat-na-sajjte-vybor-shrifta-polzovatelem-i-dinamicheskoe-izmenenie-vvedennogo-t.html#post297550
            */
            /* change(font)
            {
                if (this.link) {
                    this.link.href = this.url.replace('{font}', encodeURIComponent(font))
                    this.$refs.sample.style.fontFamily = font
                }
            },
            createLink()
            {
                this.link = document.createElement('link')
                this.link.rel = 'stylesheet'

                document.getElementsByTagName('head')[0]
                    .appendChild(this.link)
            } */
        },
        beforeDestroy()
        {
            this.cancel()
        },
        mounted()
        {
            this.$parent.drawer = this.drawers.find(d => d.type === 'c-text')
            this.defaultCursor = this.canvas.defaultCursor

            this.setCursor('crosshair')
            this.$parent.setMode(true)

            lock(this.canvas)

            this.canvas.on({ 'mouse:up': this.onMouseUp })
            // this.createLink()

            this.apply()
        }
    }
</script>

<style lang="scss" scoped>
    @import "assets/css/classes.css";

    .stroke-color-menu .color-dialog__body,
    .fill-color-menu .color-dialog__body {
        ::v-deep .v-color-picker {
            .v-color-picker__canvas {
                max-width: 210px;
            }
            .v-color-picker__controls {
                padding: 15px 10px 7px; // 16px 10px

                .v-color-picker__edit {
                    margin-top: 20px;

                    .v-color-picker__input {
                        input {
                            text-align: left;
                            padding-left: 10px;
                            margin-right: 30px;
                            margin-bottom: 0;
                        }
                        span {
                            display: none;
                        }
                    }
                }
            }
        }
        .v-btn.color-copy {
            position: absolute;
            bottom: 7px;
            right: 9px;

            height: 29px;
            min-width: unset;
            padding: 0 5px;
        }
    }
    .drag-text {
        max-width: 210px;

        .text-pane {
            ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                max-height: unset;
                user-select: none;

                .v-select__slot {
                    cursor: pointer;
                }
            }
            .stroke-width {
                ::v-deep .vue-slider {
                    cursor: pointer;
                }
            }
        }
    }
    .text-fonts-menu .v-list {
        display: flex;
        flex-direction: column;

        .v-list-item {
            padding: 10px 12px;
        }
    }
    .ellipsisfont {
        display: block;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 210px;
    }
</style>
