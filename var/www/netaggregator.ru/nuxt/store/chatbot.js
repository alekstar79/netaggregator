import { foldAll, unfoldAll } from 'he-tree-vue/dist/he-tree-vue'
import { BroadcastChannel } from 'broadcast-channel'
import cloneDeep from 'lodash/cloneDeep'

import { mongoId, variables, dialog, error, find, remove, set, success, reassign, modify, clean } from '~/utils/chatbot'
import { setSingleConnection } from '~/utils/common/connection.mjs'
import { resolver } from '~/utils/common/resolver.mjs'

import { SocketClient, events } from '~/utils/socket'

let uid, url = 'wss://netaggregator.ru:8443/mailing'

function initMailingSharedWorker()
{
    if (process.browser) {
        return new SharedWorker('../workers/stream.js', {
            name: 'stream-worker',
            type: 'module'
        })
    }
}

function uidDetermine({ user, vkapp })
{
    vkapp && (uid = vkapp.vk_user_id)
    user  && (uid = user.id)
}

function runtimeInjection()
{
    try {

        const worker = initMailingSharedWorker()

        if (worker) return {
            init(state)
            {
                if (!this.state.app.user || this.state.app.fake || state.isConnected) return

                uidDetermine(this.state.app)

                state.channel || (() => {
                    state.channel = new BroadcastChannel('MailingChannel')

                    state.channel.addEventListener('message', ({ error, event, message }) => {
                        error && this.commit('chatbot/error', error)

                        if (events.includes(event)) {
                            this.commit(`chatbot/${event}`, { data: message })
                        }

                    }, false)
                })()

                state.worker || (() => {
                    state.worker = worker
                    state.worker.port.start()
                })()

                state.worker.port.postMessage({
                    url: `${url}/${uid}`,
                    channel: 'mailing',
                    action: 'start'
                })
            },
            close(state)
            {
                if (!state.isConnected) return

                state.isConnected = false

                uid && state.worker.port.postMessage({
                    url: `${url}/${uid}`,
                    action: 'reconnect',
                    channel: 'mailing'
                })
            },
            reject(state)
            {
                state.isConnected = false

                uid && state.worker.port.postMessage({
                    url: `${url}/${uid}`,
                    channel: 'mailing',
                    action: 'close'
                })

                state.history = []
                state.stream = []
            },
            send(state, payload)
            {
                if (!state.isConnected) return

                uid && state.worker.port.postMessage({
                    payload: JSON.stringify(payload),
                    url: `${url}/${uid}`,
                    channel: 'mailing',
                    action: 'send'
                })

                const action = payload.action

                if (action === 'build' || action === 'filter') {
                    this.commit('chatbot/setMailing', { gid: payload.gid, progress: action })
                }
                if (!['attach','keyboard','save'].includes(action)) {
                    this.$bus.$emit('snack', {
                        color: 'success',
                        content: (() => {
                            switch (action) {
                                case 'defer': return 'chatbot.scheduled'
                                case 'clear': return 'chatbot.cancelled'
                            }

                            return 'chatbot.started'
                        })()
                    })
                }
            }
        }

    } catch (e) {
    }

    return {}
}

export const state = () => ({
    modules: [
        { entity: 'dialogs',     module: 'Dialogs',     cmp: 'lazy-chatbot-dialogs',  icon: 'mdi-chat-processing-outline' },
        { entity: 'connections', module: 'Connections', cmp: 'lazy-core-connections', icon: 'mdi-google-circles-communities' },
        { entity: 'mailing',     module: 'Mailing',     cmp: 'lazy-chatbot-mailing',  icon: 'mdi-telegram' }
    ],

    isConnected: false,

    channel: null,
    worker: null,
    error: null,

    reload: mongoId(),
    entity: 'dialogs',

    variables: variables(),
    mailings: [],
    idx: null,
    id: null,
    list: [],

    keyboard: {
        handler: null
    },
    dialog: {
        handler: null,
        show: false,
        x: 0,
        y: 0,
        z: 0
    },
    emoji: {
        handler: null,
        show: false,
        x: 0,
        y: 0,
        z: 0
    }
})

export const getters = {
    question: ({ idx, id, list }) => list.length && list[idx] && id
        ? (find(list[idx].dialogs, id) || {})
        : undefined
}

