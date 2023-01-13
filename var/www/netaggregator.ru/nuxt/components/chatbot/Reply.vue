<template>
    <v-layout :class="{ fullscreen: mobile, [`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`]: true }"
        class="chatbot-dialogs__reply"
    >
        <div class="chatbot-dialogs__tabs">
            <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="chatbot-dialogs__btn-wrapper" justify-start>
                    <v-btn v-if="filter" @click="filter = false" aria-label="return" icon>
                        <v-icon>mdi-keyboard-backspace</v-icon>
                    </v-btn>
                    <v-btn v-if="!filter" @click="$emit('close')" aria-label="close" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                    <v-btn v-if="condition && !filter" @click="filter = true" aria-label="call-filter" icon>
                        <v-icon>mdi-filter-outline</v-icon>
                    </v-btn>
                    <v-btn v-if="!filter" @click="$emit('apply', value)" aria-label="apply" icon>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs class="chatbot-dialogs__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab v-if="filter" @click="filter = false" :ripple="false">
                        <v-icon :color="color">mdi-keyboard-backspace</v-icon>
                    </v-tab>
                    <v-tab v-if="!filter" @click="$emit('close')" :ripple="false">
                        <v-icon :color="color">mdi-window-close</v-icon>
                    </v-tab>
                    <v-tab v-if="condition && !filter" @click="filter = true" :ripple="false">
                        <v-icon :color="color">mdi-filter-outline</v-icon>
                    </v-tab>
                    <v-tab v-if="!filter" @click="$emit('apply', value)" :ripple="false">
                        <v-icon :color="color">mdi-check</v-icon>
                    </v-tab>
                </v-tabs>
            </template>

            <div class="chatbot-dialogs__tabs-content scroller" :class="{ edge: filter && !mobile }">
                <v-layout v-if="filter" column py-4 px-2>
                    <lazy-chatbot-filters v-model="value.conditions" />
                </v-layout>

                <v-layout v-else column py-4 px-5>
                    <v-flex class="reply-text__area" mb-3>
                        <v-textarea v-model="value.text"
                            :color="color"
                            ref="textarea"
                            label="Ответ"
                            hide-details
                            auto-grow
                            filled
                        />

                        <div class="reply-text__area--tools">
                            <v-btn v-for="t in tools"
                                @click.stop="t.handler($event, t)"
                                :class="t.claz"
                                :color="color"
                                :key="t.claz"
                                aria-label="tools"
                                small
                                icon
                            >
                                <v-icon :color="color">
                                    {{ t.icon }}
                                </v-icon>
                            </v-btn>
                        </div>
                    </v-flex>

                    <v-flex v-if="condition" class="reply-filter" my-3>
                        <div class="legend">{{ $t('common.filter') }}</div>

                        <v-combobox
                            v-monit="hide"
                            :color="color"
                            :value="value.conditions"
                            class="chatbot-combobox"
                            append-icon=""
                            ref="combobox"
                            hide-details
                            outlined
                            multiple
                        >
                            <template #selection="data">
                                <v-chip class="v-chip--select-multi"
                                    :key="JSON.stringify(data.index)"
                                    :input-value="data.selected"
                                    :disabled="data.disabled"
                                    @click:close="removeFilter(data)"
                                    @click.stop=""
                                    close
                                    small
                                >
                                    {{ cut(data) }}
                                </v-chip>
                            </template>
                        </v-combobox>
                    </v-flex>

                    <v-flex v-if="value.attachments && value.attachments.length" mt-3>
                        <lazy-chatbot-viewer v-model="value" @update="$listeners.update" />
                    </v-flex>
                </v-layout>
            </div>
        </div>
    </v-layout>
</template>

