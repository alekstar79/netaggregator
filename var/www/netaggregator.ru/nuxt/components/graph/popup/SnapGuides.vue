<template>
    <graph-drag
        hash="guides-dialog"
        class="drag-rulers"
        @close="close"
        @apply="apply"
        :title="$t(title)"
        :close="true"
        :apply="true"
        :snap="snap"
    >
        <div class="grid-dialog">
            <template v-if="controls.open">
                <v-select
                    v-model="grid"
                    class="pt-2"
                    label="Choose grid"
                    :items="gridList.map(item => item.name).reverse()"
                    :item-color="color"
                    :color="color"
                    hide-details
                    outlined
                    dense
                />

                <div class="grid-dialog__controlls">
                    <v-btn class="shadowless"
                        @click="removeGrid"
                        :color="color"
                        small
                        block
                    >
                        Delete
                    </v-btn>
                </div>
            </template>

            <template v-else-if="controls.save">
                <v-text-field
                    v-model="grid"
                    :color="color"
                    class="pt-2"
                    label="Grid name"
                    hide-details
                    outlined
                    dense
                />
            </template>

            <template v-else-if="controls.snap">
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
            </template>
        </div>
    </graph-drag>
</template>

<script>
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
            xError: false,
            yError: false
        }),
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
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
            },
            title() {
                let title, { open, save, snap } = this.controls

                switch (true) {
                    case snap:
                        title = 'Snap guides'
                        break
                    case save:
                        title = 'Save grid'
                        break
                    case open:
                        title = 'Open grid'
                        break
                }

                return title
            },
            controls() {
                return this.$store.state.canvas.controls
            },
            gridList() {
                return this.$store.state.canvas.gridList
            },
            gridName() {
                return this.$store.state.canvas.gridName
            },
            guidesList: {
                set(guidesList) {
                    this.$store.commit('canvas/set', { guidesList })
                },
                get() {
                    return this.$store.state.canvas.guidesList
                }
            },
            gridToSet: {
                set(gridToSet) {
                    this.$store.commit('canvas/set', { gridToSet })
                },
                get() {
                    return this.$store.state.canvas.gridToSet
                }
            },
            grid: {
                set(name) {
                    this.$store.commit('canvas/chooseGrid', name)
                },
                get() {
                    return this.$store.state.canvas.gridName
                }
            },
            x: {
                set(x) {
                    this.$store.commit('canvas/set', { xSnap: rclamp(Number(x), 0, 100) })
                },
                get() {
                    return rclamp(Number(this.$store.state.canvas.xSnap), 0, 100)
                }
            },
            y: {
                set(y) {
                    this.$store.commit('canvas/set', { ySnap: rclamp(Number(y), 0, 100) })
                },
                get() {
                    return rclamp(Number(this.$store.state.canvas.ySnap), 0, 100)
                }
            }
        },
        methods: {
            apply()
            {
                switch (true) {
                    case this.controls.open: return this.openOK()
                    case this.controls.save: return this.saveOK()
                    case this.controls.snap: return this.snapOK()
                }
            },
            close()
            {
                this.$store.commit('canvas/closeDialog')
            },
            snack(content)
            {
                this.$bus.$emit('snack', { content, color: 'error' })
            },
            save()
            {
                this.$ls.set('image-editor-grids', this.gridList)
            },
            removeGrid()
            {
                this.$store.commit('canvas/removeGrid')
                this.save()
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
            reset()
            {
                this.x = this.y = 1
            },
            openOK()
            {
                if (!this.gridToSet) {
                    return this.snack('Choose grid required')
                }

                this.guidesList = this.gridToSet
                this.close()
            },
            saveOK()
            {
                if (!this.gridName) {
                    return this.snack('Grid name required')
                }

                this.$store.commit('canvas/removeGrid')
                this.$store.commit('canvas/addGridToList')
                this.gridToSet = this.guidesList

                this.save()
                this.close()
            },
            snapOK()
            {
                this.x <= 0 || this.y <= 0 ? this.reset() : this.close()
            }
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
