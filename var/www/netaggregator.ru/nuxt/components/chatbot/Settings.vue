<template>
    <v-layout class="chatbot-default__settings"
        :class="{ fullscreen: mobile, [`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`]: true }"
    >
        <div class="chatbot-default__tabs" ref="container">
            <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout v-show="keyboard && editContentMarker" class="chatbot-default__btn-wrapper" justify-start>
                    <v-btn @click="apply(false)" aria-label="return" icon>
                        <v-icon>mdi-keyboard-backspace</v-icon>
                    </v-btn>
                    <v-btn @click="apply(true)" aria-label="apply" icon>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                </v-layout>
                <v-layout v-show="keyboard && !editContentMarker" class="chatbot-default__btn-wrapper" justify-start>
                    <v-btn @click="keyboard = false" aria-label="return" icon>
                        <v-icon>mdi-keyboard-backspace</v-icon>
                    </v-btn>
                    <v-btn @click="$refs.grid.insert('row')" aria-label="add-row" icon>
                        <v-icon>mdi-playlist-plus</v-icon>
                    </v-btn>
                    <v-btn @click="$refs.grid.insert('btn')" aria-label="add-btn" icon>
                        <v-icon>mdi-view-grid-plus</v-icon>
                    </v-btn>
                    <v-btn @click="editStructMarker = !editStructMarker" aria-label="save-edit" icon>
                        <v-icon v-text="editStructMarker ? 'mdi-content-save-outline' : 'mdi-pencil-outline'" />
                    </v-btn>
                </v-layout>
                <v-layout v-show="!keyboard" class="chatbot-default__btn-wrapper" justify-start>
                    <v-btn @click="close" aria-label="close" icon>
                        <v-icon>
                            {{ addDefault ? 'mdi-keyboard-backspace' : 'mdi-window-close' }}
                        </v-icon>
                    </v-btn>
                    <v-btn v-if="!addDefault" @click="addDefault = true" aria-label="edit" icon>
                        <v-icon>mdi-playlist-edit</v-icon>
                    </v-btn>
                    <v-btn v-if="!addDefault" @click="keyboard = true" aria-label="control" icon>
                        <v-icon>mdi-keyboard-outline</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs v-show="keyboard && editContentMarker"
                    class="chatbot-default__tabs-header"
                    :color="color"
                    height="60px"
                    hide-slider
                    show-arrows
                    grow
                >
                    <v-tab @click="apply(false)" :ripple="false">
                        <v-icon :color="color">mdi-keyboard-backspace</v-icon>
                    </v-tab>
                    <v-tab @click="apply(true)" :ripple="false">
                        <v-icon :color="color">mdi-check</v-icon>
                    </v-tab>
                </v-tabs>
                <v-tabs v-show="keyboard && !editContentMarker"
                    class="chatbot-default__tabs-header"
                    :color="color"
                    height="60px"
                    hide-slider
                    show-arrows
                    grow
                >
                    <v-tab @click="keyboard = false" :ripple="false">
                        <v-icon :color="color">mdi-keyboard-backspace</v-icon>
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
                <v-tabs v-show="!keyboard"
                    class="chatbot-default__tabs-header"
                    :color="color"
                    height="60px"
                    hide-slider
                    show-arrows
                    grow
                >
                    <v-tab @click="close" :ripple="false">
                        <v-icon :color="color">
                            {{ addDefault ? 'mdi-keyboard-backspace' : 'mdi-window-close' }}
                        </v-icon>
                    </v-tab>
                    <v-tab v-if="!addDefault" @click="addDefault = true" :ripple="false">
                        <v-icon :color="color">mdi-playlist-edit</v-icon>
                    </v-tab>
                    <v-tab v-if="!addDefault" @click="keyboard = true" :ripple="false">
                        <v-icon :color="color">mdi-keyboard-outline</v-icon>
                    </v-tab>
                </v-tabs>
            </template>

            <div class="chatbot-default__tabs-content" :class="{ mobile }" :style="{ height }">
                <v-layout v-show="keyboard" justify-center column>
                    <div class="key-rows">
                        <lazy-keyboard-grid
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
                        </lazy-keyboard-grid>

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
                </v-layout>
                <v-layout v-show="!keyboard" class="scroller" :key="addDefault" ref="list" column>
                    <template v-if="addDefault">
                        <v-flex class="settings-textarea" xs12>
                            <v-textarea
                                v-model="text"
                                :label="$t('chatbot.default_reply')"
                                :color="color"
                                rows="8"
                                hide-details
                                no-resize
                                filled
                            />
                        </v-flex>
                        <v-flex class="settings-addreply__btn" pt-2>
                            <v-btn class="shadowless"
                                @click="addReply"
                                :color="color"
                                aria-label="add-reply"
                                block
                            >
                                {{ $t('chatbot.add_reply') }}
                            </v-btn>
                        </v-flex>
                    </template>
                    <template v-else-if="defaultReply.length">
                        <v-list class="default-list">
                            <template v-for="(item, i) in defaultReply">
                                <v-list-item @click.stop="edit(item, i)" :ripple="false" :key="i">
                                    <v-list-item-title v-text="item" />

                                    <v-btn class="v-btn--simple"
                                        @click.stop="remove(i)"
                                        :color="color"
                                        aria-label="remove"
                                        icon
                                    >
                                        <v-icon :color="color" dense>
                                            mdi-trash-can-outline
                                        </v-icon>
                                    </v-btn>
                                </v-list-item>
                            </template>
                        </v-list>
                    </template>
                    <template v-else>
                        <v-flex class="text-center disabled--text" align-self-center>
                            <p>{{ $t('chatbot.empty_list') }}</p>
                        </v-flex>
                    </template>
                </v-layout>
            </div>
        </div>
    </v-layout>
