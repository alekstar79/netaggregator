<template>
    <v-flex class="line-thickness" v-bind="$attrs">
        <helper-fieldset :dense="dense">
            <template #label>
                {{ $t(label) }}
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
            label: {
                type: String,
                default: 'graph.line_size'
            },
            dense: {
                type: Boolean
            }
        },
        data: () => ({
            options: {
                dotSize: 10,
                interval: 1,
                duration: .5,
                width: 'auto',
                height: 4,
                processStyle: { backgroundColor: '#5181b8' },
                useKeyboard: true,
                clickable: true,
                max: 100,
                min: 0
            }
        }),
        computed: {
            current: {
                set(strokeWidth) {
                    this.$store.commit('canvas/setDrawerOption', { strokeWidth })
                },
                get() {
                    return this.$store.state.canvas.drawerOptions.strokeWidth
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .line-thickness {
        ::v-deep .v-text-field > .v-input__control > .v-input__slot {
            cursor: pointer;
        }
    }
</style>
