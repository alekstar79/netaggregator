const allowed = payload => payload.type && payload.type !== 'vk-connect'

export const state = () => ({
    current: null,
    events: []
})

export const mutations = {
    set(state, payload)
    {
        if (!allowed(payload)) return

        state.current = payload.type

        const idx = state.events.findIndex(e => e.type === payload.type)

        if (idx > -1) {
            state.events[idx] = payload
        } else {
            state.events.push(payload)
        }

        if (state.current === 'VKWebAppUpdateConfig') {
            switch (payload.data.scheme) {
                case 'client_light':
                case 'bright_light':
                    this.app.context.$vuetify.theme.dark = false
                    this.commit('app/set', { theme: 'light' })
                    break

                case 'client_dark':
                case 'space_gray':
                    this.app.context.$vuetify.theme.dark = true
                    this.commit('app/set', { theme: 'dark' })
                    break
            }
        }
    }
}