export const mutations = {
    setSingleConnection,

    set(state, payload)
    {
        this.state.app.fake && (payload = Object.keys(payload).reduce((a, k) => {
            return ['mailings','list'].includes(k) ? a : { ...a, [k]: payload[k] }
        }, {}))

        Object.keys(payload).forEach(k => { state[k] = payload[k] })
    },
    setModule(state, { idx, cmp })
    {
        state.modules[idx].cmp = cmp
    },
    setShedule(state, { gid, time })
    {
        state.mailings.some((m, i) => {
            if (m.gid === gid) {
                state.mailings[i].shedule = time ? { time } : {}
                return true
            }

            return false
        })
    },
    setFilters(state, { gid, filters })
    {
        state.mailings.some((m, i) => {
            if (m.gid === gid) {
                state.mailings[i].filters = filters
                return true
            }

            return false
        })
    },
    setKeyboard(state, { gid, keyboard })
    {
        state.mailings.some((m, i) => {
            if (m.gid === gid) {
                state.mailings[i].keyboard = keyboard
                return true
            }

            return false
        })
    },
    setSmallTalk(state, { smalltalk })
    {
        if (state.idx !== null) {
            state.list[state.idx].smalltalk = smalltalk
        }
    },
    setDefaultKeyboard(state, keyboard)
    {
        if (state.idx !== null) {
            state.list[state.idx].keyboard = keyboard
        }
    },
    setDefaultReply(state, reply)
    {
        if (state.idx !== null) {
            state.list[state.idx].default = reply
        }
    },
    setDialog(state, dialog)
    {
        if (state.idx === null) return

        state.list[state.idx] = dialog
        state.reload = mongoId()
    },
    setLocal(state, { list })
    {
        if (state.idx === null) return

        if (state.id === null) {
            state.list[state.idx] = list[state.idx]
            state.reload = mongoId()
            return
        }

        state.list[state.idx].dialogs.some((item, i) => {
            if (item.id === state.id && list[state.idx].dialogs[i]) {
                state.list[state.idx].dialogs[i] = list[state.idx].dialogs[i]
                state.reload = mongoId()
                return true
            }

            return false
        })
    },
    directSetById(state, dialog)
    {
        if (state.idx === null) return

        state.list[state.idx].dialogs.some((item, i) => {
            if (item.id === dialog.id) {
                state.list[state.idx].dialogs[i] = dialog
                state.reload = mongoId()
                return true
            }

            return false
        })
    },
    folding(state, { fold })
    {
        const fn = fold ? foldAll : unfoldAll

        if (!state.list.length || state.idx === null) return

        if (state.list[state.idx]) {
            fn(state.list[state.idx].dialogs)
            state.reload = mongoId()
        }
    },
    toggleFold(state, { path })
    {
        if (!state.list.length || state.idx === null) return

        if (state.list[state.idx]) {
            let node = state.list[state.idx].dialogs,
                ln = path.length - 1

            try {

                path.forEach((idx, i) => { node = i < ln ? node[idx].children : node[idx] })

                node.$folded = !node.$folded

                state.reload = mongoId()

            } catch (e) {
            }
        }
    },
    nodeCopy(state, { path, index })
    {
        if (!state.list.length || state.idx === null) return

        if (state.list[state.idx]) {
            let node = state.list[state.idx].dialogs,
                ln = path.length - 1

            path.forEach((idx, i) => {
                if (i < ln) {
                    node = node[idx].children
                } else {
                    const clone = cloneDeep(node[idx])

                    clone.dialogs = reassign(clone.children)
                    clone.id = mongoId()

                    node.splice(index, 0, clone)
                }
            })

            state.reload = mongoId()
        }
    },
    nodeRemove(state, { id })
    {
        if (!state.list.length || state.idx === null) return

        if (state.list[state.idx]) {
            state.list[state.idx].dialogs = remove(state.list[state.idx].dialogs, id)
            state.reload = mongoId()
        }
    },
    edit(state, { field, value })
    {
        const { idx, id, list } = state,
            sniffer = array => {
                array.some((item, i) => {
                    if (item.id === id) {
                        array[i][field] = value
                        state.reload = mongoId()
                        return true
                    }
                    if ((item.children || []).length) {
                        sniffer(item.children)
                    }

                    return false
                })
            }

        if (idx !== null && id !== null && list.length) {
            sniffer((state.list[idx] || {}).dialogs || [])
        }
    },
    updateDialogs(state, payload)
    {
        if (state.idx !== null) {
            state.list[state.idx].dialogs = payload
            state.reload = mongoId()
        }
    },
    createDialog(state, { name })
    {
        state.list.push(dialog(this.state.app.user.id, name))

        state.reload = mongoId()
    },
    createQuestion(state)
    {
        if (state.idx !== null) {
            state.list[state.idx].dialogs.push(set())
            state.reload = mongoId()
        }
    },
    deleteQuestion(state)
    {
        if (state.id !== null && state.idx !== null) {
            state.list[state.idx].dialogs = remove(state.list[state.idx].dialogs, state.id)
            state.reload = mongoId()
            state.id = null
        }
    },
    setMailing(state, mailing)
    {
        if (typeof mailing === 'undefined' || !mailing.gid) return

        if (!state.mailings.some((m, idx) => {
            if (m.gid !== mailing.gid) return false

            state.mailings[idx] = Object.assign(m, mailing)

            return true

        })) {
            state.mailings.push(mailing)
        }
    },
    init(state)
    {
        if (!this.state.app.user || state.isConnected || this.state.app.fake) return

        uidDetermine(this.state.app)

        try {

            const worker = new SocketClient()

            worker.url = `${url}/${uid}`
            worker.connect()

            events.forEach(e => worker.on(e, payload => {
                this.commit(`chatbot/${e}`, payload)
            }))

            if (state.worker) {
                state.worker.close()
            }

            state.worker = worker

        } catch (e) {
        }
    },
    open(state)
    {
        state.isConnected = true
    },
    close(state, e)
    {
        if (!state.isConnected) return

        state.isConnected = false

        if (!e.wasClean && state.worker) {
            state.worker.reconnect(e)
        }
    },
    reject(state)
    {
        state.isConnected = false

        if (state.worker) {
            state.worker.close()
        }

        state.worker = null
    },
    error(state, e)
    {
        state.error = e
    },
    message(state, { data } = {})
    {
        try {

            let msg = JSON.parse(data),
                action = msg.action,
                snack = null

            delete msg.action
            delete msg.type

            if ('error' in msg) {
                snack = error(msg.error)

            } else {
                if (action !== 'defer') {
                    snack = success('chatbot.done')
                }
                if (action === 'build' || action === 'filter' || action === 'import') {
                    this.commit('chatbot/setMailing', msg)
                }
                if (action === 'start') {
                    this.commit('chatbot/setShedule', { gid: msg.gid })
                }
            }
            if (snack) {
                this.$bus.$emit('snack', snack)
            }

        } catch (e) {
        }
    },
    send(state, payload)
    {
        if (!state.worker) return

        state.worker.send(JSON.stringify(payload))

        const action = payload.action

        if (action === 'build' || action === 'filter') {
            this.commit('chatbot/setMailing', { gid: payload.gid, progress: action })
        }
        if (!['attach','keyboard','save'].includes(action)) {
            this.$bus.$emit('snack', {
                color: 'success',
                content: (() => {
                    switch (action) {
                        case 'defer': return 'chatbot.scheduled'
                        case 'clear': return 'chatbot.cancelled'
                    }

                    return 'chatbot.started'
                })()
            })
        }
    },

    ...runtimeInjection()
}

export const actions = {
    load: resolver(({ commit, module }) => {
        if (module.entity === 'mailing') {
            commit('init')
        }
    }),

    async chatsLoad({ commit }, { local })
    {
        let list = []

        try {

            const { vk_user_id: uid } = this.state.app.vkapp || {},
                { data } = await this.$axios.get('/chat/list', { params: { uid } })

            list = data.list || []

            if (list.length) {
                list = list.map(modify)
            }

            commit(local ? 'setLocal' : 'set', { list })

        } catch (e) {
        }

        return list
    },
    async mailingState({ commit }, { gid })
    {
        try {

            const { state } = await this.$axios.$post('/mailing/state', { gid })

            state && commit('setMailing', { ...state, _id: state._id.$oid || state._id })

        } catch (e) {
        }
    },
    async save({ state: { list: dirty } })
    {
        let response = { set: false },
            list = clean(dirty)

        try {

            const { vk_user_id: uid } = this.state.app.vkapp || {},
                { data } = await this.$axios.post('/chat/save', { uid, list })

            response = data

        } catch (e) {
        }

        return response
    }
}
