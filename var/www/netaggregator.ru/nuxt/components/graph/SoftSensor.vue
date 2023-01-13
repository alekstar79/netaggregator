<template>
    <v-flex class="soft-sensor" v-bind="$attrs">
        <helper-fieldset :dense="dense">
            <template #label>
                {{ $t('graph.soft') }}
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
                interval: .1,
                duration: .5,
                height: 4,
                max: 1,
                min: 0
            }
        }),
        computed: {
            current: {
                set(soft) {
                    this.$store.commit('canvas/setDrawerOption', { soft })
                },
                get() {
                    return this.$store.state.canvas.drawerOptions.soft
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .soft-sensor {
        ::v-deep .v-text-field > .v-input__control > .v-input__slot {
            cursor: pointer;
        }
    }
</style>
