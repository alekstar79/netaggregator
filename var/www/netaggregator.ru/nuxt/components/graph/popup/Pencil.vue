<template>
    <graph-drag
        hash="brush-tool"
        class="drag-brush"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.draw')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="brush-pane">
            <v-select
                v-model="current"
                :label="$t('graph.mode')"
                :color="color"
                :items="list"
                class="pt-2"
                return-object
                hide-details
                outlined
                dense
            >
                <template #item="{ item, on }">
                    <v-list-item v-on="on" :class="item.value">
                        {{ item.text }}
                    </v-list-item>
                </template>
            </v-select>

            <div class="params-pane">
                <graph-line-thickness class="pt-3" dense />
                <graph-fill-color label="graph.color" class="pt-3" />
            </div>
        </div>
    </graph-drag>
</template>

<script>
    import { Brush } from '~/utils/canvas'

    // https://codepen.io/alekstar79/pen/ExyELXL

    export default {
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            canvas() {
                return this.$parent.canvas || {}
            },
            current: {
                set(pencilTool) {
                    this.$store.commit('canvas/set', { pencilTool })
                },
                get() {
                    return this.$store.state.canvas.pencilTool
                }
            }
        },
        data: () => ({
            currentCursor: 'crosshair',
            defaultCursor: null,
            canceled: false,

            list: [
                { value: Brush.PENCIL,  text: 'Pencil'  },
                { value: Brush.CIRCLE,  text: 'Circle'  },
                { value: Brush.SPRAY,   text: 'Spray'   },
                { value: Brush.PATTERN, text: 'Pattern' }
            ]
        }),
        watch: {
            current: 'setBrush'
        },
        methods: {
            apply(payload)
            {
                this.$emit('tool:apply', { tool: 'pencil', payload })
            },
            setBrush({ value: mode })
            {
                this.apply({ on: true, mode })
            },
            make(apply)
            {
                if (this.canceled) return

                this.canceled = true

                this.canvas.defaultCursor = this.defaultCursor
                this.canvas.selection = true

                this.apply({ on: false, apply })
                this.$emit('tool:cancel', true)
            }
        },
        beforeDestroy()
        {
            this.make(false)
        },
        mounted()
        {
            this.defaultCursor = this.canvas.defaultCursor
            this.canvas.defaultCursor = this.currentCursor
            this.canvas.selection = false

            this.setBrush(this.current)
        }
    }
</script>

<style scoped>
    .drag-brush {
        max-width: 210px;
    }
</style>
