<template>
    <graph-drag
        hash="text-dialog"
        class="text-settings"
        @close="$emit('tool:cancel')"
        :title="$t('graph.text')"
        :close="true"
        :snap="snap"
    >
        <div v-if="text" class="text-popup">
            <v-flex class="text__fonts-select">
                <v-select
                    v-model="current"
                    :color="color"
                    :label="$t('graph.font')"
                    :items="list"
                    class="pt-1"
                    item-text="family"
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
            </v-flex>

            <v-flex class="text__color-picker">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.color') }}
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
                                    :color="text.fill"
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

            <v-flex class="text__size-slider">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.size') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="text.fontSize" v-bind="size" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="text__spacing-slider">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.char_spacing') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="text.charSpacing" v-bind="space" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="text__height-slider">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.line_height') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="text.lineHeight" v-bind="height" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="text__align-toolbar">
                <helper-fieldset class="text-align pt-3" dense>
                    <template #label>{{ $t('graph.align') }}</template>

                    <template #content>
                        <v-layout class="btn-toolbar" justify-space-between>
                            <template v-for="d in align">
                                <v-btn class="toolbar-item"
                                    @click="text.textAlign = d"
                                    :disabled="text.textAlign === d"
                                    :ripple="false"
                                    :key="d"
                                    tile
                                    icon
                                >
                                    <v-icon :color="color" class="align-icon">
                                        {{ `mdi-format-align-${d}` }}
                                    </v-icon>
                                </v-btn>
                            </template>
                        </v-layout>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="stroke__color-picker">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.stroke_color') }}
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
                                    :color="text.stroke"
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

            <v-flex class="stroke__width-slider">
                <helper-fieldset class="pt-3" dense>
                    <template #label>
                        {{ $t('graph.stroke_width') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="text.strokeWidth" v-bind="width" width="100%" />
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
    import { fonts as list } from '~/assets/data/fonts.mjs'

    const options = {
        processStyle: { backgroundColor: '#5181b8' },
        useKeyboard: true,
        clickable: true,
        duration: .5,
        dotSize: 10,
        width: 'auto',
        interval: 1,
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
            color() {
                return this.$vuetify.theme.dark ? 'white' : this.$store.state.app.color
            },
            fillRgba: {
                set(v) {
                    this.text.textFill = rgbaStringify(v)
                },
                get() {
                    return rgbaParse(this.text.fill)
                }
            },
            strokeRgba: {
                set(v) {
                    this.text.strokeColor = rgbaStringify(v)
                },
                get() {
                    return rgbaParse(this.text.stroke)
                }
            },
            text() {
                const fn = o => o.custom.unique === this.unique

                return this.$parent.canvas._objects.find(fn)
            },
            unique() {
                return this.$store.state.canvas.text
            }
        },
        watch: {
            current: 'apply',

            text(v) {
                v || (setTimeout(() => {
                    this.$emit('tool:cancel')
                }, 1e2))
            }
        },
        data: () => ({
            align: ['left', 'center', 'right', 'justify'],
            current: null,
            list,

            space: {
                ...options,
                interval: 1,
                max: 100,
                min: -100
            },
            height: {
                ...options,
                interval: .1,
                max: 2,
                min: .1
            },
            width: {
                ...options,
                max: 20,
                min: 0
            },
            size: {
                ...options,
                max: 92,
                min: 12
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
            apply(current)
            {
                this.text.fontFamily = current.family
            }
        },
        beforeDestroy()
        {
            this.$store.commit('canvas/set', { text: null })
        },
        beforeMount()
        {
            this.current = list.find(f => f.family === this.text.fontFamily)
        }
    }
</script>

<style lang="scss" scoped>
    @import 'assets/css/classes.css';

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
    .text-settings {
        max-width: 210px;

        .text-popup {
            .btn-toolbar .toolbar-item {
                max-height: 22px;
                width: 40px;

                border-radius: 0;

                &:hover::before {
                    background-color: currentColor;
                    opacity: .2;
                }
                &.theme--dark[disabled] .drawer-icon {
                    color: #fff !important
                }
            }
            .text__align-toolbar {
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
    .ellipsisfont {
        display: block;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 210px;
    }
</style>
