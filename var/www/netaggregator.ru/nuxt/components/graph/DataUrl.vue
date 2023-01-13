<template>
    <v-card class="dataurl-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="dataurl-dialog__btn-wrapper" justify-start>
                <v-btn @click="$emit('close')" icon>
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs :color="color" class="dataurl-dialog__tabs-header" height="60px" hide-slider show-arrows grow>
                <v-tab @click="$emit('close')" :ripple="false">
                    {{ mobile ? '&lt;' : '' }} BASE64 DATAURL
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="dataurl-dialog__card-pane">
            <v-layout class="pane">
                <v-textarea
                    v-model="b64fake"
                    label="Base64"
                    ref="textarea"
                    :color="color"
                    hide-details
                    no-resize
                    readonly
                    filled
                />

                <div class="dataurl__area--tools">
                    <v-tooltip :disabled="mobile" top>
                        <template #activator="{ on }">
                            <v-btn @click="copy" v-on="on" :color="color" small icon>
                                <v-icon :color="color">mdi-content-copy</v-icon>
                            </v-btn>
                        </template>

                        <span>{{ $t('graph.clipboard') }}</span>
                    </v-tooltip>

                    <v-tooltip :disabled="mobile" top>
                        <template #activator="{ on }">
                            <v-btn @click="saveDataURL" v-on="on" :color="color" small icon>
                                <v-icon :color="color">mdi-file-outline</v-icon>
                            </v-btn>
                        </template>

                        <span>{{ $t('graph.save_as_file') }}</span>
                    </v-tooltip>
                </div>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import { rndstring } from '~/utils/common/symbols.mjs'

    import saveAs from 'file-saver'

    export default {
        props: {
            b64data: String,
            b64fake: String
        },
        computed: {
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        data: () => ({
            url: null
        }),
        methods: {
            copy()
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(this.b64data))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            saveDataURL()
            {
                const type = 'text/plain;charset=utf-8',
                    name = rndstring() + '.txt'

                // https://github.com/eligrey/FileSaver.js
                // saveAs(new File([this.b64data], name, { type }))
                saveAs(new Blob([this.b64data], { type }), name)
            }
        },
        mounted()
        {
            this.$nextTick().then(() => {
                this.$refs.textarea.$refs.input.setAttribute('oncopy', 'return false;')
                this.$refs.textarea.$refs.input.setAttribute('tabindex', '-1')
            })
        }
    }
</script>

<!--suppress CssUnknownProperty -->
<style lang="scss" scoped>
    .dataurl-dialog__card {
        .dataurl-dialog__btn-wrapper {
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
        .dataurl-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;
        }
        .dataurl-dialog__card-pane {
            padding: 15px;

            *, ::v-deep * {
                -webkit-touch-callout: none;
                          user-select: none;
            }
            .pane {
                position: relative;

                ::v-deep .v-textarea.v-text-field--enclosed {
                    border-radius: 0;

                    .v-input__control .v-input__slot {
                        background: unset;

                        textarea {
                            scrollbar-width: none;
                            min-height: 350px;
                            margin-top: 30px;

                            &::-webkit-scrollbar {
                                width: 0;
                            }
                        }
                    }
                }
                .dataurl__area--tools {
                    position: absolute;
                    right: 5px;
                    top: 5px;

                    ::v-deep .v-btn {
                        height: 30px;
                        width: 30px;
                        margin: 0;

                        &:hover::before {
                            background-color: currentColor;
                            opacity: .2;
                        }
                        .v-icon {
                            font-size: 1rem;
                        }
                    }
                }
            }
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .dataurl-dialog__card-pane {
                max-height: calc(100vh - 61px);
            }
        }
    }
</style>
