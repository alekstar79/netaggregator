<template>
    <graph-drag
        hash="ctext-dialog"
        class="ctext-settings"
        @close="$emit('tool:cancel')"
        :title="$t('graph.curved')"
        :close="true"
        :snap="snap"
    >
        <div v-if="ctext" class="ctext-popup">
            <v-flex class="ctext__text--textarea pt-1">
                <v-textarea v-model="text" :label="$t('graph.text')" :color="color" rows="1" dense outlined hide-details />
            </v-flex>

            <v-flex class="ctext__fonts-select pt-2">
                <v-select
                    v-model="current"
                    :color="color"
                    :label="$t('graph.font')"
                    :items="list"
                    item-text="family"
                    return-object
                    hide-details
                    outlined
                    dense
                    :menu-props="{
                        contentClass: 'ctext-fonts-menu',
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

            <v-flex class="ctext__color-picker pt-3">
                <helper-fieldset dense>
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
                                    :color="ctext.fillStyle"
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
                                <v-btn class="color-copy" @click.stop="copy" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="ctext__size-slider pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.size') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="fontSize" v-bind="size" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="ctext__spacing-slider pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.char_spacing') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="charSpacing" v-bind="space" width="100%" />
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
                    this.ctext.set({ fillStyle: rgbaStringify(v) })
                },
                get() {
                    return rgbaParse(this.ctext.fillStyle)
                }
            },
            charSpacing: {
                set(charSpacing) {
                    this.ctext.set({ charSpacing })
                },
                get() {
                    return this.ctext.charSpacing
                }
            },
            fontSize: {
                set(fontSize) {
                    this.ctext.set({ fontSize })
                },
                get() {
                    return this.ctext.fontSize
                }
            },
            text: {
                set(text) {
                    this.ctext.set({ text })
                },
                get() {
                    return this.ctext.text
                }
            },
            ctext() {
                return this.$parent.canvas._objects.find(o => o.custom.unique === this.unique)
            },
            unique() {
                return this.$store.state.canvas.ctext
            }
        },
        watch: {
            current: 'apply',

            ctext(v) {
                v || (setTimeout(() => {
                    this.$emit('tool:cancel')
                }, 1e2))
            }
        },
        data: () => ({
            current: null,
            list,

            height: {
                ...options,
                interval: .1,
                max: 2,
                min: .1
            },
            space: {
                ...options,
                interval: 1,
                max: 20,
                min: -5
            },
            size: {
                ...options,
                max: 92,
                min: 12
            }
        }),
        methods: {
            copy()
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(RGBAToHexA(this.fillRgba)))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            apply({ family })
            {
                this.ctext.fontFamily = family
            }
        },
        beforeDestroy()
        {
            this.$store.commit('canvas/set', { ctext: null })
        },
        beforeMount()
        {
            this.current = list.find(f => f.family === this.ctext.fontFamily)
        }
    }
</script>

<!--suppress CssUnknownProperty -->
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
    .ctext-settings {
        max-width: 210px;

        .ctext__text--textarea {
            ::v-deep .v-textarea > .v-input__control > .v-input__slot {
                textarea {
                    overflow: hidden !important;
                    -ms-overflow-style: none;
                    scrollbar-width: none;

                    &::-webkit-scrollbar {
                        height: 0;
                        width: 0;
                    }
                }
            }
        }
        .ctext-popup {
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
            /* .text__align-toolbar {
                cursor: pointer;

                ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                    // min-height: unset;
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
            } */
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
