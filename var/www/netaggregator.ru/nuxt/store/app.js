const taglist = [
    'creativity',           // *
    'application_works',
    'embody_ideas',
    'aim',
    'your_ideas',
    'quality_style',
    'creativity',           // *
    'towards_change',
    'step_ahead',
    'changes_everything',
    'creativity',           // *
    'stand_out',
    'advantages',
    'dont_stop',
    'know_todo',
    'creativity',           // *
    'guess_desires',
    'with_soul',
    'with_love',
    'benefits',
    'creates_result',
    'creativity',           // *
    'right_move',
    'look_through',
    'become_easier',
    'customized_designs',
    'design_solutions',
    'creativity',           // *
    'elegant_solutions',
    'innovation_starts',
    'always_topic',
    'solutions_work',
    'creativity'            // *
]

export const state = () => ({
    cover: 'simple',
    color: 'accent',
    theme: 'light',
    hints: false,
    owner: false,
    fake: false,
    menu: .7,
    calc: .7,
    goto: 0,
    groups: [],
    clist: [],
    messages: {},
    presentation: false,
    codemirror: undefined,
    credentials: undefined,
    subscribe: undefined,
    locale: undefined,
    error: undefined,
    vkapp: undefined,
    user: undefined,
    utoken: undefined,
    drawer: undefined,
    wrapper: undefined,
    window: undefined,
    webview: undefined,
    frame: undefined,
    embed: undefined,
    standalone: undefined,
    randomtag: undefined,
    mStyle: { opacity: 1, display: 'block' },
    yStyle: { opacity: 0, display: 'none'  },
    pState: true,
    yageo: [],
    taglist
})

export const mutations = {
    set(state, payload)
    {
        state.fake && (payload = Object.keys(payload).reduce((a, k) => {
            return ['credentials','groups','user'].includes(k) ? a : { ...a, [k]: payload[k] }
        }, {}))

        Object.keys(payload).forEach(k => { state[k] = payload[k] })
    },
    setSettings(state, { credentials, settings, subscribe, groups = [], user, error, fake })
    {
        this.commit('app/set', { credentials, subscribe, groups, user, error })
        this.commit('socket/set', { settings })

        if (typeof window === 'undefined') return

        if (!fake && !state.fake) {
            const { isConnected } = this.state.socket

            switch (true) {
                case !user && isConnected:
                    this.commit('socket/reject')
                    break
                case user && !isConnected:
                    this.commit('socket/init')
                    break
            }
        }
    },
    toggleDrawer(state)
    {
        state.drawer = !state.drawer
    }
}

export const actions = {
    async groupsLoad({ state, commit })
    {
        let url = '/groups/get', groups = []

        try {

            const { data: { response } } = await this.$axios.post(url, { uid: (state.vkapp || {}).vk_user_id })

            groups = response.items || []

            commit('set', { groups })

        } catch (e) {
        }

        return groups
    },
    async settingsLoad({ state, commit })
    {
        let url = '/settings', settings = {}

        try {

            const { data } = await this.$axios.post(url, { uid: (state.vkapp || {}).vk_user_id })

            settings = data || {}

            commit('setSettings', settings)

        } catch (e) {
        }

        return settings
    },
    async getUsers(context, { user_ids, fields = 'photo_100,photo_200' })
    {
        let data, response = []

        try {

            ({ data } = await this.$axios.post('/bypass', { method: '/users.get', user_ids, fields, v: '5.131' }))

            if (data && !data.error) {
                response = data.response || []
            }

        } catch (e) {
        }

        return response
    },
    async getYaGeo({ state, commit })
    {
        if (state.yageo.length) return state.yageo

        let data

        try {

            data = await fetch('/ya-geo.json').then(r => r.json())

            if (data.length) {
                commit('set', { yageo: data })
            }

        } catch (e) {
        }

        return data
    }
}
