<template>
    <graph-drag
        hash="opacity"
        class="drag-opacity"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.opacity')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="opacity-pane">
            <div class="sliders">
                <v-flex class="alpha-chanel pt-2">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.opacity') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current" v-bind="options" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>
            </div>
        </div>
    </graph-drag>
</template>

<script>
    export default {
        components: {
            VueSlider: () => import(/* webpackChunkName: "slider" */ 'vue-slider-component')
        },
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        computed: {
            canvas() {
                return this.$parent.canvas
            }
        },
        data: () => ({
            canceled: false,
            current: 1,
            active: null,
            store: null,

            options: {
                processStyle: { backgroundColor: '#5181b8' },
                useKeyboard: true,
                clickable: true,
                dotSize: 10,
                interval: .1,
                duration: .5,
                width: 'auto',
                height: 4,
                max: 1,
                min: 0
            }
        }),
        watch: {
            current: 'onChange'
        },
        methods: {
            onChange(v)
            {
                if (this.active.length) {
                    this.active.forEach(a => { a.set('opacity', v) })
                    this.canvas.requestRenderAll()
                }
            },
            restore()
            {
                this.store.forEach((v, id) => { this.active[id].set('opacity', v) })
                this.canvas.requestRenderAll()
            },
            make(doit, emit = true)
            {
                if (!this.canceled) {
                    this.canceled = true

                    doit || this.restore()
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
            this.active = this.canvas.getActiveObjects()
            this.store = []

            this.active.forEach((a, id) => {
                this.store[id] = a.opacity
            })

            this.current = this.active.length === 1
                ? this.active[0].opacity
                : 1
        }
    }
</script>

<style lang="scss" scoped>
    .drag-opacity {
        max-width: 210px;

        .opacity-pane {
            display: flex;
            flex-direction: column;

            ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                cursor: pointer;
            }
        }
    }
</style>
