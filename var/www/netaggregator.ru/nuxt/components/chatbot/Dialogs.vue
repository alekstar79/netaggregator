<template>
    <v-layout justify-center fill-height key="chatbot-dialogs">
        <material-card
            class="module chatbot-module dialogs"
            :class="{ empty }"
            :refresh="refresh"
            :color="color"
            elevation="2"
            offset="12"
            full-width
            ref="card"
        >
            <template #header>
                <v-layout class="chatbot-header" :class="themeClasses" :justify-space-between="!mobile || !(idx || editor)" :justify-end="mobile && (idx || editor)" wrap>
                    <lazy-core-hint v-if="!mobile || !idx" :hint="{ entity: 'chatbot', id: 0 }" class="chatbot-header__title pa-3">
                        {{ idx ? title || 'No name' : $t('chatbot.dialogue') }}
                    </lazy-core-hint>

                    <div v-if="editor" class="chatbot-header__controls justify-end">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="attach = 'attachment'" :disabled="!user" aria-label="attach" icon>
                                    <v-icon class="paperclip" dense>mdi-paperclip</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.attachments') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="attach = 'keyboard'" :disabled="!user" aria-label="keyboard" icon>
                                    <v-icon dense>mdi-keyboard-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.keyboard') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="reload({ local: true })" :disabled="!user" aria-label="reload" icon>
                                    <v-icon dense>mdi-sync</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.reload') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="save" :disabled="!user" aria-label="save" icon>
                                    <v-icon dense>mdi-content-save-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.save') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="deleteQuestion" :disabled="!user" aria-label="delete" icon>
                                    <v-icon dense>mdi-trash-can-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.delete') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="editor = null" aria-label="return" icon>
                                    <helper-return :fill="fill" />
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.return') }}</span>
                        </v-tooltip>
                    </div>
                    <div v-else-if="idx" class="chatbot-header__controls justify-end">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="fold = !fold" :disabled="!user" aria-label="fold" icon>
                                    <v-icon dense>{{ fold ? 'mdi-unfold-more-horizontal' : 'mdi-unfold-less-horizontal' }}</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t(`tooltip.${fold ? 'unfold' : 'fold'}`) }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="reload({ local: true })" :disabled="!user" aria-label="reload" icon>
                                    <v-icon dense>mdi-sync</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.reload') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="saveDialog = true" :disabled="!user" aria-label="save" icon>
                                    <v-icon dense>mdi-content-save-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.save') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="smalltalk = !smalltalk" :disabled="!user" aria-label="smalltalk" icon>
                                    <v-icon dense>{{ smalltalk ? 'mdi-chat-minus-outline' : 'mdi-chat-plus-outline' }}</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t(`tooltip.${smalltalk ? 'smalltalk_on' : 'smalltalk_off'}`) }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="settings = true" :disabled="!user" aria-label="settings" icon>
                                    <v-icon dense>mdi-cog</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.settings') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="idx = null" aria-label="return" icon>
                                    <helper-return :fill="fill" />
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.return') }}</span>
                        </v-tooltip>
                    </div>
                    <div v-else class="chatbot-header__controls justify-end">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="reload({})" :disabled="!user" aria-label="reload" icon>
                                    <v-icon dense>mdi-sync</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.reload') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="save" :disabled="!user" aria-label="save" icon>
                                    <v-icon dense>mdi-content-save-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.save') }}</span>
                        </v-tooltip>
                    </div>
                </v-layout>
            </template>

            <v-layout class="dialogs__pane"
                :class="{ ...themeClasses, empty: !$store.state.chatbot.list.length }"
                :align-center="!$store.state.chatbot.list.length"
                :fill-height="!$store.state.chatbot.list.length"
                :column="!$store.state.chatbot.list.length"
                :key="refresh"
                justify-center
            >
                <lazy-chatbot-question-editor v-if="editor" v-model="attach" @update="$listeners.update" @save="save" />
                <lazy-chatbot-dialog-editor v-else-if="idx" :fold="fold" @update="$listeners.update" />
                <lazy-chatbot-dialogs-list v-else-if="user" />

                <v-list v-else>
                    <v-list-item :ripple="false">
                        <v-list-item-title class="text-center disabled--text">
                            {{ $t('common.needed') }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-layout>
        </material-card>

        <v-dialog v-model="saveDialog" :fullscreen="mobile" :max-width="mobile ? '100%' : '320px'">
            <div class="chatbot-save__dialog" :class="{ ...themeClasses }">
                <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

                <template v-if="mobile && $store.state.app.vkapp">
                    <v-layout class="chatbot-save__btn-wrapper" justify-start>
                        <v-btn @click="saveDialog = false" aria-label="close" icon>
                            <v-icon color="#aaa" dense>mdi-close</v-icon>
                        </v-btn>
                    </v-layout>
                </template>
                <template v-else>
                    <v-tabs class="chatbot-save__tabs-header" :color="color" height="60px" hide-slider grow>
                        <v-tab @click="saveDialog = false" :ripple="false">
                            {{ $t('tooltip.actions') }}
                        </v-tab>
                    </v-tabs>
                </template>

                <div class="chatbot-save__tabs-content" :class="{ mobile }">
                    <v-layout justify-center column>
                        <v-list class="chatbot-save-list">
                            <v-list-item @click="save" :ripple="false">
                                <v-list-item-title class="text-center">
                                    {{ $t('tooltip.save') }}
                                </v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="exportDialog" :ripple="false">
                                <v-list-item-title class="text-center">
                                    {{ $t('tooltip.export') }}
                                </v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="importDialog" :ripple="false">
                                <v-list-item-title class="text-center">
                                    {{ $t('tooltip.import') }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-layout>
                </div>
            </div>
        </v-dialog>

        <v-dialog v-model="settings" :fullscreen="mobile" :max-width="mobile ? '100%' : '540px'">
            <lazy-chatbot-settings @close="settings = false" />
        </v-dialog>
    </v-layout>
</template>

<script>
    import { rndstring } from '~/utils/common/symbols.mjs'
    import { openFile } from '~/utils/common/open.mjs'
    import { error, success } from '~/utils/chatbot'
    import { zoomPan } from '~/utils/renderer.mjs'

    import saveAs from 'file-saver'

    const invalidFormat = { content: 'Invalid file format', color: 'error', raw: true },
        parseError = { content: 'graph.parsing_error', color: 'error' }

    export default {
        computed: {
            smalltalk: {
                get() {
                    let { list = [], idx = null } = this.$store.state.chatbot,
                        smalltalk = false

                    if (list.length && idx !== null) {
                        smalltalk = list[idx].smalltalk
                    }

                    return smalltalk
                },
                set(smalltalk) {
                    this.$store.commit('chatbot/setSmallTalk', { smalltalk })
                }
            },
            editor: {
                get() {
                    return this.$store.state.chatbot.id !== null
                },
                set(id) {
                    this.$store.commit('chatbot/set', { id })
                }
            },
            idx: {
                get() {
                    return this.$store.state.chatbot.idx !== null
                },
                set(idx) {
                    this.$store.commit('chatbot/set', { idx })
                }
            },
            empty() {
                return !this.user || !this.$store.state.chatbot.list.length || (this.idx && !this.tree.length)
            },
            title() {
                let { list = [], idx = null } = this.$store.state.chatbot,
                    dialog = { name: '' }

                if (list.length && idx !== null) {
                    dialog = list[idx] || { name: '' }
                }

                return !this.mobile ? dialog.name : ''
            },
            themeClasses() {
                return { [`theme--${this.$vuetify.theme.dark ? 'dark' : 'light'}`]: true }
            },
            fill() {
                return this.$vuetify.theme.dark ? '#8f8f8f' : '#fff'
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
        data() {
            return {
                discard: () => {},
                tree: this.getTree(),
                refresh: rndstring(),
                saveDialog: false,
                settings: false,
                fold: true,
                attach: ''
            }
        },
        watch: {
            '$store.state.chatbot.list': {
                handler: 'update',
                deep: true
            }
        },
        methods: {
            refreshWindow()
            {
                this.refresh = rndstring()

                this.$forceUpdate()
                this.update()
            },
            setDialog({ target })
            {
                try {

                    this.$store.commit('chatbot/setDialog', JSON.parse(target.result.toString()))

                    setTimeout(this.refreshWindow.bind(this), 7)

                } catch (e) {
                    this.$bus.$emit('snack', parseError)
                }
            },
            requestImport(file)
            {
                const { list = [], idx = null } = this.$store.state.chatbot

                if (!list.length || idx === null) return

                if (!file.type.match('application/json')) {
                    return this.$bus.$emit('snack', invalidFormat)
                }

                const r = new FileReader()

                r.onerror = () => this.$bus.$emit('snack', parseError)
                r.onload = this.setDialog.bind(this)

                r.readAsText(file)
            },
            importDialog()
            {
                openFile('application/json').then(this.requestImport)

                this.saveDialog = false
            },
            exportDialog()
            {
                const { list = [], idx = null } = this.$store.state.chatbot,
                    type = 'application/json;charset=utf-8'

                if (!list.length || idx === null) return

                try {

                    saveAs(new Blob([JSON.stringify(list[idx])], { type }), rndstring() + '.json')

                } catch (e) {
                    this.$bus.$emit('snack', {
                        content: 'graph.converting_error',
                        color: 'error'
                    })
                }

                this.saveDialog = false
            },
            async save()
            {
                try {

                    const { set } = await this.$store.dispatch('chatbot/save')

                    this.$bus.$emit('snack', set ? success('chatbot.saved') : error())

                } catch (e) {
                    this.$bus.$emit('snack', {
                        content: e.message,
                        color: 'error',
                        raw: true
                    })
                }

                this.saveDialog = false
            },
            deleteQuestion()
            {
                this.$store.commit('chatbot/deleteQuestion')
            },
            createQuestion()
            {
                this.$store.commit('chatbot/createQuestion')
            },
            reload(p)
            {
                this.$store.dispatch('chatbot/chatsLoad', p)
            },
            getTree()
            {
                const { list = [], idx = null } = this.$store.state.chatbot

                if (list.length && idx !== null) {
                    return JSON.parse(JSON.stringify((list[idx] || {}).dialogs || []))
                }

                return []
            },
            update()
            {
                this.tree = this.getTree()

                this.$emit('update')
            },
            exit()
            {
                this.editor = this.idx = null
            }
        },
        beforeDestroy()
        {
            this.discard()
        },
        mounted()
        {
            this.$bus.$on('settings:reload', this.exit.bind(this))

            this.$emit('update')

            this.$nextTick(() => { try {
                this.discard = zoomPan(this.$refs.card.$el)
            } catch (e) {
            } })
        }
    }
</script>

<style lang="scss" scoped>
    .chatbot-module {
        .chatbot-header {
            align-items: center;
            min-height: 55px;

            .chatbot-header__title {
                font-size: 16px;

                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;

                ::v-deep .v-avatar {
                    margin-right: 5px;
                }
            }
            .chatbot-header__controls {
                display: flex;
                flex-wrap: wrap;
                font-weight: 500;
                padding: 0 7px;

                ::v-deep .v-btn {
                    &:hover::before {
                        background-color: currentColor;
                        opacity: .3;
                    }
                    &.v-btn--icon, &.v-btn--text {
                        min-width: unset;
                        height: 41px;
                        width: 41px;
                        margin: 0;

                        font-size: 20px;

                        .v-icon {
                            font-size: 20px;
                        }
                    }
                }
            }
            &.theme--dark {
                color: #8f8f8f;

                ::v-deep .v-btn.v-btn--icon {
                    color: #8f8f8f;
                }
            }
        }
        .dialogs__pane {
            &.theme--dark {
                .v-list .v-list-item .v-list-item__title {
                    color: #7a7a7a !important;
                }
            }
            &.empty {
                width: 100%;
                max-height: 90px;
            }
        }
        ::v-deep .v-btn:hover::before {
            background-color: currentColor;
        }
    }
    .chatbot-save__dialog {
        background-color: #fff;

        .chatbot-save__tabs-header {
            border-bottom: 1px solid #e3e4e8;
        }
        .chatbot-save__tabs-content {
            margin: 0 10px;
        }
        &.theme--dark {
            background-color: #1e1e1e;

            .chatbot-save__tabs-header {
                border-bottom: 1px solid #424242;
            }
            .chatbot-save__tabs-content {
                .v-list-item .v-list-item__title {
                    color: #7a7a7a;
                }
            }
        }
    }
</style>
