import { setMultiplyConnection } from '~/utils/common/connection.mjs'
import { cover, modify, mongoId, convert } from '~/utils/cover.js'
import { resolver } from '~/utils/common/resolver.mjs'

export const state = () => ({
    reload: mongoId(),
    entity: 'list',
    order: 'asc',
    fabric: false,

    image: null,
    edit: null,
    hash: null,
    tmpl: null,
    name: null,
    idx: null,

    modules: [
        { entity: 'list',        module: 'List',        cmp: 'lazy-cover-list',       icon: 'mdi-view-stream' },
        { entity: 'connections', module: 'Connections', cmp: 'lazy-core-connections', icon: 'mdi-google-circles-communities' },
        { entity: 'templates',   module: 'Templates',   cmp: 'lazy-cover-templates',  icon: 'mdi-cog' }
    ],

    collection: new Set(),

    connections: [],
    templates: [],
    ranges: {},
    list: []
})

export const mutations = {
    setMultiplyConnection,

    set(state, payload)
    {
        this.state.app.fake && (payload = Object.keys(payload).reduce((a, k) => {
            return ['connections','list'].includes(k) ? a : { ...a, [k]: payload[k] }
        }, {}))

        Object.keys(payload).forEach(k => { state[k] = payload[k] })
    },
    setModule(state, { idx, cmp })
    {
        state.modules[idx].cmp = cmp
    },
    setLocal(state, { list })
    {
        if (state.idx !== null) {
            state.list[state.idx] = list[state.idx]
            state.reload = mongoId()
        }
    },
    setCover(state, cover)
    {
        if (state.idx !== null) {
            state.list[state.idx] = cover
            state.reload = mongoId()
        }
    },
    createCover({ list }, { name, timezone = 'Europe/Moscow', widgets = [], background = false, callback = () => {} })
    {
        const uid = this.state.app.user?.id || this.state.app.vkapp?.vk_user_id,
            doc = cover(uid, name, timezone, widgets, background)

        this.dispatch('cover/save', {
            doc: Object.keys(doc).reduce((c, k) => {
                return { ...c, [k === '_id' ? 'hash' : k]: doc[k] }
            }, { connections: [] })
        })
            .then(callback)
    }
}

export const actions = {
    load: resolver(),

    cacheImage({ state }, { src })
    {
        if (state.collection.has(src)) return

        state.collection.add(src)

        return new Promise(resolve => {
            const img = new Image()

            img.onload = resolve
            img.src = src
        })
    },
    save({ state }, { doc } = {})
    {
        const { user, vkapp } = this.state.app

        if (!user && !vkapp) {
            return Promise.resolve({ data: { set: false } })
        }

        let set = { list: state.list }

        switch (true) {
            case !!doc:
                set = { doc }
                break
            case state.idx !== null:
                set = { doc: state.list[state.idx] }
                break
        }

        vkapp && (set.uid = vkapp.vk_user_id)

        return this.$axios.put('/cover', set)
    },
    async copy({ state }, { item, name })
    {
        let response = { copy: false }

        try {

            const { vk_user_id: uid } = this.state.app.vkapp || {},
                { data } = await this.$axios.post('/cover/copy', { ...item, uid, name })

            response = data

        } catch (e) {
        }

        state.reload = mongoId()

        return response
    },
    async remove({ state }, { _id })
    {
        let response = { remove: false }

        try {

            const { vk_user_id: uid } = this.state.app.vkapp || {},
                { data } = await this.$axios.delete('/cover', { params: { _id, uid } })

            response = data

        } catch (e) {
        }

        state.reload = mongoId()

        return response
    },
    async templatesLoad({ state, commit })
    {
        let templates = []

        try {

            if (!state.templates.length) {
                templates = (await this.$axios.get('/cover/templates')).data
                    ?.map(c => ({ ...c, _id: c._id.$oid || c._id })) || []
            }

        } catch (e) {
        }

        if (templates.length) {
            commit('set', { templates })
        }
    },
    async coversLoad({ state, commit }, { local } = {})
    {
        let ranges = {}, list = []

        try {

            const { vk_user_id: uid } = this.state.app.vkapp || {},
                { data } = await this.$axios.get('/cover', { params: { uid } })

            ranges = data.ranges || {}
            list = data.list || []

        } catch (e) {
        }

        if (list.length) {
            commit(local ? 'setLocal' : 'set', {
                ranges: convert(ranges),
                list: list.map(modify)
            })
        }
    }
}
