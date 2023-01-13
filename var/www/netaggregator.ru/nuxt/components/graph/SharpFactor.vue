<template>
    <v-flex class="sharp-slider" v-bind="$attrs">
        <helper-fieldset>
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
                max: 60,
                min: 0
            }
        }),
        computed: {
            current: {
                set(sharp) {
                    this.$store.commit('canvas/setDrawerOption', { sharp })
                },
                get() {
                    return this.$store.state.canvas.drawerOptions.sharp
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .sharp-slider {
        ::v-deep .v-text-field > .v-input__control > .v-input__slot {
            cursor: pointer;
        }
    }
</style>
