import { widget, map, modules } from '~/assets/data/widget'
import { resolver } from '~/utils/common/resolver.mjs'
import { send } from '~/utils/widget'

const alter = { female: widget(), lang: widget() },
    v = '5.131',

    getImageUploadServer = params => send('appWidgets.getGroupImageUploadServer', params),
    getImagesById = params => send('appWidgets.getImagesById', params),
    getImages = params => send('appWidgets.getGroupImages', params),
    saveImage = params => send('appWidgets.saveGroupImage', params),

    variables = () => (['firstname','lastname','bdate','now','age'])

export const state = () => ({
    widget: widget(),
    entity: 'text',

    started: false,
    accounts: [],

    group_id: null,
    gtoken: null,

    groups: [],
    dialog: {
        handler: null,
        show: false,
        x: 0,
        y: 0,
        z: 0
    },

    variables: variables(),

    presets: {},
    images: {},
    save: {},

    modules,
    alter
})

export const mutations = {
    set(state, payload)
    {
        this.state.app.fake && (payload = Object.keys(payload).reduce((a, k) => {
            return k === 'groups' ? a : { ...a, [k]: payload[k] }
        }, {}))

        Object.keys(payload).forEach(k => { state[k] = payload[k] })
    },
    addImage(state, { id, src })
    {
        const gid = state.group_id

        state.images[gid] || (state.images[gid] = [])

        if (!state.images[gid].find(item => item.id === id)) {
            state.images[gid].push({ id, src })
        }
    },
    setModule(state, { idx, cmp })
    {
        state.modules[idx].cmp = cmp
    },
    clearWidget(state, { entity, alter = null  })
    {
        entity || (entity = state.entity)

        const v = map[entity]()

        switch (alter) {
            case 'female':
                state.alter.female[entity] = v
                break
            case 'lang':
                state.alter.lang[entity] = v
                break

            default:
                state.widget[entity] = v
        }
    },
    setWidget(state, { alter, value, entity })
    {
        entity || (entity = state.entity)

        switch (alter) {
            case 'female':
                state.alter.female[entity] = value
                break
            case 'lang':
                state.alter.lang[entity] = value
                break

            default:
                state.widget[entity] = value
        }
    },
    push(state, variable)
    {
        state.variables.push(variable)
    },
    reset(state)
    {
        state.variables = variables()
    }
}

export const actions = {
    load: resolver(),

    getImages({ state }, { image_type = '24x24', offset = 0, count = 10 })
    {
        const { embed, frame, user } = this.state.app,
            access_token = state.gtoken

        switch (true) {
            case embed || frame:
                return getImages({ offset, count, image_type, v, access_token })

            case !!user:
                return this.$axios.post('/bypass', {
                    method: '/appWidgets.getGroupImages',
                    access_token,
                    image_type,
                    offset,
                    count,
                    v
                })
                    .then(({ data }) => data)
                    .catch(() => {})
        }

        return Promise.resolve()
    },
    getImagesById({ state }, images)
    {
        const { embed, frame, user } = this.state.app

        switch (true) {
            case embed || frame:
                return getImagesById({ images, v, access_token: state.gtoken })

            case !!user:
                return this.$axios.post('/bypass', {
                    method: '/appWidgets.getImagesById',
                    access_token: state.gtoken,
                    user_id: user.id,
                    images,
                    v
                })
                    .then(({ data }) => data)
                    .catch(() => {})
        }

        return Promise.resolve()
    },
    imageLoad({ state }, { image, image_type = '24x24' })
    {
        let { embed, frame, user } = this.state.app,
            resolve = Promise.resolve({}),
            access_token = state.gtoken

        switch (true) {
            case embed || frame:
                resolve = getImageUploadServer({ image_type, v, access_token })
                break

            case !!user:
                resolve = this.$axios.post('/bypass', {
                    method: '/appWidgets.getGroupImageUploadServer',
                    user_id: user.id,
                    access_token,
                    image_type,
                    v
                })
                    .then(({ data }) => data)
        }

        return resolve
            .then(({ response } = {}) => {
                if (!response || !response.upload_url) {
                    throw new Error('Upload error')
                }

                const data = new FormData()

                data.append('upload_url', response.upload_url)
                data.append('image', image)

                return this.$axios.$post('/transfer', data)
            })
            .then(({ transfer } = {}) => {
                if (!transfer || !transfer.hash) {
                    throw new Error('Upload error')
                }

                switch (true) {
                    case embed || frame:
                        return saveImage({ ...transfer, v, access_token })

                    case !!user:
                        return this.$axios.post('/bypass', {
                            method: '/appWidgets.saveGroupImage',
                            ...transfer,
                            access_token,
                            v
                        })
                            .then(({ data }) => data)
                }
            })
            .catch(() => {})
    }
}
