<template>
    <v-flex class="alpha-chanel" v-bind="$attrs">
        <helper-fieldset :dense="dense">
            <template #label>
                {{ $t('graph.alpha') }}
            </template>

            <template #content>
                <vue-slider v-model="current" v-bind="options" width="100%" />
            </template>
        </helper-fieldset>
    </v-flex>
</template>

<script>
    import { rclamp } from '~/utils/common/clamp.mjs'

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
                interval: 1,
                duration: .5,
                width: 'auto',
                height: 4,
                processStyle: { backgroundColor: '#5181b8' },
                useKeyboard: true,
                clickable: true,
                max: 20, // 255
                min: 0
            }
        }),
        computed: {
            current: {
                set(alpha) {
                    this.$store.commit('canvas/setDrawerOption', { alpha })
                },
                get() {
                    return rclamp(this.$store.state.canvas.drawerOptions.alpha, 0, 20)
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .alpha-chanel {
        ::v-deep .v-text-field > .v-input__control > .v-input__slot {
            cursor: pointer;
        }
    }
</style>
