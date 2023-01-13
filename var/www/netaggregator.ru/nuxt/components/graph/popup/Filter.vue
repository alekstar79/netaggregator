<template>
    <graph-drag hash="filter"
        class="drag-filter"
        @close="$emit('tool:cancel')"
        :title="$t('graph.filter')"
        :close="true"
        :snap="snap"
    >
        <div class="filters-control">
            <v-select v-model="current"
                :menu-props="{ closeOnContentClick: true }"
                :item-color="color"
                :color="color"
                :items="filters"
                persistent-hint
                return-object
                hide-details
                outlined
                dense
            />

            <div class="dialog_content pt-2">
                <div id="canvas_preview">
                    <canvas ref="preview" />
                    <component :is="input" @update="update" class="filter-params" />
                </div>
            </div>

            <div class="filter-btn-apply">
                <v-btn class="shadowless" @click="apply" :color="color" small block>
                    {{ $t('common.apply') }}
                </v-btn>
            </div>
        </div>
    </graph-drag>
</template>

<script>
    import filters from '~/assets/data/canvas-filters'
    import { Fabric } from '~/utils/canvas'

    import kebabCase from 'lodash/kebabCase'

    let equal = ($1, $2) => $1.custom.unique === $2.custom.unique,
        call = set => set.reduce((p, fn) => p.then(() => { fn() }), Promise.resolve()),
        resolver = set => r => r ? call(set) : Promise.resolve(),

        height = 160,
        width = 200,

        canvas,
        ctx

    function createCanvas()
    {
        canvas || (() => {
            canvas = document.createElement('canvas')
            ctx = canvas.getContext('2d')
            canvas.height = height
            canvas.width = width
        })()

        ctx.clearRect(0, 0, width, height)

        return canvas
    }

    export default {
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        data: () => ({
            variable: {
                field: null,
                value: null
            },

            current: null,
            preview: null,
            active: null,
            object: null,

            filters
        }),
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            input() {
                return this.current && this.current.variable
                    ? `graph-sliders-${kebabCase(this.current.value)}`
                    : null
            }
        },
        watch: {
            current: 'set'
        },
        methods: {
            perform()
            {
                const active = this.$parent.canvas.getActiveObject() || this.active

                if (!active) return Promise.reject()

                if (!this.active || !equal(active, this.active)) {
                    return this.draw(active, this.active)
                }

                return Promise.resolve()
            },
            draw(active, reset = false)
            {
                return Fabric.resolve().then(fabric => {
                    this.active = active

                    this.preview || (() => {
                        this.preview = new fabric.StaticCanvas(this.$refs.preview)
                        this.preview.setDimensions({ height, width })
                    })()

                    return new Promise(resolve => {
                        active.clone(clone => {
                            clone.set('angle', 0)

                            import(/* webpackChunkName: "pica" */ 'pica')
                                .then(pica => pica.default)
                                .then(pica => pica()
                                    .resize(
                                        clone.toCanvasElement(),
                                        createCanvas(),
                                        {
                                            unsharpThreshold: 2,
                                            unsharpAmount: 80,
                                            unsharpRadius: .6
                                        }
                                    )
                                    .then(canvas => fabric.Image.fromURL(
                                        canvas.toDataURL('image/png', 1.0),
                                        img => {
                                            this.setImage(img)
                                            resolve(reset)
                                        }
                                    ))
                                )
                        })
                    })
                })
            },
            setImage(img)
            {
                this.preview._objects = []
                this.preview.add(img)
                this.object = img
            },
            render()
            {
                this.object.applyFilters()
                this.preview.renderAll()
            },
            modify(field, value)
            {
                field || (field = this.variable.field)
                value || (value = this.variable.value)

                if (field && value) {
                    this.object.filters[0][field] = value

                    this.variable.field = field
                    this.variable.value = value
                }
            },
            inset()
            {
                return Fabric.resolve().then(fabric => {
                    this.object.filters = [fabric.Image.filters.BaseFilter.fromObject({
                        type: this.current.value
                    })]
                })
            },
            set()
            {
                this.perform().then(this.inset).then(this.render)
                    .catch(() => this.$bus.$emit('snack', {
                        content: 'graph.select_image',
                        color: 'warning'
                    }))
            },
            update({ field, value })
            {
                this.perform().then(reset => {
                    reset && this.inset()
                    this.modify(field, value)
                    this.render()
                })
                    .catch(() => {})
            },
            apply()
            {
                !this.$parent.canvas.getActiveObject()
                    ? this.$bus.$emit('snack', { content: 'graph.select_image', color: 'warning' })
                    : this.perform().then(resolver([this.inset, this.modify, this.render]))
                        .then(() => this.$emit('tool:apply', {
                            payload: this.object.filters[0],
                            tool: 'filter'
                        }))
                        .catch(() => {})
            }
        },
        mounted()
        {
            this.current = filters[0]
        }
    }
</script>

<style lang="scss" scoped>
    .drag-filter {
        max-width: 210px;

        .filters-control {
            .filter-btn-apply {
                display: flex;
                justify-content: center;

                .shadowless {
                    margin: 10px 0 5px;
                }
            }

            #canvas_preview {
                position: relative;
                height: 160px;

                canvas {
                    border: 1px solid #393939
                }

                .filter-params {
                    position: absolute;
                    bottom: 0;

                    width: 200px;

                    ::v-deep .v-slider {
                        cursor: pointer;
                    }
                }
            }
        }
    }
</style>
