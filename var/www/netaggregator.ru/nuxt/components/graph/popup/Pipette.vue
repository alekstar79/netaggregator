<template>
    <graph-drag
        hash="pipette"
        class="drag-pipette"
        @close="cancel"
        :title="$t('graph.pipette')"
        :close="true"
        :snap="snap"
    >
        <v-layout class="pipette-pane">
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
        </v-layout>
    </graph-drag>
</template>

<script>
    import { VColorPickerPatched as VColorPicker } from '~/utils/v-color-picker-patch'

    import { lock, pipetteCursor, unlock } from '~/utils/canvas'
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
        data: () => ({
            currentCursor: pipetteCursor(),
            defaultCursor: null,
            canceleled: false,
            temp: null
        }),
        computed: {
            color() {
                return this.temp || this.$store.state.canvas.drawerOptions.fill
            },
            canvas() {
                return this.$parent.canvas || {}
            },
            rgba: {
                set(v) {
                    this.$store.commit('canvas/setDrawerOption', {
                        fill: rgbaStringify(v)
                    })
                },
                get() {
                    return rgbaParse(this.color)
                }
            }
        },
        watch: {
            '$parent.onCanvas'(v) {
                v || (this.temp = null)
            }
        },
        methods: {
            copy()
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(RGBAToHexA(this.rgba)))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            onMouseDown({ absolutePointer: { x, y }, e })
            {
                if (!e.shiftKey) {
                    this.canvas.defaultCursor = this.currentCursor

                    this.testColor(x |= 0, y |= 0).then(c => {
                        this.rgba = c
                    })
                }
            },
            onMouseMove({ absolutePointer: { x, y }, e })
            {
                if (!e.shiftKey) {
                    this.canvas.defaultCursor = this.currentCursor

                    this.testColor(x |= 0, y |= 0).then(c => {
                        this.temp = rgbaStringify(c)
                    })
                }
            },
            onMouseUp(/* event */)
            {
                this.canvas.defaultCursor = this.currentCursor
            },
            testColor(x, y)
            {
                x *= this.canvas.viewportTransform[0]
                y *= this.canvas.viewportTransform[3]

                return new Promise(resolve => {
                    const img = this.canvas.contextContainer.getImageData(x, y, 1, 1)

                    resolve({
                        r: img.data[0],
                        g: img.data[1],
                        b: img.data[2],
                        a: img.data[3]
                    })
                })
            },
            cancel()
            {
                if (!this.canceleled) {
                    this.canceleled = true

                    this.canvas.defaultCursor = this.defaultCursor
                    this.canvas.selection = true

                    unlock(this.canvas)

                    this.$emit('tool:cancel', true)

                    this.canvas.off({
                        'mouse:down': this.onMouseDown,
                        'mouse:move': this.onMouseMove,
                        'mouse:up': this.onMouseUp
                    })
                }
            }
        },
        beforeDestroy()
        {
            this.cancel()
        },
        mounted()
        {
            this.defaultCursor = this.canvas.defaultCursor
            this.canvas.defaultCursor = this.currentCursor
            this.canvas.selection = false

            this.canvas.on({
                'mouse:down': this.onMouseDown,
                'mouse:move': this.onMouseMove,
                'mouse:up': this.onMouseUp
            })

            lock(this.canvas)
        }
    }
</script>

<style lang="scss" scoped>
    .drag-pipette {
        max-width: 210px;

        .pipette-pane {
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
