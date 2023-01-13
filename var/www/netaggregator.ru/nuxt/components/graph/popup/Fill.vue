<template>
    <graph-drag
        hash="fill"
        class="drag-fill"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.fill')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="fill-pane">
            <v-flex class="color-dialog__body">
                <v-color-picker
                    v-model="rgba"
                    canvas-height="130px"
                    width="200px"
                    dot-size="10"
                    mode="hexa"
                    hide-mode-switch
                    flat
                />
                <v-btn class="color-copy" @click.stop="copy" text>
                    <span class="mdi mdi-content-copy" />
                </v-btn>
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
            snap: {
                type: Number,
                default: 5
            }
        },
        computed: {
            rgba: {
                set(v) {
                    this.$store.commit('canvas/setDrawerOption', {
                        fill: rgbaStringify(v),
                        alpha: v.a
                    })
                },
                get() {
                    return rgbaParse(this.color)
                }
            },
            color() {
                return this.$store.state.canvas.drawerOptions.fill
            },
            canvas() {
                return this.$parent.canvas
            }
        },
        data: () => ({
            canceleled: false
        }),
        methods: {
            copy()
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(RGBAToHexA(this.rgba)))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            make(doit, emit = true)
            {
                if (this.canceled) return

                this.canceled = true

                this.$parent.fillModeToggle(null, doit)

                emit && this.$emit('tool:cancel')
            }
        },
        beforeDestroy()
        {
            this.make(false, false)
        },
        mounted()
        {
            this.$parent.fillModeToggle(this.canvas.getActiveObject())
        }
    }
</script>

<style lang="scss" scoped>
    .drag-fill {
        max-width: 210px;

        .fill-pane {
            display: flex;
            flex-direction: column;

            .color-dialog__body {
                ::v-deep .v-color-picker {
                    background-color: transparent;

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
                    bottom: 11px;
                    right: 9px;

                    height: 29px;
                    min-width: unset;
                    padding: 0 5px;
                }
            }
            .v-btn {
                margin: 0;
            }
        }
    }
</style>