<script>
    import { removeFromList } from '~/utils/chatbot'
    import insert from '~/mixins/chatbot/insert'
    import { hide } from '~/mixins/common'

    const update = () => ({ notifications: {}, attachments: [], conditions: [], keyboard: {}, value: null, email: {}, text: '' })

    export default {
        mixins: [hide, insert],

        props: {
            condition: Boolean,
            show: Boolean,
            reply: Object
        },
        directives: {
            monit: {
                bind(el, { value: callback }) {
                    callback()
                }
            }
        },
        computed: {
            tools() {
                const set = /** @type {{ claz: string, icon: string, handler: function }[]} */ [
                    { claz: 'braces',    icon: 'mdi-code-braces',      handler: this.append },
                    { claz: 'paperclip', icon: 'mdi-paperclip',        handler: this.attach.bind(this, 'attachment') },
                    { claz: 'keyboard',  icon: 'mdi-keyboard-outline', handler: this.attach.bind(this, 'keyboard') }
                ]

                if (!this.mobile) {
                    set.unshift({ claz: 'emoticon', icon: 'mdi-emoticon-happy-outline', handler: this.append })
                }

                return set
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            reply(v) {
                if (v !== null) {
                    this.value = Object.assign(update(), { ...v })
                }
            }
        },
        data: () => ({
            value: update(),
            filter: false
        }),
        methods: {
            removeFilter({ index })
            {
                this.value = { ...this.value, conditions: removeFromList([].concat(this.value?.conditions || []), index) }
            },
            cut({ item: { text = '' } })
            {
                return text.length > 13 ? text.slice(0, 12) + '…' : text
            },
            attach(dialog)
            {
                this.$emit('attach', { dialog, value: this.value })
            }
        },
        mounted()
        {
            this.value = Object.assign(update(), { ...this.reply || {} })
        }
    }
</script>

<style lang="scss" scoped>
    .chatbot-dialogs__reply {
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .chatbot-dialogs__tabs-content.scroller {
                max-height: calc(100vh - 86px);
            }
        }
        .chatbot-dialogs__tabs {
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

                &.theme--dark {
                    border-bottom: 1px solid #242424;
                }
                ::v-deep .v-tabs__div {
                    transition: background-color .4s;

                    &:hover {
                        background-color: rgba(70,70,70,.1);
                    }
                }
            }
            .chatbot-dialogs__tabs-content {
                min-height: 345px;

                .reply-text__area {
                    position: relative;

                    ::v-deep .v-textarea textarea {
                        margin-top: 30px;
                    }
                    .reply-text__area--tools {
                        position: absolute;
                        right: 5px;
                        top: 5px;

                        ::v-deep .v-btn.v-btn--icon {
                            height: 32px;
                            width: 32px;
                            margin: 0;

                            &.theme--dark .v-icon {
                                color: #7a7a7a !important;
                            }
                            &:hover::before {
                                background-color: currentColor;
                                opacity: .2;
                            }
                            &.paperclip {
                                transform: rotateZ(30deg);
                            }
                            .v-icon {
                                font-size: 1rem;
                            }
                        }
                    }
                }
                .reply-filter {
                    position: relative;

                    ::v-deep .v-input.v-text-field {
                        .v-input__slot {
                            fieldset {
                                border: 2px solid;
                            }
                            &:hover {
                                fieldset {
                                    color: #7a7a7a;
                                }
                            }
                            &:before {
                                border: none;
                            }
                            &:after {
                                border: none;
                            }
                        }
                    }
                    ::v-deep .v-chip {
                        user-select: none;
                    }
                    .legend {
                        position: absolute;
                        left: 15px;
                        top: -12px;

                        padding: 0 5px;
                        background-color: #fff;
                        user-select: none;
                        z-index: 1;
                    }
                }
            }
        }
        &.theme--dark .chatbot-dialogs__tabs {
            background-color: #1e1e1e;

            .chatbot-dialogs__tabs-content {
                .reply-text__area .reply-text__area--tools {
                    ::v-deep .v-btn.v-btn--icon:hover::before {
                        opacity: .7;
                    }
                }
                .reply-filter {
                    color: #7a7a7a;

                    .legend {
                        background-color: #1e1e1e;
                    }
                }
            }
        }
    }
</style>
