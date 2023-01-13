export const state = () => ({
    cache: new Set(),
    articles: []
})

export const mutations = {
    set(state, payload)
    {
        Object.keys(payload).forEach(k => { state[k] = payload[k] })
    }
}

export const actions = {
    cacheImage({ state }, { src })
    {
        if (state.cache.has(src)) return

        state.cache.add(src)

        return new Promise(resolve => {
            const img = new Image()

            img.onload = resolve
            img.src = src
        })
    },
    async loadNews({ state, commit })
    {
        if (state.articles.length) return

        try {

            const { data } = await this.$axios.get('/get/news')

            commit('set', { articles: data.list || [] })

        } catch (e) {
        }
    }
}
