<template>
    <v-flex class="bulge-slider" v-bind="$attrs">
        <helper-fieldset :dense="dense">
            <template #label>
                {{ $t('graph.factor') }}
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
                dotSize: 10,
                interval: .1,
                duration: .5,
                width: 'auto',
                height: 4,
                processStyle: { backgroundColor: '#5181b8' },
                useKeyboard: true,
                clickable: true,
                max: 1,
                min: 0
            }
        }),
        computed: {
            current: {
                set(bulge) {
                    this.$store.commit('canvas/setDrawerOption', { bulge })
                },
                get() {
                    return this.$store.state.canvas.drawerOptions.bulge
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .bulge-slider {
        ::v-deep .v-text-field > .v-input__control > .v-input__slot {
            cursor: pointer;
        }
    }
</style>
