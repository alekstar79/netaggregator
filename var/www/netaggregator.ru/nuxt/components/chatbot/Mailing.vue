<template>
    <v-layout justify-center fill-height key="chatbot-mailing">
        <material-card class="module chatbot-module mailing"
            :class="{ empty: !user || !groups.length }"
            :full-width="true"
            :color="color"
            :elevation="2"
            offset="12"
            ref="card"
        >
            <template #header>
                <v-layout class="chatbot-header" :class="themeClasses" justify-space-between>
                    <div v-if="gid && group" class="chatbot-header__title pa-3">
                        <v-badge offset-x="35" offset-y="8" :color="paid ? 'success' : 'error'" light bordered dot>
                            <v-avatar size="32px">
                                <v-img :src="group.photo_50 || group.photo_100 || group.photo_200" />
                            </v-avatar>
                        </v-badge>

                        <template v-if="!mobile">
                            {{ group.name | spoof(_self) }}
                        </template>
                    </div>
                    <lazy-core-hint v-else :hint="{ entity: 'chatbot', id: 1 }" class="chatbot-header__title pa-3">
                        {{ $t('context.mailing') }}
                    </lazy-core-hint>

                    <div v-if="gid" class="chatbot-header__controls justify-end">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="importSubscribers" :disabled="!user" aria-label="import" icon>
                                    <v-icon dense>mdi-file-replace-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.import') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="saver = true" :disabled="!user" aria-label="save" icon>
                                    <v-icon dense>mdi-content-save-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.save') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="openTemplatesList" :disabled="!user" aria-label="open" icon>
                                    <v-icon dense>mdi-folder-open-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.templates') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="gid = null" aria-label="return" icon>
                                    <helper-return :fill="fill" />
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.return') }}</span>
                        </v-tooltip>
                    </div>
                </v-layout>
            </template>

            <v-layout
                :class="{ detailed: gid, ...themeClasses, mobile }"
                class="mailing__pane"
                justify-center
                column
            >
                <template v-if="!user">
                    <v-list>
                        <v-list-item :ripple="false">
                            <v-list-item-title class="text-center disabled--text">
                                {{ $t('common.needed') }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </template>
                <template v-else-if="gid">
                    <v-flex xs12>
                        <div class="mailing__pane-list pt-3">
                            <div class="list-builder" :class="themeClasses">
                                <div class="legend">{{ $t('common.list') }}</div>

                                <div v-if="!handled" class="justify-center">
                                    <helper-loader-btn @click="buildList" :progress="progress === 'build'" text>
                                        {{ $t('common.build') }}
                                    </helper-loader-btn>
                                </div>
                                <div v-else class="mutable">
                                    <p class="mailing-name">
                                        {{ $t('chatbot.list_name') }} (
                                            <!--suppress JSIncompatibleTypesComparison -->
                                            <span>{{ progress === 'build' ? '?' : value.count | cup(gid) }}</span>
                                        )
                                    </p>

                                    <helper-loader-btn
                                        class="v-btn--simple large-screen"
                                        :progress="progress === 'build'"
                                        @click="buildList"
                                        icon
                                    >
                                        <v-icon>mdi-sync</v-icon>
                                    </helper-loader-btn>

                                    <helper-loader-btn
                                        class="v-btn--simple small-screen"
                                        :progress="progress === 'build'"
                                        @click="buildList"
                                        text
                                    >
                                        {{ $t('common.update') }}
                                    </helper-loader-btn>
                                </div>
                            </div>
                        </div>

                        <div class="mailing__pane-filter pt-4">
                            <lazy-chatbot-filters-wrap v-model="filter" @update="$listeners.update" :gid="gid" />
                        </div>

                        <div class="mailing__pane-textarea pt-3">
                            <v-textarea v-model="message"
                                :label="$t('chatbot.message')"
                                :color="color"
                                ref="textarea"
                                hide-details
                                auto-grow
                                rows="3"
                                filled
                            />

                            <div class="mailing__pane-textarea--tools">
                                <template v-for="t in tools">
                                    <v-btn @click.stop="t.handler($event, t)"
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
                                </template>
                            </div>
                        </div>

                        <v-flex v-if="value.attachments && value.attachments.length" class="mailing__pane-attachments" xs12>
                            <lazy-chatbot-viewer v-model="value" @update="$listeners.update" />
                        </v-flex>
                    </v-flex>
                </template>
                <template v-else-if="groups.length">
                    <template v-for="item in groups">
                        <v-flex @click="choose(item)" class="group-list-item" :key="item.id" d-flex>
                            <v-badge offset-x="59" offset-y="13" :color="item.paid.chatbot ? 'success' : 'error'" dot>
                                <v-list-item-avatar :key="item.id">
                                    <v-img :src="item.photo_200 || item.photo_100 || item.photo_50" />
                                </v-list-item-avatar>
                            </v-badge>

                            <h3 :class="`${item.id} ${item.token ? color : 'disabled'}--text`">
                                {{ item.name | spoof(_self) }}
                            </h3>
                        </v-flex>
                    </template>
                </template>
                <template v-else>
                    <v-list>
                        <v-list-item :ripple="false">
                            <v-list-item-title class="text-center disabled--text">
                                {{ $t('common.nocommunity') }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </template>
            </v-layout>

            <template v-if="gid && user" #actions>
                <v-layout :class="{ mobile }" justify-center>
                    <v-btn class="shadowless" @click.stop="startMailing" :disabled="!paid || !handled || !!progress" :color="color" aria-label="start">
                        {{ $t('common.start') }} (<span>{{ (filters.length ? value.filtered : value.count) | cup(gid) }}</span>)
                    </v-btn>

                    <v-btn class="shadowless"
                        @click="setShedule"
                        :disabled="!paid || !handled || !!progress"
                        :color="color"
                        aria-label="shedule"
                    >
                        <input :class="datetime ? 'normal' : 'short'"
                            :placeholder="$t('chatbot.schedule')"
                            :value="rtrim(datetime, ':')"
                            class="mx-input"
                            aria-label=""
                            name="date"
                            type="text"
                        >

                        <v-icon v-if="datetime" @click.stop="clearShedule" dense right>
                            mdi-close
                        </v-icon>
                        <v-icon v-else dense right>
                            mdi-clock-outline
                        </v-icon>
                    </v-btn>
                </v-layout>
            </template>
        </material-card>

        <v-dialog v-model="auth" :max-width="mobile ? '100%' : '400px'" :fullscreen="mobile">
            <lazy-core-vk-transition v-if="group" :group="group" :action="transition" @close="auth = false" />
        </v-dialog>

        <v-dialog v-model="dialogKeyboard" :max-width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <lazy-chatbot-keyboard v-model="value" @close="dialogKeyboard = false" @save="saveKeyboard" />
        </v-dialog>

        <v-dialog v-model="dialogAttachment" :max-width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <lazy-chatbot-attachments v-model="value" :open="dialogAttachment" @close="dialogAttachment = false" />
        </v-dialog>

        <v-dialog v-model="saver" :max-width="mobile ? '100%' : '420px'" :fullscreen="mobile">
            <div class="d-flex chatbot-mailing__saver" :class="{ fullscreen: mobile, ...themeClasses }">
                <v-system-bar v-if="mobile && $store.state.app.vkapp" color="transparent" height="26px" />

                <template v-if="mobile && $store.state.app.vkapp">
                    <div class="d-flex saver-dialogs__btn-wrapper justify-start">
                        <v-btn @click="saver = false" aria-label="close" icon>
                            <v-icon dense>mdi-window-close</v-icon>
                        </v-btn>
                        <v-btn @click="saveTemplate" aria-label="check" icon>
                            <v-icon dense>mdi-check</v-icon>
                        </v-btn>
                    </div>
                </template>
                <template v-else>
                    <div class="saver-dialogs__tabs-header">
                        <v-tabs :color="color" height="60px" hide-slider grow>
                            <v-tab @click="saver = false" :ripple="false">
                                <v-icon :color="color" dense>mdi-window-close</v-icon>
                            </v-tab>
                            <v-tab @click="saveTemplate" :ripple="false">
                                <v-icon :color="color" dense>mdi-check</v-icon>
                            </v-tab>
                        </v-tabs>
                    </div>
                </template>

                <v-card class="saver-content scroller" tile>
                    <v-card-text>
                        <v-text-field
                            v-model="name"
                            :label="$t('chatbot.template_name')"
                            :error-messages="errorMsg"
                            :error="lengthError"
                            :color="color"
                            hide-details
                            outlined
                        />
                    </v-card-text>
                </v-card>
            </div>
        </v-dialog>

        <v-dialog v-model="templater" :max-width="mobile ? '100%' : '500px'" :fullscreen="mobile">
            <div class="d-flex chatbot-mailing__templater" :class="{ fullscreen: mobile, ...themeClasses }">
                <v-system-bar v-if="mobile && $store.state.app.vkapp" color="transparent" height="26px" />

                <template v-if="mobile && $store.state.app.vkapp">
                    <div class="d-flex templater-dialogs__btn-wrapper justify-start">
                        <v-btn @click="templater = false" aria-label="close" icon>
                            <v-icon>mdi-window-close</v-icon>
                        </v-btn>
                    </div>
                </template>
                <template v-else-if="mobile">
                    <div class="templater-dialogs__tabs-header">
                        <v-tabs :color="color" height="60px" hide-slider grow>
                            <v-tab @click="templater = false" :ripple="false">
                                <v-icon :color="color">mdi-keyboard-backspace</v-icon>
                            </v-tab>
                        </v-tabs>
                    </div>
                </template>
                <template v-else>
                    <div class="dialog__bar">
                        {{ $t('chatbot.templates') }}
                    </div>
                </template>

                <v-card class="templater-content scroller" tile>
                    <v-list v-if="templates.length">
                        <template v-for="tmpl in templates">
                            <v-list-item @click="setTemplate(tmpl)" :ripple="false" :key="tmpl._id">
                                <v-list-item-title :class="`${color}--text`">
                                    {{ tmpl.name }}
                                </v-list-item-title>

                                <v-btn @click.stop="removeTemplate(tmpl)" :color="color" icon>
                                    <v-icon dense>mdi-trash-can-outline</v-icon>
                                </v-btn>
                            </v-list-item>
                        </template>
                    </v-list>
                    <div v-else class="text-center disabled--text">
                        <p>{{ $t('chatbot.tmpl_empty') }}</p>
                    </div>
                </v-card>
            </div>
        </v-dialog>

        <v-dialog v-model="shedule" :max-width="mobile ? '100%' : '320px'" :fullscreen="mobile">
            <div class="d-flex chatbot-mailing__sheduler" :class="{ fullscreen: mobile, ...themeClasses }">
                <v-system-bar v-if="mobile && $store.state.app.vkapp" color="transparent" height="26px" />

                <template v-if="mobile && $store.state.app.vkapp">
                    <v-layout class="datepicker-dialogs__btn-wrapper" justify-start>
                        <v-btn @click="cancelShedule" aria-label="close" icon>
                            <v-icon>mdi-window-close</v-icon>
                        </v-btn>
                        <v-btn @click="confirmShedule()" aria-label="checj" icon>
                            <v-icon>mdi-check</v-icon>
                        </v-btn>
                    </v-layout>
                </template>
                <template v-else>
                    <v-tabs class="datepicker-dialogs__tabs-header" :color="color" height="60px" hide-slider grow>
                        <v-tab @click="cancelShedule" :ripple="false">
                            <v-icon :color="color">mdi-window-close</v-icon>
                        </v-tab>
                        <v-tab @click="confirmShedule()" :ripple="false">
                            <v-icon :color="color">mdi-check</v-icon>
                        </v-tab>
                    </v-tabs>
                </template>

                <date-picker
                    v-bind="datePickerOptions"
                    class="mailing-datepicker"
                    v-model="timestamp"
                    inline
                    :class="{
                        [`${color}--color`]: true,
                        fullscreen: mobile,
                        ...themeClasses
                    }"
                />
            </div>
        </v-dialog>
    </v-layout>
</template>

<script>
    import { community, error } from '~/mixins/common'
    import insert from '~/mixins/chatbot/insert'

    import { rtrim } from '~/utils/common/is-string.mjs'
    import { openFile } from '~/utils/common/open.mjs'
    import { spoof } from '~/utils/common/spoof.mjs'

    import { zoomPan } from '~/utils/renderer.mjs'
    import { Throttle } from '~/utils/throttle'
    import { mongoId } from '~/utils/chatbot'

    /**
    * @see https://github.com/mengxiong10/vue2-datepicker
    */
    import DatePicker from 'vue2-datepicker'
    import 'vue2-datepicker/scss/index.scss'
    import 'vue2-datepicker/locale/ru'

    const keys = { _id: null, handled: false, progress: '', attachments: [], keyboard: {}, text: '', filtered: 0, filters: {}, count: 0 },
        transition = { route: 'chatbot', entity: 'mailing', action: 'setCommunityToken', params: null },

        filter = o => Object.keys(keys).reduce((a, k) => ({ ...a, [k]: o[k] || keys[k] }), {}),
        throttle = Throttle.create(),

        run = throttle.run.bind(throttle),
        set = throttle.set.bind(throttle),

        store = { text: null }

    export default {
        mixins: [error, community, insert],

        components: {
            DatePicker
        },
        filters: {
            spoof,

            cup(count, gid)
            {
                return gid === 147718403 && count < 216 ? 216 : count
            }
        },
        computed: {
            value: {
                set(v) {
                    this.$store.commit('chatbot/setMailing', Object.assign(v, { gid: this.gid }))
                },
                get() {
                    return filter(this.mailing || {})
                }
            },
            message: {
                get() {
                    return this.mailing?.text || ''
                },
                set(v) {
                    this.mailing.text = v
                }
            },
            group() {
                return this.groups.find(g => g.id === (this.gid || this.xid))
            },
            mailing() {
                return this.$store.state.chatbot.mailings.find(g => g.gid === this.gid)
            },
            filters() {
                return Object.keys(this.value?.filters || []).map(text => ({
                    value: this.value.filters[text],
                    text
                }))
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            progress() {
                return this.value.progress
            },
            handled() {
                return this.value.handled
            },
            fill() {
                return this.$vuetify.theme.dark ? '#7a7a7a' : '#f5f5f5'
            },
            themeClasses() {
                return { [`theme--${this.$vuetify.theme.dark ? 'dark' : 'light'}`]: true }
            },
            color() {
                return this.$store.state.app.color
            },
            user() {
                return this.$store.state.app.user
            },
            tools() {
                const set = /** @type {{ claz: string, icon: string, handler: function }[]} */ [
                    { claz: 'filter',    icon: 'mdi-filter-outline',   handler: () => this.filter = true           },
                    { claz: 'paperclip', icon: 'mdi-paperclip',        handler: () => this.dialogAttachment = true },
                    { claz: 'keyboard',  icon: 'mdi-keyboard-outline', handler: () => this.dialogKeyboard = true   }
                ]

                if (!this.mobile) {
                    set.unshift({ claz: 'emoticon', icon: 'mdi-emoticon-happy-outline', handler: this.append })
                }

                return set
            }
        },
        watch: {
            'mailing.attachments': 'attach',
            'mailing.text': run,

            'mailing.shedule'(v) {
                if ('time' in (v || {})) {
                    this.datetime = (new Date(v.time)).toLocaleString('ru')
                    return
                }

                this.datetime = null
            },
            gid(gid) {
                this.gidResolver(gid).then(() => this.$emit('update'))
            },
            group(v) {
                this.paid = !!v?.paid.chatbot
            },
            templateName(v)
            {
                if (v.length >= 3) {
                    this.lengthError = false
                    this.errorMsg = ''
                }
            }
        },
        data: () => ({
            discard: () => {},

            timestamp: null,
            datetime: null,

            xid: null,
            gid: null,

            dialogAttachment: false,
            dialogKeyboard: false,
            isIntersecting: false,

            templater: false,
            saver: false,

            shedule: false,
            filter: false,
            auth: false,
            paid: false,

            templates: [],
            name: '',

            lengthError: false,
            errorMsg: '',

            datePickerOptions: {
                timeTitleFormat: 'DD-MM-YYYY HH:mm',
                titleFormat: 'DD-MM-YYYY HH:mm',
                format: 'DD-MM-YYYY HH:mm',
                valueType: 'timestamp',
                type: 'datetime',
                open: true
            }
        }),
        methods: {
            rtrim,

            gidResolver(gid)
            {
                return gid && !this.mailing
                    ? this.$store.dispatch('chatbot/mailingState', { gid })
                    : Promise.resolve()
            },
            templatesResolver()
            {
                const mod = a => a.map(t => ({ ...t, _id: t._id.$oid || t._id })),
                    push = templates => this.templates.push(...templates),
                    uid = this.user.id

                return !this.templates.length
                    ? this.$axios.$post('/get/templates', { uid }).then(mod).then(push)
                    : Promise.resolve()
            },
            transition()
            {
                this.$ls.set('doit', transition)
            },
            choose({ id, token })
            {
                switch (true) {
                    case !!token:
                        this.gid = id
                        break
                    case !!this.vkapp:
                        this.setCommunityToken(id)
                        break

                    default:
                        this.xid = transition.params = id
                        this.auth = true
                }
            },
            attach(attachments)
            {
                attachments || (attachments = [])

                this.gid && this.$store.commit('chatbot/send', { action: 'attach', type: 'mailing', gid: this.gid, attachments })

                this.$emit('update')
            },
            importSubscribers()
            {
                this.gid && openFile('text/plain, text/csv').then(this.requestImport)
            },
            async requestImport(file)
            {
                if (!file.type.match('text/(plain|csv)')) {
                    return this.$bus.$emit('snack', { content: 'Invalid image format', color: 'error', raw: true })
                }

                const fd = new FormData()

                fd.append('uid', this.user.id)
                fd.append('gid', this.gid)
                fd.append('data', file)

                this.value = { progress: 'build' }
                this.$bus.$emit('snack', { content: 'chatbot.importing', color: 'success' })

                await this.$axios.post('/import/subscribers', fd)
                // await this.$store.dispatch('chatbot/mailingState', { gid: this.gid })
                // this.$bus.$emit('snack', { content: 'chatbot.done', color: 'success' })
                // this.value = { progress: '' }
            },
            buildList()
            {
                this.gid && this.$store.commit('chatbot/send', { action: 'build', type: 'mailing', gid: this.gid })
            },
            startMailing()
            {
                this.paid && this.gid && this.$store.commit('chatbot/send', { action: 'start', type: 'mailing', gid: this.gid })
            },
            setShedule()
            {
                if (!this.paid) return

                if (this.mobile && this.datetime) {
                    return this.clearShedule()
                }

                this.shedule = !this.shedule
            },
            confirmShedule(time)
            {
                time || (time = this.timestamp)

                if (!this.paid || time <= +new Date()) return

                this.shedule = false
                this.$store.commit('chatbot/setShedule', { gid: this.gid, time })
                this.$store.commit('chatbot/send', {
                    action: 'defer',
                    type: 'mailing',
                    gid: this.gid,
                    time
                })
            },
            cancelShedule()
            {
                this.timestamp = null
                this.shedule = false
            },
            clearShedule()
            {
                this.$store.commit('chatbot/setShedule', { gid: this.gid })
                this.$store.commit('chatbot/send', {
                    action: 'clear',
                    type: 'mailing',
                    gid: this.gid
                })
            },
            openTemplatesList()
            {
                this.templatesResolver().then(() => { this.templater = true })
            },
            saveKeyboard(keyboard)
            {
                this.$store.commit('chatbot/setKeyboard', { gid: this.gid, keyboard })
                this.$store.commit('chatbot/send', {
                    action: 'keyboard',
                    type: 'mailing',
                    gid: this.gid,
                    keyboard
                })
            },
            saveTemplate()
            {
                if (this.name.length < 3) {
                    this.errorMsg = this.$t('chatbot.length_error')
                    this.lengthError = true
                    return
                }

                const template = { _id: mongoId(), name: this.name, ...filter(this.value) },
                    push = c => c || this.templates.push(template),
                    uid = this.user.id

                this.$axios.$post('/save/template', { uid, template })
                    .then(this.templatesResolver)
                    .then(push)

                this.saver = false
                this.name = ''
            },
            removeTemplate({ _id })
            {
                this.$axios.$post('/remove/template', { uid: this.user.id, _id })
                    .then(({ remove } = {}) => {
                        if (!remove) return

                        this.templates = this.templates.filter(t => t._id !== _id)
                    })
            },
            setTemplate(tmpl)
            {
                this.value = { gid: this.gid, ...tmpl }

                this.templater = false
            },
            save(text)
            {
                if (!this.gid) return

                if (store.text === null || store.text === text) {
                    store.text = text
                    return
                }

                store.text = text

                this.$store.commit('chatbot/send', {
                    action: 'save',
                    type: 'mailing',
                    gid: this.gid,
                    text
                })
            },
            exit()
            {
                this.xid = null
                this.gid = null
            }
        },
        beforeDestroy()
        {
            this.discard()
        },
        beforeMount()
        {
            this.$bus.$on('settings:reload', this.exit.bind(this))
        },
        async mounted()
        {
            const doit = await this.$ls.get('doit')

            if (doit && doit.action) {
                this[doit.action](doit.params)
                this.$ls.set('doit', null)
            }

            set(this.save.bind(this))

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
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                font-size: 16px;

                ::v-deep .v-avatar {
                    margin-right: 5px;
                }
            }
            .chatbot-header__controls {
                display: flex;
                flex-wrap: wrap;
                font-weight: 500;
                padding: 0 7px;

                ::v-deep .v-btn.v-btn--icon {
                    height: 41px;
                    width: 41px;
                    margin: 0;

                    &:hover::before {
                        background-color: currentColor;
                        opacity: .3;
                    }
                    .v-icon {
                        font-size: 20px;
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
        ::v-deep .layout.mailing__pane {
            &.detailed {
                padding: 0 !important;     //! padding: 5px 15px 0
            }

            .group-list-item {
                position: relative;
                align-items: center;
                cursor: pointer;

                will-change: opacify;

                &:before {
                    display: block;
                    content: '';

                    position: absolute;
                    left: 0;
                    top: 0;

                    height: 100%;
                    width: 100%;

                    padding: 0;
                    margin: 0;

                    background-color: currentColor;
                    opacity: 0;

                    transition: opacity .3s;
                }
                &:hover::before {
                    opacity: .1;
                }
            }
            .mailing__pane-attachments {
                padding: 10px 0;
            }
            .mailing__pane-list, .mailing__pane-filter {
                font-size: 16px !important;
            }
            .mailing__pane-list {
                p {
                    font-stretch: normal;
                    font-style: normal;

                    -webkit-font-smoothing: subpixel-antialiased;
                              -moz-osx-font-smoothing: grayscale;
                }
                .list-builder {
                    position: relative;
                    padding: 0 10px;

                    border: 2px solid rgba(0,0,0,.54);
                    border-radius: 5px;

                    transition: .3s cubic-bezier(.25,.8,.5,1);

                    .legend {
                        position: absolute;
                        left: 15px;
                        top: -12px;

                        padding: 0 5px;
                        background-color: #fff;
                        z-index: 1;
                    }
                    & > div {
                        display: flex;
                        align-items: center;
                        flex-direction: row;
                        flex-wrap: wrap;

                        padding: 0;
                        margin: 0;

                        &.mutable {
                            justify-content: space-between;
                        }
                        &.v-input.v-select {
                            padding: 4px;

                            &.secondary--color .v-icon.v-icon--link {
                                color: #1abc9c
                            }
                            &.accent--color .v-icon.v-icon--link {
                                color: #82b1ff
                            }
                            &.info--color .v-icon.v-icon--link {
                                color: #00d3ee
                            }
                        }
                        .mailing-name {
                            margin: 8px 5px;
                            font-size: 16px !important;
                            font-weight: 400;

                            span {
                                font-size: 15px;
                            }
                        }
                        .v-btn.v-btn--simple {
                            margin: 8px 2px;
                            cursor: pointer;

                            &:hover::before {
                                background-color: currentColor;
                            }
                            &.large-screen {
                                display: inline-flex;
                            }
                            &.small-screen {
                                display: none;
                            }
                        }
                    }
                }
                &:hover .list-builder {
                    border-color: rgba(0,0,0,.86);
                }
            }
            .mailing__pane-textarea {
                position: relative;

                .v-textarea textarea {
                    margin-top: 30px;
                }
                .mailing__pane-textarea--tools {
                    position: absolute;
                    right: 5px;
                    top: 15px;

                    .v-btn.v-btn--icon {
                        height: 32px;
                        width: 32px;
                        margin: 0;

                        &.theme--dark .v-icon {
                            color: #7a7a7a !important;
                        }
                        &:hover::before {
                            background-color: currentColor;
                            opacity: .7;
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
            &.theme--dark {
                .mailing__pane-list {
                    .list-builder {
                        border: 2px solid #424242;
                        color: #7a7a7a;

                        .legend {
                            background-color: #1e1e1e;
                        }
                        .v-btn.v-btn--icon {
                            color: #7a7a7a !important;
                        }
                    }
                    &:hover .list-builder {
                        border-color: #7a7a7a;
                    }
                }
                .v-list .v-list-item .v-list-item__title {
                    color: #7a7a7a !important;
                }
            }
            &.mobile .v-list-item__avatar {
                margin: 8px 16px 8px 0;
            }
        }
        ::v-deep .v-card__actions {
            padding: 0 16px 10px;                  //! padding: 0 0 10px

            .layout {
                flex-wrap: wrap;

                .shadowless {
                    margin: 10px;
                    font-size: 12px;

                    .v-btn__content .mx-input {
                        padding: unset;
                        height: unset;
                        width: unset;

                        line-height: unset;
                        font-size: unset;

                        border: none;
                        background-color: transparent;
                        box-shadow: unset;
                        cursor: pointer;
                        color: #fff;

                        &.normal {
                            width: 115px;
                        }
                        &.short {
                            width: 70px;
                        }
                        &::placeholder {
                            text-transform: uppercase;
                            font-size: 12px;
                            color: #fff;
                            opacity: 1;
                        }
                    }
                    .v-icon.v-icon--right {
                        margin-left: unset;
                        font-size: 1.2em;
                        z-index: 1;
                    }
                }
                &.mobile {
                    margin-bottom: 10px;
                }
            }
        }
    }
    .chatbot-mailing__saver, .chatbot-mailing__templater, .chatbot-mailing__sheduler {
        flex-direction: column;
        background-color: #fff;

        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .templater-content.scroller,
            .saver-content.scroller {
                max-height: calc(100vh - 86px);
            }
        }
        .templater-dialogs__tabs-header,
        .saver-dialogs__tabs-header {
            border-bottom: 1px solid #e3e4e8;
        }
        .dialog__bar {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 60px;

            border-bottom: 1px solid #e3e4e8;
            background-color: rgb(250,251,252);
            cursor: pointer;
        }
        .saver-content {
            box-shadow: none !important;
            border-radius: 0;

            ::v-deep .v-text-field > .v-input__control fieldset {
                border: 2px solid;
            }
        }
        .templater-content {
            box-shadow: none !important;
            border-radius: 0;

            max-height: 345px;
            min-height: 345px;
            margin: 10px;

            ::v-deep .v-btn:hover::before {
                background-color: currentColor;
                opacity: .2;
            }
            .disabled--text {
                padding: 79px 0;
            }
        }
        &.theme--dark {
            background-color: #1e1e1e;

            .datepicker-dialogs__tabs-header,
            .templater-dialogs__tabs-header,
            .saver-dialogs__tabs-header,
            .dialog__bar {
                background-color: #1e1e1e;
                border-color: #424242;
                color: #7a7a7a;

                .v-tabs-bar .v-tab .v-icon {
                    color: #7a7a7a !important;
                }
            }
            .datepicker-dialogs__btn-wrapper,
            .templater-dialogs__btn-wrapper,
            .saver-dialogs__btn-wrapper {
                background-color: #1e1e1e;
                color: #7a7a7a;
            }
            .templater-content {
                .v-list-item {
                    .v-list-item__title {
                        color: #7a7a7a !important;
                    }
                    ::v-deep .v-btn.v-btn--icon .v-icon {
                        color: #7a7a7a;
                    }
                }
            }
            ::v-deep .v-input.v-text-field {
                & >.v-input__control > .v-input__slot {
                    &:hover {
                        fieldset {
                            color: #7a7a7a !important;
                        }
                    }
                }
            }
        }
    }
    .datepicker-dialogs__btn-wrapper,
    .templater-dialogs__btn-wrapper,
    .saver-dialogs__btn-wrapper, {
        padding: 0 10px;

        ::v-deep .v-btn {
            margin: 0 5px;
        }
    }
    .datepicker-dialogs__tabs-header,
    .templater-dialogs__tabs-header,
    .saver-dialogs__tabs-header, {
        ::v-deep .v-tabs__div {
            transition: background-color .4s;

            &:hover {
                background-color: rgba(70,70,70,.1);
            }
        }
    }
    .datepicker-dialogs__tabs-header.theme--dark {
        border-bottom: 1px solid #424242;
    }
    .datepicker-dialogs__btn-wrapper {
        flex: 1 0 32px;
        width: 100%;
    }
    .mailing-datepicker {
        &.fullscreen {
            height: calc(100% - 70px);
            width: 100%;

            ::v-deep .mx-datepicker-main,
            ::v-deep .mx-datepicker-content,
            ::v-deep .mx-datepicker-body {
                height: 97%;

                & > div {
                    height: inherit;
                }
            }
        }
        ::v-deep .mx-datepicker-body {
            .mx-calendar-panel-date {
                height: 100%;
                width: unset;

                .mx-calendar-content {
                    height: 100%;

                    table tbody td.cell {
                        padding: 10px;

                        &.today {
                            background-color: #2a90e9;
                            color: white;
                        }
                    }
                }
            }
        }
        ::v-deep .mx-datepicker-footer {
            display: none;

            justify-content: center;

            .mx-datepicker-btn-confirm {
                position: relative;
                width: 100px;
                color: white;
                border: none;

                &:after {
                    content: '';
                    display: block;
                    height: 100%;
                    width: 100%;

                    position: absolute;
                    left: 0;
                    top: 0;

                    background-color: rgba(255,255,255,.2);
                    border-radius: inherit;
                    transition: opacity .3s;
                    opacity: 0;
                }
                &:hover:after {
                    opacity: 1;
                }
            }
        }
        &.theme--dark {
            ::v-deep .mx-datepicker-main,
            ::v-deep .mx-calendar-time {
                background-color: #1e1e1e;
                border: unset;
            }
        }
    }
    @media all and (max-width: 280px) {
        .chatbot-module .mailing__pane {
            .mailing__pane-list, .mailing__pane-filter {
                .list-builder .mutable {
                    flex-direction: column;
                    align-items: center;

                    ::v-deep .v-btn.v-btn--simple {
                        &.small-screen {
                            display: inline-flex;
                        }
                        &.large-screen {
                            display: none;
                        }
                    }
                }
            }
        }
    }
</style>
