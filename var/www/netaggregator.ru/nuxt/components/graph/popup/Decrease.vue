<template>
    <graph-drag
        hash="decrease"
        class="drag-decrease"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.decrease')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="decrease-pane">
            <div class="sliders">
                <v-flex class="decrease-color pt-2">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.value') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.colors" v-bind="options" width="100%" />
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
        run = throttle.run.bind(throttle)

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
                colors: 8
            },

            options: {
                processStyle: { backgroundColor: '#5181b8' },
                useKeyboard: true,
                clickable: true,
                duration: .5,
                dotSize: 10,
                interval: 1,
                width: 'auto',
                height: 4,
                max: 128,
                min: 1
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
                this.$parent.decreaseColor(options, this.active)
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
    .drag-decrease {
        max-width: 210px;

        .decrease-pane {
            display: flex;
            flex-direction: column;

            ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                cursor: pointer;
            }
        }
    }
</style>
