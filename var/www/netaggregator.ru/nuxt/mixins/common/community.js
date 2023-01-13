import { error, preview } from '~/utils/widget'
import vk from '@vkontakte/vk-bridge'
import { mapState } from 'vuex'

const ADMIN_ONLY = 'Доступно только администраторам сообщества, попросите создателя выдать вам разрешения администратора или самостоятельно авторизовать приложение',
    UNEXPECTED_ERROR = 'Непредвиденная ошибка! Перезагрузите страничку и повторите попытку.',

    exclude = ['amount','uid','_id'],
    find = (gid, groups) => gid ? groups.find(g => g.id === +gid || g.value === +gid) : null,
    success = (content, raw) => ({ content, color: 'success', raw }),
    hydrate = g => ({ ...g, value: g.id, text: g.name }),

    getCommunityToken = 'VKWebAppGetCommunityToken',
    addToCommunity = 'VKWebAppAddToCommunity'

export default {
    data: () => ({ time: 0, tariff: false }),

    computed: {
        ...mapState('app', ['user','utoken','vkapp','color']),

        groups: {
            get() {
                const { subscribe = {}, groups = [] } = this.$store.state.app,
                    now = (Date.now() / 1000 | 0)

                return (groups || [])
                    .map(hydrate)
                    .map(g => ({
                        ...g,
                        paid: Object.keys(subscribe || {}).filter(s => !exclude.includes(s)).reduce((acc, srv) => ({
                            ...acc, [srv]: subscribe[srv] && subscribe[srv][g.id] && subscribe[srv][g.id] > now
                        }), {})
                    }))
            },
            set(groups) {
                this.$store.commit('app/set', { groups })
            }
        },
        authorized() {
            return !!(this.user || this.vkapp)
        }
    },
    methods: {
        groupTokenResolver(group_id)
        {
            const group = this.groups.find(g => g.id === group_id || g.value === group_id),
                { token } = group || {}

            return !group || token ? Promise.resolve(token) : this.setCommunityToken(group_id)
        },
        authSwitcher()
        {
            this.authorize = !!this.groups.length

            return Promise.resolve()
        },
        accessAdminLevel(group_id)
        {
            let group = group_id ? this.groups?.find(g => g.id === group_id || g.value === group_id) : null,
                access = true

            switch (true) {
                case !group:
                    access = false
                    if (!this.vkapp) {
                        this.$bus.$emit('snack', { content: UNEXPECTED_ERROR, color: 'warning', raw: true })
                    }
                    break

                case group.admin_level < 3:
                    access = false
                    this.$bus.$emit('snack', { content: ADMIN_ONLY, color: 'warning', raw: true })
                    break
            }

            return access
        },
        stateReload()
        {
            return Promise.all([
                this.$store.dispatch('chatbot/chatsLoad', {}),
                this.$store.dispatch('cover/coversLoad', {}),
                this.$store.dispatch('app/groupsLoad')

            ]).then(() => {
                this.$bus.$emit('settings:reload', 'login')
            })
        },
        addToCommunity()
        {
            if (!this.vkapp) return this.authSwitcher()

            return vk.send(addToCommunity).then(({ group_id } = {}) => {
                const g = find(group_id, this.groups) || { name: group_id, text: group_id },
                    name = g.name || g.value

                this.$bus.$emit('snack', name
                    ? success(`${this.$t('common.added')} ${name}`, true)
                    : error('Ошибка', true)
                )
            })
                .catch(this.errorHandler)
        },
        setCommunityToken(group_id)
        {
            group_id || (group_id = this.group_id || this.gid)

            if (!this.accessAdminLevel(group_id)) return

            if (!this.vkapp) return this.authSwitcher()

            const scope = process.env.APP_GSCOPE,
                app_id = +process.env.APP_ID

            return vk.send(getCommunityToken, { group_id, app_id, scope })
                .then(({ access_token } = {}) => {
                    const params = {
                        userId: this.$store.state.app.user.id,
                        groupToken: access_token,
                        groupId: group_id
                    }

                    return this.$axios.$post('/set/gtoken', params)
                        .then(({ set, token } = {}) => {
                            set && this.stateReload()

                            this.$bus.$emit('snack', set
                                ? success('common.installed')
                                : error('Ошибка', true)
                            )

                            return set ? token : null
                        })

                })
                .catch(this.errorHandler)
        },
        showWidgetPreviewBox()
        {
            if (!this.paid) return this.tariff = true

            const { groups, group_id, data: { type } } = this,
                group = groups.find(g => g.id === group_id || g.value === group_id)

            if (!group.paid.widget) return

            if (!this.$store.state.app.embed || !this.$store.state.app.frame) {
                return this.$emit('toggle:app', true)
            }

            const code = this.getCode()

            this.groupTokenResolver(group_id)
                .then(token => this.gtoken = token)
                .then(() => preview({ group_id, type, code }))
                .catch(this.errorHandler)
        },
        update(code = null, action = null, type = null)
        {
            if (!this.paid) return this.tariff = true

            const { groups, group_id } = this,
                group = groups.find(g => g.id === group_id || g.value === group_id)

            if (!group.paid.widget) return

            action || (action = 'widget.updated')

            type || (type = this.data.type)
            code || (code = this.getCode())

            const access_token = this.gtoken,
                time = +new Date()

            if (!this.time || this.time + 1e4 < time) {
                this.$axios.$post('/widget/update', { type, code, access_token, v: '5.131' })
                    .then(data => {
                        if (!data.error) {
                            this.$bus.$emit('snack', success(action))
                            this.time = time
                            return
                        }

                        this.errorHandler(data)

                    })
                    .catch(this.errorHandler)
            }
        },
        remove()
        {
            this.update('return false;', 'widget.widget_removed')
        }
    }
}
