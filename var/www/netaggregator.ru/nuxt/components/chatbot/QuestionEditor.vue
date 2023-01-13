<template>
    <v-flex class="dialog-editor__panel" key="chatbot-question-editor">
        <div v-if="user" class="dialog-editor__list">
            <div class="dialog-editor__list-item">
                <div class="list-item__row-top">
                    <div class="list-item__static">{{ $t('chatbot.rule') }}</div>

                    <v-select v-model="ruleType" :items="ruleTypes" :item-color="color" :color="color" hide-details dense>
                        <template #item="{ item }">
                            {{ $t(`chatbot.${item.text}`) }}
                        </template>

                        <template #selection="{ item }">
                            <span :class="`${color}--text`">
                                {{ $t(`chatbot.${item.text}`) }}
                            </span>
                        </template>
                    </v-select>
                </div>

                <div class="list-item__field keywords">
                    <v-combobox
                        v-model="question.keywords"
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
                </div>
            </div>

            <div class="dialog-editor__list-item">
                <div class="list-item__row-top">
                    <div class="list-item__static">{{ $t('chatbot.reply') }}</div>

                    <v-select v-model="replyType" :items="replyTypes" :item-color="color" :color="color" hide-details dense>
                        <template #item="{ item }">
                            {{ $t(`chatbot.${item.text}`) }}
                        </template>

                        <template #selection="{ item }">
                            <span :class="`${color}--text`">
                                {{ $t(`chatbot.${item.text}`) }}
                            </span>
                        </template>
                    </v-select>
                </div>

                <div class="list-item__field reply">
                    <v-combobox
                        v-monit="hide"
                        :value="question.reply"
                        :item-color="color"
                        :color="color"
                        @click:append="appendReply"
                        append-icon="mdi-plus-circle-outline"
                        class="chatbot-combobox"
                        ref="combobox"
                        disable-lookup
                        hide-details
                        outlined
                        multiple
                    >
                        <template #selection="data">
                            <v-chip class="v-chip--select-multi"
                                :key="JSON.stringify(data.index)"
                                :input-value="data.selected"
                                :disabled="data.disabled"
                                @click.stop="editReply(data)"
                                @click:close="removeReply(data)"
                                close
                                small
                            >
                                {{ data.item.text | cut }}
                            </v-chip>
                        </template>
                    </v-combobox>
                </div>
            </div>
        </div>
        <v-list-item v-else :ripple="false">
            <v-list-item-title class="disabled--text text-center">
                {{ $t('common.needed') }}
            </v-list-item-title>
        </v-list-item>

        <div v-if="question.attachments && question.attachments.length" class="dialog-editor__list-item">
            <lazy-chatbot-viewer v-model="question" @update="$listeners.update" />
        </div>

        <v-dialog v-model="dialogAttachment" :fullscreen="mobile" :max-width="mobile ? '100%' : '540px'">
            <lazy-chatbot-attachments v-model="proxy" :open="dialogAttachment" @close="$emit('change', '')" />
        </v-dialog>

        <v-dialog v-model="dialogKeyboard" :fullscreen="mobile" :max-width="mobile ? '100%' : '540px'">
            <lazy-chatbot-keyboard v-model="proxy" @close="$emit('change', '')" @save="saveKeyboard" />
        </v-dialog>

        <v-dialog v-model="dialogReply" :max-width="mobile ? '100%' : '540px'" :persistent="persistent" :fullscreen="mobile">
            <lazy-chatbot-reply
                :reply="edit"
                :show="dialogReply"
                :condition="!replyType.value"
                @update="$listeners.update"
                @apply="handleReply"
                @close="closeReply"
                @attach="attach"
            />
        </v-dialog>
    </v-flex>
</template>