</template>

<script>
    import { clone, nullConfig } from '~/utils/chatbot'
    import keyboard from '~/mixins/chatbot/keyboard'

    export default {
        mixins: [keyboard],

        computed: {
            config() {
                return Object.assign(nullConfig(), this.defaultKeyboard)
            },
            defaultKeyboard() {
                const { list, idx } = this.$store.state.chatbot

                return idx !== null
                    ? (list[idx] || {}).keyboard || {}
                    : {}
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            safari() {
                return !!(this.$BROWSER || {}).IS_SAFARI
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            '$store.state.app.window': 'measure',
            '$store.state.chatbot': {
                deep: true,
                handler({ list, idx }) {
                    this.defaultReply = (list[idx] || {}).default || []
                }
            },

            addDefault(v) {
                v ? (this.defaultReply = this.getDefaultReply()) : this.addScroll()
            },
            defaultKeyboard(v) {
                this.$refs.grid?.externalUpdate(v)
            },

            keyboard: 'addScroll'
        },
        data() {
            return {
                defaultReply: this.getDefaultReply(),
                addDefault: false,
                keyboard: false,
                height: '364px',

                taskHandle: 0,
                attempts: 10,

                ScrollBar: null,
                smooth: null,

                idx: null,
                text: ''
            }
        },
        methods: {
            measure()
            {
                let h

                if (this.mobile) {
                    this.height = '100%'

                } else if ((h = this.$refs.container?.clientHeight)) {
                    this.height = Math.ceil(.8 * h) + 'px'
                }
            },
            saveConfig(config)
            {
                this.$store.commit('chatbot/setDefaultKeyboard', config)
            },
            setDefaultReply(reply)
            {
                this.$store.commit('chatbot/setDefaultReply', reply)
            },
            getDefaultReply()
            {
                const { list, idx } = this.$store.state.chatbot

                return idx !== null
                    ? (list[idx] || {}).default || []
                    : []
            },
            addReply()
            {
                if (this.text === '') return

                const reply = clone(this.defaultReply)

                if (this.idx !== null) {
                    reply[this.idx] = this.text
                } else {
                    reply.unshift(this.text)
                }

                this.setDefaultReply(reply)

                this.addDefault = false
                this.idx = null
                this.text = ''
            },
            remove(idx)
            {
                const reply = clone(this.defaultReply).filter((_, i) => i !== idx)

                this.setDefaultReply(reply)
                this.addDefault = false
            },
            edit(item, i)
            {
                this.text = item
                this.idx = i

                this.addDefault = true
            },
            close()
            {
                if (this.addDefault) {
                    this.addDefault = false
                    this.text = ''
                    return
                }

                this.$emit('close')
            },
            initScroll()
            {
                if (this.ScrollBar) return Promise.resolve()

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    return import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.ScrollBar = Scrollbar
                        })

                } else {
                    return import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.ScrollBar = Scrollbar
                        })
                }
            },
            addScroll()
            {
                if (!this.$refs.list || this.addDefault) return

                this.initScroll().then(() => {
                    if (this.mobile) {
                        this.smooth = this.ScrollBar(this.$refs.list, {
                            scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' }
                        })

                    } else {
                        this.smooth = this.ScrollBar.init(this.$refs.list, {
                            damping: this.mobile ? .5 : 1,
                            continuousScrolling: false
                        })

                        this.smooth.updatePluginOptions('overscroll', {
                            enable: false
                        })
                    }
                })
            }
        },
        mounted()
        {
            this.$nextTick().then(this.measure)
                .then(this.addScroll)
        }
        /* updated()
        {
            this.$nextTick().then(this.measure)
        } */
    }
