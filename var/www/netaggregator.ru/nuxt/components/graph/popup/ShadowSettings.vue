<template>
    <graph-drag
        hash="shadow-dialog"
        class="drag-shadow-settings"
        @close="$emit('tool:cancel')"
        :title="$t('graph.shadow')"
        :close="true"
        :snap="snap"
    >
        <div v-if="current" class="shadow-popup">
            <v-flex class="shadow__color-picker">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.shadow') }}
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
                                    :color="current.color"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    {{ shadowRgba.a >= .01 ? ' ' : 'transparent' }}
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    v-model="shadowRgba"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="shadow__offset-slider">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.offset_x') }}
                    </template>

                    <template #content>
                        <vue-slider v-bind="offsetOptions" v-model="offsetX" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="shadow__offset-slider">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.offset_y') }}
                    </template>

                    <template #content>
                        <vue-slider v-bind="offsetOptions" v-model="offsetY" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="shadow__blur-slider">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.blur') }}
                    </template>

                    <template #content>
                        <vue-slider v-bind="blurOptions" v-model="blur" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="shadow__multiplier">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.multiplier') }}
                    </template>

                    <template #content>
                        <vue-slider v-bind="multiOptions" v-model="multiplier" width="100%" />
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
    import { debounce } from '~/utils/common/debounce.mjs'

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

    const fix = debounce(function() { this.canvas.trigger('programmatic') }),

        options = {
            processStyle: { backgroundColor: '#5181b8' },
            useKeyboard: true,
            clickable: true,
            width: 'auto',
            duration: .5,
            dotSize: 10,
            interval: 1,
            height: 4
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
            offsetOptions() {
                return {
                    min: -150 * this.multiplier, // -1200,
                    max: 150 * this.multiplier,  // 1200
                    ...options
                }
            },
            blurOptions() {
                return {
                    max: 50 * this.multiplier, // 300,
                    min: 0,
                    ...options
                }
            },
            shadowRgba: {
                set(v) {
                    if (!this.current) return

                    this.current.color = rgbaStringify(v)
                },
                get() {
                    const { color } = this.current || { color: 'rgba(0,0,0,1)' }

                    return rgbaParse(color)
                }
            },
            offsetX: {
                set(v) {
                    if (!this.current) return

                    this.current.offsetX = v
                },
                get() {
                    const { offsetX } = this.current || { offsetX: 0 }

                    while (offsetX > this.offsetOptions.max) {
                        this.increment()
                    }
                    while (offsetX < this.offsetOptions.min) {
                        this.decrement()
                    }

                    return offsetX
                }
            },
            offsetY: {
                set(v) {
                    if (!this.current) return

                    this.current.offsetY = v
                },
                get() {
                    const { offsetY } = this.current || { offsetY: 0 }

                    while (offsetY > this.offsetOptions.max) {
                        this.increment()
                    }
                    while (offsetY < this.offsetOptions.min) {
                        this.decrement()
                    }

                    return offsetY
                }
            },
            blur: {
                set(v) {
                    if (!this.current) return

                    this.current.blur = v
                },
                get() {
                    const { blur } = this.current || { blur: 0 }

                    while (blur > this.blurOptions.max) {
                        this.increment()
                    }
                    while (blur < this.blurOptions.min) {
                        this.decrement()
                    }

                    return blur
                }
            },
            canvas() {
                return this.$parent.canvas || {}
            }
        },
        watch: {
            current: {
                handler: 'onChange',
                deep: true
            }
        },
        data: () => ({
            multiplier: 1,
            current: null,
            apply: false,

            multiOptions: {
                ...options,
                min: 1,
                max: 5
            }
        }),
        methods: {
            copy()
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(RGBAToHexA(this.shadowRgba)))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            onChange()
            {
                this.canvas.requestRenderAll()

                this.apply && fix.call(this)

                this.apply = true
            },
            setShadow(obj)
            {
                obj.setShadow({
                    color: 'rgba(0,0,0,1)',
                    offsetX: 0,
                    offsetY: 0,
                    blur: 0
                })
            },
            increment()
            {
                this.multiplier++
            },
            decrement()
            {
                this.multiplier--
            }
        },
        beforeDestroy()
        {
            this.current = null

            this.apply = false
        },
        beforeMount()
        {
            const obj = this.canvas.getActiveObject()

            if (!obj.shadow) this.setShadow(obj)

            this.current = obj.shadow
        }
    }
</script>

<style lang="scss" scoped>
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
    .drag-shadow-settings {
        max-width: 210px;
        transition: none;

        .shadow-popup {
            .shadow__offset-slider,
            .shadow__blur-slider,
            .shadow__multiplier {
                cursor: pointer;

                ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                    max-height: 30px;

                    user-select: none;
                    cursor: pointer;

                    fieldset {
                        padding: 0 8px;
                    }
                    .v-select__slot {
                        min-height: unset;

                        .v-select__selections {
                            justify-content: space-between;
                        }
                        label {
                            top: 4px;
                        }
                    }
                }
            }
        }
    }
</style>
