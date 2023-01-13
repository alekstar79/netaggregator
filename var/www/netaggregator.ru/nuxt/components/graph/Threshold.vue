<template>
    <v-flex class="magic-thresholds" v-bind="$attrs">
        <helper-fieldset :dense="dense">
            <template #label>
                {{ $t('graph.threshold') }}
            </template>

            <template #content>
                <vue-slider v-model="current" v-bind="options" width="100%" />
            </template>
        </helper-fieldset>
    </v-flex>
</template>

<script>
    export default {
        components: {
            VueSlider: () => import(/* webpackChunkName: "slider" */ 'vue-slider-component')
        },
        props: {
            dense: {
                type: Boolean
            }
        },
        data: () => ({
            options: {
                processStyle: { backgroundColor: '#5181b8' },
                useKeyboard: true,
                clickable: true,
                width: 'auto',
                dotSize: 10,
                interval: 1,
                duration: .5,
                height: 4,
                max: 128,
                min: 8
            }
        }),
        computed: {
            current: {
                set(magicThreshold) {
                    this.$store.commit('canvas/setDrawerOption', { magicThreshold })
                },
                get() {
                    return this.$store.state.canvas.drawerOptions.magicThreshold
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .magic-thresholds {
        ::v-deep .v-text-field > .v-input__control > .v-input__slot {
            cursor: pointer;
        }
    }
</style>