</script>

<style lang="scss" scoped>
    .chatbot-default__settings {
        &.fullscreen {
            min-height: 100%;
            height: 100%;
        }
        .chatbot-default__tabs {
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            max-height: 100%;
            width: 100%;

            background-color: #fff;

            .chatbot-default__btn-wrapper {
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
            .chatbot-default__tabs-header {
                flex: 0 1 auto;
                border-bottom: 1px solid #e3e4e8;

                ::v-deep .v-tabs__div {
                    transition: background-color .5s;

                    &:hover {
                        background-color: rgba(70,70,70,.1);
                    }
                }
            }
            .chatbot-default__tabs-content {
                margin: 15px 10px;
                min-height: 364px;

                .layout.scroller {
                    min-height: 360px;

                    ::v-deep .scrollbar-track {
                        border-radius: 4px;
                        background: unset;
                        cursor: pointer;

                        .scrollbar-thumb-y {
                            margin-left: 4px;
                            width: 4px;
                        }
                    }
                }
                .key-rows {
                    ::v-deep .v-text-field .v-input__slot {
                        fieldset {
                            border: 2px solid;
                        }
                    }
                    .disabled--text .v-icon {
                        font-size: 22px;
                    }
                }
                .settings-textarea {
                    flex: 1 0 315px;

                    ::v-deep .v-input.v-textarea {
                        height: 315px;

                        &.theme--dark .v-input__control > .v-input__slot::before {
                            border-color: transparent;
                        }
                        textarea {
                            margin-top: 30px;
                            height: 285px;
                        }
                    }
                }
                .settings-addreply__btn {
                    flex: 0 1 auto;

                    ::v-deep .v-btn {
                        margin-bottom: 0;

                        &.theme--dark {
                            .v-btn__content {
                                color: #a8a8a8;
                            }
                        }
                    }
                }
                .disabled--text {
                    margin: 30% 0;
                }
                ::v-deep .v-list {
                    padding: 0;
                }
                ::v-deep .v-btn {
                    &:hover::before {
                        background-color: currentColor;
                        opacity: .2;
                    }
                    .v-icon {
                        font-size: 1rem;
                    }
                }
                &.mobile {
                    height: 100% !important;

                    .layout.scroller {
                        height: 100%;
                    }
                    .settings-textarea {
                        ::v-deep .v-input.v-textarea {
                            height: 100%;

                            .v-input__control,
                            .v-input__control .v-input__slot {
                                height: 100%;
                            }
                        }
                    }
                }
            }
        }
        &.theme--dark .chatbot-default__tabs {
            background-color: #1e1e1e;

            .chatbot-default__tabs-header {
                border-bottom: 1px solid #424242;
            }
            .chatbot-default__tabs-content {
                .default-list .v-list-item {
                    .v-list-item__title {
                        color: #7a7a7a;
                    }
                    .v-btn .v-icon {
                        color: #7a7a7a !important;
                    }
                }
                .layout.scroller {
                    ::v-deep .scrollbar-track {
                        .scrollbar-thumb-y {
                            background: #424242;
                        }
                    }
                }
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
