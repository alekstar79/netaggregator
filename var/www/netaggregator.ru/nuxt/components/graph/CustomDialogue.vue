<template>
    <v-card class="custom-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="custom-dialog__btn-wrapper" justify-start>
                <v-btn @click="close" icon>
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
                <v-btn @click="open" icon>
                    <v-icon>mdi-check</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs :color="color" class="custom-dialog__tabs-header" height="60px" hide-slider show-arrows grow>
                <v-tab @click="close" :ripple="false">
                    <v-icon :color="color">
                        mdi-window-close
                    </v-icon>
                </v-tab>
                <v-tab @click="open" :ripple="false">
                    <v-icon :color="color">
                        mdi-check
                    </v-icon>
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="custom-dialog__card-pane">
            <v-layout class="pane">
                <v-text-field
                    class="cell-width"
                    type="number"
                    label="W"
                    v-model="w"
                    @wheel="wheel($event, 'w')"
                    :hide-details="!xE"
                    :rules="[xV]"
                    :color="color"
                    outlined
                    dense
                />
                <v-text-field
                    class="cell-height"
                    type="number"
                    label="H"
                    v-model="h"
                    @wheel="wheel($event, 'h')"
                    :hide-details="!yE"
                    :rules="[yV]"
                    :color="color"
                    outlined
                    dense
                />
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import { rclamp } from '~/utils/common/clamp.mjs'

    const validator = n => n <= 0 || n > 3000 ? 'Value can range from 0 to 3000' : true

    export default {
        computed: {
            xE() {
                return this.xNotNumber || this.xOutOfRange || this.xError
            },
            yE() {
                return this.yNotNumber || this.yOutOfRange || this.yError
            },
            xOutOfRange() {
                return this.dump.width <= 0 || this.dump.width > 3000
            },
            yOutOfRange() {
                return this.dump.height <= 0 || this.dump.height > 3000
            },
            xNotNumber() {
                return typeof this.dump.width !== 'number'
            },
            yNotNumber() {
                return typeof this.dump.height !== 'number'
            },
            w: {
                get() {
                    return rclamp(Number(this.dump.width), 0, 3000)
                },
                set(x) {
                    this.dump.width = rclamp(Number(x), 0, 3000)
                }
            },
            h: {
                get() {
                    return rclamp(Number(this.dump.height), 0, 3000)
                },
                set(y) {
                    this.dump.height = rclamp(Number(y), 0, 3000)
                }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            }
        },
        data: () => ({
            dump: { width: 1024, height: 768 },

            xError: false,
            yError: false
        }),
        methods: {
            wheel({ deltaY, wheelDelta }, direction)
            {
                this[direction] += Math.max(-1, Math.min(1, (deltaY || wheelDelta)))
            },
            xV(n)
            {
                const v = validator(Number(n))

                this.xError = typeof v === 'string'

                return v
            },
            yV(n)
            {
                const v = validator(Number(n))

                this.yError = typeof v === 'string'

                return v
            },
            open()
            {
                this.$emit('create', this.dump)

                this.close()
            },
            close()
            {
                this.$emit('close')
            }
        }
    }
</script>

<style lang="scss" scoped>
    .custom-dialog__card {
        .custom-dialog__btn-wrapper {
            max-height: 60px;
            padding: 0 10px;

            ::v-deep .v-btn {
                cursor: pointer;
                margin: 0 5px;

                &:hover::before {
                    background-color: currentColor;
                }
            }
        }
        .custom-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;
        }
        .custom-dialog__card-pane {
            padding: 15px !important;

            .pane .cell-height,
            .pane .cell-width {
                padding: 5px;

                &::v-deep.v-input .v-input__slot .v-text-field__slot {
                    input::-webkit-outer-spin-button,
                    input::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }

                    input[type=number] {
                        -moz-appearance: textfield;
                    }
                }
            }
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .custom-dialog__card-pane {
                max-height: calc(100vh - 61px);
            }
        }
        &.theme--dark {
            .custom-dialog__tabs-header {
                border-color: #8f8f8f;
            }
        }
    }
    @media all and (max-width: 320px) {
        .custom-dialog__card-pane::v-deep {
            height: calc(100vh - 61px);
        }
    }
</style>