<script>
    import { reply, find, insertToList, replaceList, removeFromList, ruleTypes, replyTypes } from '~/utils/chatbot'
    import { hide } from '~/mixins/common'

    export default {
        mixins: [hide],

        props: {
            dialog: {
                required: true,
                type: String
            }
        },
        model: {
            event: 'change',
            prop: 'dialog'
        },
        filters: {
            cut(text = '') {
                return text.length > 13 ? text.slice(0, 12) + '…' : text
            }
        },
        directives: {
            monit: {
                bind(el, { value: callback }) {
                    callback()
                }
            }
        },
        computed: {
            ruleType: {
                set(v) {
                    this.$store.commit('chatbot/edit', { field: 'exact', value: !!v })
                },
                get() {
                    return ruleTypes[Number(!this.question.exact)]
                }
            },
            replyType: {
                set(v) {
                    this.$store.commit('chatbot/edit', { field: 'random', value: !!v })
                },
                get() {
                    return replyTypes[Number(!this.question.random)]
                }
            },
            dialogAttachment: {
                set(v) {
                    this.$emit('change', v ? 'attachment' : '') // this.dialog = v ? 'attachment' : ''
                },
                get() {
                    return this.dialog === 'attachment'
                }
            },
            dialogKeyboard: {
                set(v) {
                    this.$emit('change', v ? 'keyboard' : '') // this.dialog = v ? 'keyboard' : ''
                },
                get() {
                    return this.dialog === 'keyboard'
                }
            },
            proxy: {
                get() {
                    return this.specified || this.question
                },
                set(value) {
                    if (this.specified) {
                        this.specified = value
                        return
                    }

                    this.$store.commit('chatbot/directSetById', value)

                    this.question = value
                }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            user() {
                return this.$store.state.app.user
            }
        },
        watch: {
            '$store.state.chatbot.dialog.show': 'persist',
            '$store.state.chatbot.emoji.show': 'persist',
            '$store.state.chatbot': {
                handler: 'update',
                deep: true
            },
            question: {
                deep: true,
                handler(v) {
                    this.proxy = v
                }
            },
            dialog(v) {
                if (v === '' && this.specified) {
                    this.edit = this.specified
                    this.dialogReply = true
                }
            },
            dialogReply(v) {
                v || this.reset()
            }
        },
        data() {
            const question = this.$store.getters['chatbot/question']

            return {
                dialogReply: false,
                persistent: false,
                editing: false,

                specified: null,
                edit: null,

                replyTypes,
                ruleTypes,
                question
            }
        },
        methods: {
            blur()
            {
                document.activeElement.blur()
            },
            getDialogs()
            {
                const { list, idx } = this.$store.state.chatbot

                return (list[idx] || {}).dialogs || []
            },
            persist(v)
            {
                this.persistent = v
            },
            reset()
            {
                if (!this.dialog) {
                    this.specified = null
                }

                this.edit = null
            },
            update()
            {
                let id, question = {}

                if ((id = this.$store.state.chatbot.id)) {
                    question = find(this.getDialogs(), id) || {}
                }

                this.question = question
            },
            appendReply()
            {
                this.edit = reply({}, (this.question.reply || []).length)

                this.dialogReply = true

                this.blur()
            },
            removeReply({ index })
            {
                this.question.reply = removeFromList(this.question.reply, index)

                this.blur()
            },
            handleReply(reply)
            {
                if (reply.text || reply.attachments?.length) {
                    this.question.reply = (this.editing ? replaceList : insertToList)(
                        this.question.reply, reply, reply.value
                    )
                }

                this.closeReply()
            },
            editReply({ item })
            {
                this.editing = true
                this.edit = item
                this.dialogReply = true

                this.blur()
            },
            attach({ dialog, value })
            {
                this.specified = value
                this.$emit('change', dialog) // this.dialog = dialog
                this.dialogReply = false

                this.blur()
            },
            saveKeyboard(keyboard)
            {
                this.proxy = { ...this.proxy, keyboard }

                this.$store.commit('chatbot/edit', {
                    field: 'keyboard',
                    value: keyboard
                })
            },
            closeReply()
            {
                this.reset()

                this.dialogReply = false
            }
        },
        mounted()
        {
            this.update()
        }
    }
</script>

<style lang="scss" scoped>
    .dialog-editor__panel {
        .dialog-editor__list .dialog-editor__list-item {
            padding: 10px;
            user-select: none;
            font-size: 14px;

            .list-item__row-top {
                display: flex;
                flex-direction: row;
                align-items: center;
                width: 100%;

                color: #7a7a7a;

                ::v-deep .v-input.v-text-field {
                    width: 50%;

                    .v-input__slot {
                        .v-select__selections span {
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            overflow: hidden;
                            max-width: 80%;
                        }
                        .v-input__append-inner .v-icon {
                            color: #7a7a7a;
                        }
                    }
                    &.theme--dark {
                        .v-input__slot .v-select__selections span {
                            color: #7a7a7a !important;
                        }
                    }
                }
                .list-item__static {
                    line-height: 32px;
                    padding: 0 5px 0 0;
                    flex: 0 auto;
                }
            }
            ::v-deep .v-input.v-text-field {
                padding-top: 0;
                margin-top: 0;
                font-size: 14px;
                flex: 1 auto;

                .v-input__control {
                    width: 100%;

                    .v-input__slot {
                        &:hover .v-input__append-inner .v-icon {
                            opacity: .6;
                        }
                        fieldset {
                            border: 2px solid;
                        }
                        &:before {
                            border: none;
                        }
                        &:after {
                            border: none;
                        }
                    }
                }
                &.theme--dark {
                    .v-input__control .v-input__slot:hover {
                        fieldset {
                            color: #7a7a7a;
                        }
                    }
                }
            }
            .list-item__field .chatbot-combobox {
                ::v-deep .v-input__control .v-input__slot {
                    input[type="text"] {
                        pointer-events: none;
                    }
                    .v-chip__content {
                        cursor: pointer;
                    }
                    .v-input__append-inner {
                        transition: opacity .5s;
                        opacity: 0;

                        .v-icon {
                            font-size: 18px;

                            &.theme--dark {
                                opacity: .6
                            }
                        }
                    }
                    &:hover .v-input__append-inner {
                        opacity: 1;
                    }
                }
            }
        }
    }
</style>
