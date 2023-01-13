<template>
    <v-layout class="chatbot-dialogs__keyboard"
        :class="{ fullscreen: mobile, [`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`]: true }"
    >
        <div class="chatbot-dialogs__keyboard-pane" :key="force">
            <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout v-show="!editContentMarker" class="chatbot-dialogs__btn-wrapper" justify-start>
                    <v-btn @click="$emit('close')" aria-label="close" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                    <v-btn @click="$refs.grid.insert('row')" aria-label="add-row" icon>
                        <v-icon>mdi-playlist-plus</v-icon>
                    </v-btn>
                    <v-btn @click="$refs.grid.insert('btn')" aria-label="add-btn" icon>
                        <v-icon>mdi-view-grid-plus</v-icon>
                    </v-btn>
                    <v-btn @click="editStructMarker = !editStructMarker" aria-label="edit-save" icon>
                        <v-icon v-text="editStructMarker ? 'mdi-content-save-outline' : 'mdi-pencil-outline'" />
                    </v-btn>
                </v-layout>
                <v-layout v-show="editContentMarker" class="chatbot-dialogs__btn-wrapper" justify-start>
                    <v-btn @click="apply(false)" aria-label="return" icon>
                        <v-icon>mdi-keyboard-backspace</v-icon>
                    </v-btn>
                    <v-btn @click="apply(true)" aria-label="apply" icon>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <client-only>
                    <v-tabs v-show="!editContentMarker"
                        class="chatbot-dialogs__tabs-header"
                        :color="color"
                        :key="force"
                        height="60px"
                        hide-slider
                        show-arrows
                        grow
                    >
                        <v-tab @click="$emit('close')" :ripple="false">
                            <v-icon :color="color">mdi-window-close</v-icon>
                        </v-tab>
                        <v-tab @click="$refs.grid.insert('row')" :ripple="false">
                            <v-icon :color="color">mdi-playlist-plus</v-icon>
                        </v-tab>
                        <v-tab @click="$refs.grid.insert('btn')" :ripple="false">
                            <v-icon :color="color">mdi-view-grid-plus</v-icon>
                        </v-tab>
                        <v-tab @click="editStructMarker = !editStructMarker" :ripple="false">
                            <v-icon :color="color" v-text="editStructMarker ? 'mdi-content-save-outline' : 'mdi-pencil-outline'" />
                        </v-tab>
                    </v-tabs>
                    <v-tabs
                        v-show="editContentMarker"
                        class="chatbot-dialogs__tabs-header"
                        :color="color"
                        height="60px"
                        hide-slider
                        grow
                    >
                        <v-tab @click="apply(false)" :ripple="false">
                            <v-icon :color="color">mdi-keyboard-backspace</v-icon>
                        </v-tab>
                        <v-tab @click="apply(true)" :ripple="false">
                            <v-icon :color="color">mdi-check</v-icon>
                        </v-tab>
                    </v-tabs>
                </client-only>
            </template>

            <div class="chatbot-dialogs__tabs-content">
                <div class="key-rows scroller">
                    <keyboard-grid
                        v-show="!editContentMarker"
                        @change:config="saveConfig"
                        :editable="editStructMarker"
                        :config="config"
                        ref="grid"
                    >
                        <template #header="{ children }">
                            <v-layout v-if="!children || !children.length" fill-height align-center>
                                <v-flex class="text-center disabled--text">
                                    <p>{{ $t('keyboard.empty') }} <v-icon>mdi-pencil-outline</v-icon></p>
                                </v-flex>
                            </v-layout>
                        </template>
                    </keyboard-grid>

                    <v-layout v-if="editContentMarker" class="BtnDetailed" column>
                        <v-flex my-2>
                            <v-text-field
                                v-model="redact.props.text"
                                :color="color"
                                label="Label"
                                hide-details
                                outlined
                            />
                        </v-flex>
                        <v-flex my-2>
                            <v-select
                                v-model="redact.props.background"
                                :item-color="color"
                                :color="color"
                                :items="colors"
                                label="Color"
                                hide-details
                                outlined
                                dense
                            />
                        </v-flex>
                        <v-flex my-2>
                            <v-combobox
                                placeholder="Payload"
                                v-model="redact.props.payload"
                                :item-color="color"
                                :color="color"
                                append-icon=""
                                deletable-chips
                                hide-details
                                small-chips
                                multiple
                                outlined
                                chips
                            />
                        </v-flex>
                    </v-layout>
                </div>
            </div>
        </div>
    </v-layout>
</template>

<script>
    import keyboard from '~/mixins/chatbot/keyboard'
    import { nullConfig } from '~/utils/chatbot'

    export default {
        mixins: [keyboard],

        props: {
            value: Object
        },
        computed: {
            config() {
                return this.value
                    ? Object.assign(nullConfig(), this.value.keyboard || {})
                    : nullConfig()
            },
            mobile() {
                return !!(this.$BROWSER || { IS_MOBILE: true }).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            'value.keyboard'() {
                this.$refs.grid?.externalUpdate(this.config)
            },
            mobile() {
                this.force = !this.force
            }
        },
        data: () => ({
            force: false
        }),
        methods: {
            saveConfig(config)
            {
                this.$emit('save', config)
            }
        },
        mounted()
        {
            this.$nextTick().then(() => {
                this.force = !this.force
            })
        }
    }
</script>

<style lang="scss" scoped>
    .chatbot-dialogs__keyboard {
        &.fullscreen {
            min-height: 100%;
            height: 100%;
        }
        .chatbot-dialogs__keyboard-pane {
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            max-height: 100%;
            width: 100%;

            background-color: #fff;

            .chatbot-dialogs__btn-wrapper {
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
            .chatbot-dialogs__tabs-header {
                flex: 0 1 auto;
                border-bottom: 1px solid #e3e4e8;

                ::v-deep .v-tabs__div {
                    transition: background-color .4s;

                    &:hover {
                        background-color: rgba(70,70,70,.1);
                    }
                }
            }
            .chatbot-dialogs__tabs-content {
                padding: 15px 10px;
                min-height: 345px;

                .key-rows {
                    height: 280px !important;

                    ::v-deep .v-text-field .v-input__slot {
                        fieldset {
                            border: 2px solid;
                        }
                    }
                    .disabled--text {
                        ::v-deep .v-icon {
                            font-size: 22px;
                        }
                    }
                }
                ::v-deep .v-list {
                    padding: 0;
                }
            }
        }
        &.theme--dark .chatbot-dialogs__keyboard-pane {
            background-color: #1e1e1e;

            .chatbot-dialogs__tabs-header {
                border-bottom: 1px solid #424242;
            }
            .chatbot-dialogs__tabs-content {
                .key-rows .disabled--text {
                    color: #7a7a7a;

                    ::v-deep .v-icon {
                        color: #7a7a7a;
                    }
                }
            }
        }
    }
</style>
