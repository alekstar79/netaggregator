<template>
    <graph-drag
        hash="drawshape"
        class="draw-settings"
        @close="$emit('tool:cancel')"
        :title="$t(`graph.${shape ? shape.type : 'draw'}`)"
        :close="true"
        :snap="snap"
    >
        <div v-if="shape" class="params-pane">
            <v-flex class="line-type pt-2">
                <v-select
                    v-model="shape.lineType"
                    :label="$t('graph.line_type')"
                    :items="options"
                    :item-color="color"
                    :color="color"
                    hide-details
                    outlined
                    dense
                />
            </v-flex>

            <v-flex class="line-thickness pt-3">
                <helper-fieldset :dense="true">
                    <template #label>
                        {{ $t('graph.line_size') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="shape.strokeWidth" v-bind="thickness" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="line-color pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.stroke_color') }}
                    </template>

                    <template #content>
                        <v-menu
                            transition="slide-y-transition"
                            content-class="line-color-menu"
                            :close-on-content-click="false"
                            max-width="210px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    :color="shape.stroke"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    {{ strokeRgba.a >= .01 ? '&nbsp;' : 'transparent' }}
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    v-model="strokeRgba"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('strokeRgba')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="fill__color-picker pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.fill_color') }}
                    </template>

                    <template #content>
                        <v-menu
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="210px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    :color="typeof shape.fill === 'string' ? shape.fill : 'rgba(0,0,0,0)'"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    {{ fillRgba.a >= .01 ? '&nbsp;' : 'transparent' }}
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    v-model="fillRgba"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('fillRgba')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="shape.type === 'rect'" class="radius pt-3">
                <v-text-field
                    v-model="radius"
                    :rules="[xV]"
                    :label="$t('graph.radius')"
                    :hide-details="!xE"
                    :color="color"
                    type="number"
                    outlined
                    dense
                />
            </v-flex>

            <v-flex v-if="shape.type !== 'line'" class="shape__pattern pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.pattern') }}
                    </template>

                    <template #content>
                        <v-btn
                            @click="openFile"
                            color="rgba(0,0,0,0)"
                            :ripple="false"
                            elevation="0"
                            x-small
                            block
                        >
                            {{ $t(`common.${pattern ? 'remove' : 'upload'}`) }}
                        </v-btn>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="shape.type !== 'line'" class="shape__repeat pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.repeat') }}
                    </template>

                    <template #content>
                        <v-checkbox
                            v-model="repeat"
                            :disabled="!pattern"
                            :label="repeat ? 'on' : 'off'"
                            :ripple="false"
                            :color="color"
                            hide-details
                        />
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
    import { openFile } from '~/utils/common/open.mjs'
    import { rclamp } from '~/utils/common/clamp.mjs'

    const validator = n => n < 0 ? 'The value cannot be less than zero' : true,

        options = {
            processStyle: { backgroundColor: '#5181b8' },
            useKeyboard: true,
            clickable: true,
            width: 'auto',
            dotSize: 10,
            interval: 1,
            duration: .5,
            height: 4
        }

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
            fillRgba: {
                set(v) {
                    this.shape.shapeFill = rgbaStringify(v)
                },
                get() {
                    try {

                        return rgbaParse(this.shape.fill)

                    } catch (e) {
                    }

                    return { r: 0, g: 0, b: 0, a: 0 }
                }
            },
            strokeRgba: {
                set(v) {
                    this.shape.strokeColor = rgbaStringify(v)
                },
                get() {
                    try {

                        return rgbaParse(this.shape.stroke)

                    } catch (e) {
                    }

                    return { r: 0, g: 0, b: 0, a: 0 }
                }
            },
            radius: {
                get() {
                    return rclamp(Number(this.shape.radius), 0, Infinity)
                },
                set(r) {
                    this.shape.radius = rclamp(Number(r), 0, Infinity)
                }
            },
            xE() {
                return this.xNotNumber || this.xOutOfRange || this.xError
            },
            xNotNumber() {
                return typeof this.radius !== 'number'
            },
            xOutOfRange() {
                return this.radius < 0
            },
            shape() {
                return this.$parent.canvas._objects.find(o => o.custom.unique === this.unique)
            },
            unique() {
                return this.$store.state.canvas.shape
            },
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            pattern() {
                return typeof this.shape.fill === 'object' && 'source' in this.shape.fill
            }
        },
        watch: {
            repeat(v) {
                this.shape.setPattern(this.shape.fill.source, v ? 'repeat' : 'no-repeat')
            },
            shape(v) {
                v || (setTimeout(() => {
                    this.$emit('tool:cancel')
                }, 1e2))
            }
        },
        data: () => ({
            xError: false,
            repeat: false,

            options: [
                { value: 'solid',  text: 'Solid'  },
                { value: 'dotted', text: 'Dotted' },
                { value: 'dashed', text: 'Dashed' }
            ],
            thickness: {
                ...options,
                max: 100,
                min: 0
            },
            offset: {
                ...options,
                min: -90,
                max: 90
            },
            blur: {
                ...options,
                max: 90,
                min: 0
            }
        }),
        methods: {
            copy(prop)
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(RGBAToHexA(this[prop])))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            xV(n)
            {
                const v = validator(n)

                this.xError = typeof v === 'string'

                return v
            },
            openFile()
            {
                if (!this.pattern) {
                    openFile('image/*').then(this.load.bind(this))
                } else {
                    this.fillRgba = { r: 0, g: 0, b: 0, a: 0 }
                }
            },
            load(file)
            {
                if (file.type.includes('image')) {
                    const r = new FileReader()

                    r.onload = () => {
                        this.shape.setPattern(r.result, this.repeat ? 'repeat' : 'no-repeat')
                        this.trigger()
                    }

                    r.readAsDataURL(file)
                }
            },
            isRepeat()
            {
                return this.pattern ? this.shape.fill.repeat === 'repeat' : false
            },
            trigger: debounce(function() {
                this.$parent.canvas.trigger('programmatic')
            }, 50)
        },
        beforeMount()
        {
            this.repeat = this.isRepeat()

            if (this.shape.type === 'curved-controls') {
                this.$store.commit('canvas/set', { shape: null })
            }
        },
        beforeDestroy()
        {
            this.$store.commit('canvas/set', { shape: null })
        }
    }
</script>

<style lang="scss" scoped>
    .line-color-menu .color-dialog__body,
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
    .draw-settings {
        max-width: 210px;

        .params-pane {
            .radius {
                ::v-deep .v-input .v-input__slot .v-text-field__slot {
                    input::-webkit-outer-spin-button,
                    input::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }

                    input[type=number] {
                        -moz-appearance: textfield;
                    }
                }
            }
            .shape__repeat {
                ::v-deep .v-input {
                    margin: 0;

                    .v-input__control > .v-input__slot {
                        align-items: center;

                        .v-select__slot {
                            .v-label {
                                top: 2px;
                            }
                            .v-select__selections .v-input .v-input__control .v-input__slot .v-label {
                                top: unset;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
