<template>
    <graph-drag
        hash="drawshape"
        class="drag-draw"
        @close="cancel()"
        :title="$t('graph.draw')"
        :close="true"
        :snap="snap"
    >
        <v-flex class="draw__shapes-toolbar pt-2">
            <helper-fieldset dense>
                <template #label>
                    {{ $t('graph.shape') }}
                </template>

                <template #content>
                    <v-layout class="btn-toolbar" justify-space-between>
                        <template v-for="d in list">
                            <v-btn
                                @click="apply(d)"
                                class="toolbar-item"
                                :disabled="d.type !== 'image' && d.type === drawer.type"
                                :ripple="false"
                                :key="d.type"
                                tile
                                icon
                            >
                                <v-icon :color="color" class="drawer-icon">
                                    {{ resolve(d) }}
                                </v-icon>
                            </v-btn>
                        </template>
                    </v-layout>
                </template>
            </helper-fieldset>
        </v-flex>

        <div class="params-pane">
            <div class="geometry">
                <graph-line-type class="pt-2" />
                <graph-line-thickness class="pt-3" dense />
            </div>
            <div class="color">
                <graph-line-color class="pt-3" />
                <graph-fill-color class="pt-3" />
            </div>
        </div>
    </graph-drag>
</template>

<script>
    import { lock, unlock } from '~/utils/canvas'

    const filter = d => ['ellipse','line','rect','triangle'].includes(d.type),
        drawer = () => ({ apply: () => Promise.reject() })

    export default {
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'grey' : this.$store.state.app.color
            },
            drawers() {
                return this.$parent.drawers || []
            },
            drawer() {
                return this.$parent.drawer || drawer()
            },
            list() {
                return this.drawers.filter(filter)
            },
            canvas() {
                return this.$parent.canvas || {}
            }
        },
        data: () => ({
            defaultCursor: null,
            canceleled: false
        }),
        methods: {
            setCursor(c)
            {
                const cursor = c || this.defaultCursor

                this.canvas.freeDrawingCursor = cursor
                this.canvas.defaultCursor = cursor

                this.$parent.fixedCursor = c
            },
            resolve({ type })
            {
                switch (type) {
                    case 'image': return 'mdi-image-outline'
                    // case 'polyline': return 'mdi-pencil'
                    case 'rect': return 'mdi-rectangle'

                    default:
                        return `mdi-${type}`
                }
            },
            apply(drawer)
            {
                drawer || (drawer = this.list[0])

                drawer.apply().then(({ src, width, height }) => {
                    if (drawer.type === 'image') {
                        this.$emit('tool:apply', {
                            payload: { src, width, height },
                            tool: 'draw'
                        })
                    }

                    this.$emit('change', drawer.drawingMode)

                }).catch(() => {
                })
            },
            onMouseUp(/* event */)
            {
                lock(this.canvas)
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
            }
        },
        beforeDestroy()
        {
            this.cancel(false)
        },
        mounted()
        {
            this.defaultCursor = this.canvas.defaultCursor
            this.setCursor('crosshair')
            this.$parent.setMode(true)

            lock(this.canvas)

            this.canvas.on({ 'mouse:up': this.onMouseUp })

            this.apply()
        }
    }
</script>

<style lang="scss" scoped>
    .drag-draw {
        max-width: 210px;

        .draw__shapes-toolbar {
            cursor: pointer;

            ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                min-height: 35px;
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
        .btn-toolbar .toolbar-item {
            max-height: 22px;
            width: 40px;

            border-radius: 0;
            color: rgba(0,0,0,.3);

            transition: background-color .2s ease-in;

            &:hover::before {
                background-color: currentColor;
                opacity: .2;
            }
            &.theme--dark[disabled] .drawer-icon {
                color: #fff !important
            }
        }
    }
</style>
