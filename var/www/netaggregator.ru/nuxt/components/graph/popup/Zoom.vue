<template>
    <graph-drag
        hash="zoom"
        class="drag-zoom"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.c_zoom')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="zoom-pane">
            <div class="sliders">
                <v-flex class="color-multiplier pt-2">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.multiplier') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.zoom" v-bind="multiplier" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>
                <v-flex class="color-threshold pt-3">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.balance') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.center" v-bind="threshold" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>
            </div>
        </div>
    </graph-drag>
</template>

<script>
    import { Throttle } from '~/utils/throttle'

    const throttle = Throttle.create(),

        set = throttle.set.bind(throttle),
        run = throttle.run.bind(throttle),

        options = {
            dotSize: 10,
            duration: .5,
            width: 'auto',
            height: 4,
            useKeyboard: true,
            clickable: true,
            processStyle: {
                backgroundColor: '#5181b8'
            }
        }

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
            active: null,
            current: {
                center: 128,
                zoom: 0
            },

            multiplier: {
                ...options,
                interval: 1,
                max: 20,
                min: 0
            },
            threshold: {
                ...options,
                interval: 1,
                max: 255,
                min: 0
            }
        }),
        watch: {
            current: {
                handler: run,
                deep: true
            }
        },
        methods: {
            onChange(options)
            {
                this.$parent.colorZoom(options, this.active)
            },
            make(doit, emit = true)
            {
                if (this.canceled) return

                this.canceled = true

                doit || this.$parent.restoreCanvas()
                emit && this.$emit('tool:cancel')

                this.$parent.lockEventsSet = false
                this.$parent.restoreEvents([])
                doit && this.canvas.trigger('programmatic')
            }
        },
        beforeDestroy()
        {
            this.make(false, false)
        },
        mounted()
        {
            this.active = this.$parent.getActives()

            this.onChange(this.current)

            set(this.onChange)

            this.$parent.leaveEvents([])
            this.$parent.lockEventsSet = true
        }
    }
</script>

<style lang="scss" scoped>
    .drag-zoom {
        max-width: 210px;

        .zoom-pane {
            display: flex;
            flex-direction: column;

            ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                cursor: pointer;
            }
        }
    }
</style>
