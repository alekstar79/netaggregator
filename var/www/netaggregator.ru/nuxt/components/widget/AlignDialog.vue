<template>
    <v-dialog v-model="proxy" :width="mobile ? '100%' : '320px'" :fullscreen="mobile">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <v-card class="align-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="align-dialog__btn-wrapper" justify-start>
                    <v-btn @click="close" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                    <v-btn v-if="set.remove" @click="remove" icon>
                        <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                    <v-btn @click="apply" icon>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs class="align-dialog__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab @click="close" :ripple="false">
                        <v-icon :color="color">mdi-window-close</v-icon>
                    </v-tab>
                    <v-tab v-if="set.remove" @click="remove" :ripple="false">
                        <v-icon :color="color">mdi-trash-can-outline</v-icon>
                    </v-tab>
                    <v-tab @click="apply" :ripple="false">
                        <v-icon :color="color">mdi-check</v-icon>
                    </v-tab>
                </v-tabs>
            </template>

            <v-card-text class="align-dialog__card-pane">
                <v-layout column>
                    <v-flex>
                        <lazy-widget-text-field
                            v-model="text"
                            :label="$t('widget.designation')"
                            :rules="[rule]"
                            :error="long"
                        />
                    </v-flex>
                    <v-flex>
                        <v-layout justify-center>
                            <v-btn @click="align = 'left'"
                                :class="{ active: align === 'left' }"
                                :color="color"
                                icon
                            >
                                <v-icon>mdi-format-align-left</v-icon>
                            </v-btn>
                            <v-btn @click="align = 'center'"
                                :class="{ active: align === 'center' }"
                                :color="color"
                                icon
                            >
                                <v-icon>mdi-format-align-center</v-icon>
                            </v-btn>
                            <v-btn @click="align = 'right'"
                                :class="{ active: align === 'right' }"
                                :color="color"
                                icon
                            >
                                <v-icon>mdi-format-align-right</v-icon>
                            </v-btn>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: ['value', 'set'],

        model: {
            event: 'input',
            prop: 'value'
        },
        data: () => ({
            align: 'center',
            long: false,
            text: null,
            ln: 0
        }),
        computed: {
            proxy: {
                set(v) {
                    this.$emit('input', v)
                },
                get() {
                    return this.value
                }
            },
            errorMsg() {
                const { $i18n: { locale = 'ru' }, ln } = this

                return locale === 'en' ? `Length more than ${ln} chars` : `Длина более ${ln} символов`
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            value: 'start'
        },
        methods: {
            rule(v)
            {
                return ((this.long = !!(v && this.ln && this.ln < v.length))) ? this.errorMsg : true
            },
            setProps()
            {
                this.text = this.set.text
                this.ln = this.set.ln
            },
            start(v)
            {
                v ? this.setProps() : this.$emit('input', v)
            },
            apply()
            {
                if (this.menu || this.long) return

                this.$emit('update', { text: this.text, align: this.align })

                this.long = false
            },
            close()
            {
                this.$emit('update', { close: true })

                this.long = false
            },
            remove()
            {
                this.$emit('update', { remove: true })

                this.long = false
            }
        }
    }
</script>

<style lang="scss" scoped>
    .align-dialog__card {
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .align-dialog__card-pane {
                max-height: calc(100vh - 86px);
            }
        }
        .align-dialog__btn-wrapper {
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
        .align-dialog__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
        ::v-deep .v-card__text.align-dialog__card-pane {
            padding: 15px;

            .v-btn {
                &:hover::before, &.active {
                    background-color: currentColor;
                    opacity: .3;
                }
                &.active {
                    .v-btn__content .v-icon {
                        color: white;
                    }
                }
            }
        }
    }
</style>
