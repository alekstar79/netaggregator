<template>
    <graph-drag
        hash="correction"
        class="drag-correction"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.correction')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="correction-pane">
            <div class="sliders">
                <v-flex class="brightness-chanel pt-2">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.brightness') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.brightness" v-bind="brightness" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>
                <v-flex class="contrast-chanel pt-3">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.contrast') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.contrast" v-bind="contrast" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>

                <v-flex class="red-chanel pt-3">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.red') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.r" v-bind="rgb" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>
                <v-flex class="green-chanel pt-3">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.green') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.g" v-bind="rgb" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>
                <v-flex class="blue-chanel pt-3">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.blue') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.b" v-bind="rgb" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>

                <v-flex class="hue-chanel pt-3">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.hue') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.h" v-bind="hue" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>
                <v-flex class="sat-chanel pt-3">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.sat') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.s" v-bind="sat" width="100%" />
                        </template>
                    </helper-fieldset>
                </v-flex>
                <v-flex class="lum-chanel pt-3">
                    <helper-fieldset dense>
                        <template #label>
                            {{ $t('graph.lum') }}
                        </template>

                        <template #content>
                            <vue-slider v-model="current.l" v-bind="sat" width="100%" />
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
                brightness: 0,
                contrast: 0,
                r: 0,
                g: 0,
                b: 0,
                h: 0,
                s: 0,
                l: 0
            },

            brightness: {
                ...options,
                interval: 1,
                min: -100,
                max: 100
            },
            contrast: {
                ...options,
                interval: 1,
                min: -100,
                max: 100
            },
            rgb: {
                ...options,
                interval: 1,
                min: -255,
                max: 255
            },
            hue: {
                ...options,
                interval: 1,
                min: -180,
                max: 180
            },
            sat: {
                ...options,
                interval: 1,
                min: -100,
                max: 100
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
                this.$parent.colorCorrection(options, this.active)
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

            set(this.onChange)

            this.$parent.leaveEvents([])
            this.$parent.lockEventsSet = true
        }
    }
</script>

<style lang="scss" scoped>
    .drag-correction {
        max-width: 210px;

        .correction-pane {
            display: flex;
            flex-direction: column;

            ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                cursor: pointer;
            }
        }
    }
</style>
