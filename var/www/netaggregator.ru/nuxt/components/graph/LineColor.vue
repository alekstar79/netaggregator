<template>
    <v-flex class="line-color" v-bind="$attrs">
        <helper-fieldset dense>
            <template #label>
                {{ $t('graph.stroke_color') }}
            </template>

            <template #content>
                <v-menu
                    transition="slide-y-transition"
                    content-class="line-color-menu"
                    :close-on-content-click="false"
                    max-width="210px"
                    bottom
                    left
                >
                    <template #activator="{ on }">
                        <v-btn v-on="on" :color="color" :ripple="false" elevation="0" x-small block>
                            {{ rgba.a >= .01 ? '&nbsp;' : 'transparent' }}
                        </v-btn>
                    </template>

                    <v-card class="color-dialog__body">
                        <v-color-picker
                            v-model="rgba"
                            canvas-height="135px"
                            width="210px"
                            dot-size="10"
                            mode="hexa"
                            hide-mode-switch
                            flat
                        />
                        <v-btn class="color-copy" @click.stop="copy" text>
                            <span class="mdi mdi-content-copy" />
                        </v-btn>
                    </v-card>
                </v-menu>
            </template>
        </helper-fieldset>
    </v-flex>
</template>

<script>
    import { VColorPickerPatched as VColorPicker } from '~/utils/v-color-picker-patch'
    import { rgbaStringify } from '~/utils/common/rgba-stringify.mjs'
    import { rgbaParse } from '~/utils/common/rgba-parse.mjs'

    /**
     * @see https://css-tricks.com/converting-color-spaces-in-javascript
     */
    function RGBAToHexA({ r, g, b, a })
    {
        a = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase()

        r = (+r).toString(16).padStart(2, '0').toUpperCase()
        g = (+g).toString(16).padStart(2, '0').toUpperCase()
        b = (+b).toString(16).padStart(2, '0').toUpperCase()

        return '#' + r + g + b + a
    }

    export default {
        components: {
            VColorPicker
        },
        computed: {
            color() {
                return this.$store.state.canvas.drawerOptions.stroke
            },
            rgba: {
                set(v) {
                    this.$store.commit('canvas/setDrawerOption', {
                        stroke: rgbaStringify(v)
                    })
                },
                get() {
                    return rgbaParse(this.color)
                }
            }
        },
        methods: {
            copy()
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(RGBAToHexA(this.rgba)))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            }
        }
    }
</script>

<style lang="scss" scoped>
    .line-color-menu .color-dialog__body {
        ::v-deep .v-color-picker {
            .v-color-picker__canvas {
                max-width: 210px;
            }
            .v-color-picker__controls {
                padding: 15px 10px 7px; // 16px 10px

                .v-color-picker__edit {
                    margin-top: 20px;

                    .v-color-picker__input {
                        input {
                            text-align: left;
                            padding-left: 10px;
                            margin-right: 30px;
                            margin-bottom: 0;
                        }
                        span {
                            display: none;
                        }
                    }
                }
            }
        }
        .v-btn.color-copy {
            position: absolute;
            bottom: 7px;
            right: 9px;

            height: 29px;
            min-width: unset;
            padding: 0 5px;
        }
    }
</style>
