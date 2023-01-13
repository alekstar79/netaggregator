<template>
    <graph-drag
        hash="grid-dialog"
        class="drag-rulers"
        @close="close"
        :title="$t('graph.snap_grid')"
        :close="true"
        :snap="snap"
    >
        <div class="grid-dialog">
            <v-text-field
                v-model="x"
                class="pt-2"
                :rules="[xV]"
                :hide-details="!xE"
                :color="color"
                type="number"
                label="X"
                outlined
                dense
            />
            <v-text-field
                v-model="y"
                class="pt-3"
                :rules="[yV]"
                :hide-details="!yE"
                :color="color"
                type="number"
                label="Y"
                outlined
                dense
            />

            <div class="grid-dialog__controlls">
                <v-btn class="shadowless" @click="toggle" :color="color" small block>
                    {{ showGrid ? $t('graph.hide') : $t('graph.show') }}
                </v-btn>
            </div>
        </div>
    </graph-drag>
</template>

<script>
    import { debounce } from '~/utils/common/debounce.mjs'
    import { rclamp } from '~/utils/common/clamp.mjs'

    const validator = n => n <= 0 || n > 100 ? 'Value can range from 0 to 100' : true

    export default {
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        data: () => ({
            showGrid: false,

            xError: false,
            yError: false
        }),
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            x: {
                get() {
                    return rclamp(Number(this.$store.state.canvas.xGrid), 0, 100)
                },
                set(x) {
                    x = rclamp(Number(x), 0, 100)
                    this.$store.commit('canvas/set', { xGrid: x })
                    this.createGrid({ x })
                }
            },
            y: {
                get() {
                    return rclamp(Number(this.$store.state.canvas.yGrid), 0, 100)
                },
                set(y) {
                    y = rclamp(Number(y), 0, 100)
                    this.$store.commit('canvas/set', { yGrid: y })
                    this.createGrid({ y })
                }
            },
            xE() {
                return this.xNotNumber || this.xOutOfRange || this.xError
            },
            yE() {
                return this.yNotNumber || this.yOutOfRange || this.yError
            },
            xOutOfRange() {
                return this.x <= 0 || this.x > 100
            },
            yOutOfRange() {
                return this.y <= 0 || this.y > 100
            },
            xNotNumber() {
                return typeof this.x !== 'number'
            },
            yNotNumber() {
                return typeof this.y !== 'number'
            }
        },
        methods: {
            snack(content)
            {
                this.$bus.$emit('snack', { content, color: 'error' })
            },
            xV(n)
            {
                const v = validator(n)

                this.xError = typeof v === 'string'

                return v
            },
            yV(n)
            {
                const v = validator(n)

                this.yError = typeof v === 'string'

                return v
            },
            onToggle()
            {
                this.showGrid = this.$parent.canvas.showGrid
            },
            toggle()
            {
                this.$parent.canvas.toggleGrid()
            },
            handlerReload()
            {
                this.$parent.canvas.off('grid:toggle', this.onToggle)
                this.$parent.canvas.on('grid:toggle', this.onToggle)

                this.showGrid = false
            },
            close()
            {
                this.$emit('tool:cancel')
            }
        },
        beforeDestroy()
        {
            this.$parent.canvas.off('grid:toggle', this.onToggle)
            this.$bus.$off('canvas:reload', this.handlerReload)
        },
        mounted()
        {
            const canvas = this.$parent.canvas

            this.createGrid = debounce(canvas.createGrid.bind(canvas), 1e2)
            this.showGrid = canvas.showGrid

            this.$bus.$on('canvas:reload', this.handlerReload)

            canvas.on('grid:toggle', this.onToggle)
        }
    }
</script>

<style lang="scss" scoped>
    .drag-rulers {
        max-width: 210px;

        .grid-dialog {
            display: flex;
            flex-direction: column;
            /* ::v-deep .v-input .v-input__slot .v-text-field__slot {
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                input[type=number] {
                    -moz-appearance: textfield;
                }
            } */

            .grid-dialog__controlls .shadowless {
                margin: 10px 0 5px;
            }
        }
    }
</style>
