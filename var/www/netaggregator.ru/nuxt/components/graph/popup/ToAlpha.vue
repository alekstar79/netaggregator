<template>
    <graph-drag
        hash="to-alpha"
        class="drag-alpha"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.toalpha')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="alpha-pane">
            <v-flex class="color-dialog__body">
                <v-color-picker
                    v-model="hex"
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
    import { lock, rgbToHex, unlock } from '~/utils/canvas'

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
            hex: {
                get() {
                    return this.temp || this.current.color
                },
                set(color) {
                    this.current.color = color
                }
            },
            canvas() {
                return this.$parent.canvas || {}
            }
        },
        data: () => ({
            currentCursor: 'crosshair',
            defaultCursor: null,
            canceled: false,
            show: false,
            active: null,
            temp: null,

            current: {
                color: '#ffffff'
            }
        }),
        watch: {
            '$parent.onCanvas'(v) {
                v || (this.temp = null)
            },
            current: {
                deep: true,
                handler(options) {
                    this.$parent
                        .colorToAlpha(options, this.active)
                        .then(() => {
                            lock(this.canvas)
                        })
                }
            }
        },
        methods: {
            copy()
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(this.hex))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            onMouseDown({ pointer, e })
            {
                if (e.shiftKey) return

                this.canvas.defaultCursor = this.currentCursor
                this.testColor(pointer).then(c => {
                    this.temp = c
                    this.hex = c
                })
            },
            onMouseMove({ pointer, e })
            {
                if (e.shiftKey) return

                this.canvas.defaultCursor = this.currentCursor
                this.testColor(pointer).then(c => {
                    this.temp = c
                })
            },
            onMouseUp()
            {
                this.canvas.defaultCursor = this.currentCursor
            },
            testColor({ x, y })
            {
                x |= 0
                y |= 0

                return new Promise(resolve => {
                    const img = this.canvas.contextContainer.getImageData(x, y, 1, 1)
                    resolve(rgbToHex(img.data[0], img.data[1], img.data[2]))
                })
            },
            make(doit, emit = true)
            {
                if (this.canceled) return

                this.canceled = true

                this.canvas.defaultCursor = this.defaultCursor
                this.canvas.selection = true

                doit || this.$parent.restoreCanvas()
                emit && this.$emit('tool:cancel')

                this.$parent.lockEventsSet = false
                this.$parent.restoreEvents([])
                doit && this.canvas.trigger('programmatic')

                this.canvas.off({
                    'mouse:down': this.onMouseDown,
                    'mouse:move': this.onMouseMove,
                    'mouse:up': this.onMouseUp
                })

                unlock(this.canvas)
            }
        },
        beforeDestroy()
        {
            this.make(false, false)
        },
        mounted()
        {
            this.active = this.$parent.getActives()
            this.defaultCursor = this.canvas.defaultCursor
            this.canvas.defaultCursor = this.currentCursor
            this.canvas.selection = false

            this.$parent.leaveEvents([])
            this.$parent.lockEventsSet = true

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
    .drag-alpha {
        max-width: 210px;

        .alpha-pane {
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
            ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                cursor: pointer;
            }
        }
    }
</style>
