<template>
    <graph-drag
        hash="magic"
        class="drag-magic"
        @close="make(false)"
        :title="$t('graph.magic')"
        :close="true"
        :snap="snap"
    >
        <div class="magic-pane">
            <graph-threshold class="pt-2" dense />

            <v-flex class="fill-color pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t(label) }}
                    </template>

                    <template #content>
                        <v-menu
                            v-model="show"
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="210px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    :color="hex"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    {{ rgba.a >= .01 ? '&nbsp;' : 'transparent' }}
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    v-model="rgba"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copyColor" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="magic__actions-btn">
                <helper-fieldset class="actions-btn pt-3" dense>
                    <template #label>{{ $t('graph.magic_actions') }}</template>

                    <template #content>
                        <v-layout class="btn-toolbar" justify-space-between>
                            <template v-for="a in actions">
                                <v-btn class="toolbar-item"
                                    :ripple="false"
                                    :key="a.title"
                                    @click="a.cb"
                                    tile
                                    icon
                                >
                                    <v-icon :color="color">
                                        mdi {{ a.icon }}
                                    </v-icon>
                                </v-btn>
                            </template>
                        </v-layout>
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
            VColorPicker
        },
        props: {
            label: {
                type: String,
                default: 'graph.fill_color'
            },
            snap: {
                type: Number,
                default: 5
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'white' : this.$store.state.app.color
            },
            hex() {
                return this.$store.state.canvas.drawerOptions.fill
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            canvas() {
                return this.$parent.canvas
            },
            rgba: {
                set(v) {
                    this.$store.commit('canvas/setDrawerOption', {
                        fill: rgbaStringify(v),
                        alpha: v.a
                    })
                },
                get() {
                    return rgbaParse(this.hex)
                }
            }
        },
        data() {
            return {
                canceled: false,
                show: false,

                actions: [
                    { cb: this.fill.bind(this), title: 'Fill', icon: 'mdi-fill-color'   },
                    { cb: this.mask.bind(this), title: 'Mask', icon: 'mdi-content-cut'  },
                    { cb: this.copy.bind(this), title: 'Copy', icon: 'mdi-content-copy' }
                ]
            }
        },
        methods: {
            copyColor()
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(RGBAToHexA(this.rgba)))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            fill()
            {
                this.$parent.magic.fill = true
                this.$parent.magic.paint(this.rgba)
                this.make(true)
            },
            mask()
            {
                this.$parent.magic.mask = true
                this.$parent.magic.paint()
                this.make(true)
            },
            copy()
            {
                this.$parent.magic.copy = true
                this.$parent.magic.paint()
                this.make(true)
            },
            make(doit, emit = true)
            {
                if (!this.canceled) {
                    this.canceled = true

                    this.$parent.magicModeToggle(null, doit)
                    emit && this.$emit('tool:cancel')
                }
            }
        },
        beforeDestroy()
        {
            this.make(false, false)
        },
        mounted()
        {
            this.$parent.magicModeToggle(this.canvas.getActiveObject())
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
    .drag-magic {
        max-width: 210px;

        .magic-pane {
            display: flex;
            flex-direction: column;

            .btn-toolbar .toolbar-item {
                max-height: 32px;
                margin: 2px;

                border-radius: 0;

                &:hover::before {
                    background-color: currentColor;
                    opacity: .2;
                }
            }
        }
    }
</style>
