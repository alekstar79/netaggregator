import { BroadcastChannel } from 'broadcast-channel'

import { resolver } from '~/utils/common/resolver.mjs'
import { getText } from '~/utils/common/get-text.mjs'
import { cutText } from '~/utils/common/cut-text.mjs'

import { SocketClient, events } from '~/utils/socket'
import { plain } from '~/mixins/stream/common'

let started, channel, worker, uid, url = 'wss://netaggregator.ru:8443/stream'

function initStreamSharedWorker()
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

        if (worker || (worker = initStreamSharedWorker()))
            return {
                async init(state)
                {
                    if (!this.state.app.user || this.state.app.fake || state.isConnected) return

                    uidDetermine(this.state.app)

                    try {

                        state.history = await this.$ls.get(`history_${uid}`, [])
                        this.$ls.set(`history_${uid}`, state.history)

                    } catch (e) {
                    }

                    started || (() => {
                        worker.port.start()
                        started = true
                    })()

                    channel || (() => {
                        channel = new BroadcastChannel('StreamChannel')

                        channel.addEventListener('message', ({ error, event, message }) => {
                            switch (true) {
                                case events.includes(event):
                                    this.commit(`socket/${event}`, { data: message })
                                    break
                                case !!error:
                                    this.commit('socket/error', error)
                                    break
                            }

                        }, false)
                    })()

                    worker.port.postMessage({
                        url: `${url}/${uid}`,
                        channel: 'stream',
                        action: 'start'
                    })
                },
                close(state)
                {
                    if (!state.isConnected) return

                    state.isConnected = false

                    uid && worker.port.postMessage({
                        url: `${url}/${uid}`,
                        action: 'reconnect',
                        channel: 'stream'
                    })
                },
                reject(state)
                {
                    state.isConnected = false

                    uid && worker.port.postMessage({
                        url: `${url}/${uid}`,
                        channel: 'stream',
                        action: 'close'
                    })

                    state.history = []
                    state.stream = []
                }
            }

    } catch (e) {
    }

    return {}
}

export const state = () => ({
    modules: [
        { icon: 'mdi-view-stream', entity: 'stream',  module: 'Queue', cmp: 'lazy-stream-queue' },
        { icon: 'mdi-bookmark',    entity: 'history', module: 'Queue', cmp: 'lazy-stream-queue' },
        { icon: 'mdi-poll',        entity: 'chart',   module: 'Chart', cmp: 'lazy-stream-chart' }
    ],

    entity: 'stream',
    chart: 'bar',

    isConnected: false,

    detailed: null,
    settings: null,

    error: null,

    history: [],
    stream: [],

    limit: 13
})

export const mutations = {
    set(state, payload)
    {
        this.state.app.fake && (payload = Object.keys(payload).reduce((a, k) => {
            return ['settings','history','stream'].includes(k) ? a : { ...a, [k]: payload[k] }
        }, {}))

        Object.keys(payload).forEach(k => { state[k] = payload[k] })
    },
    setDetailed(state, set)
    {
        state.detailed = set
    },
    setSettings(state, set)
    {
        state.settings = set
    },
    setEntity(state, set)
    {
        state.entity = set
    },
    async init(state)
    {
        if (!this.state.app.user || this.state.app.fake || state.isConnected) return

        uidDetermine(this.state.app)

        try {

            state.history = await this.$ls.get(`history_${uid}`, [])
            this.$ls.set(`history_${uid}`, state.history)

        } catch (e) {
        }
        try {

            worker && worker.close()

            worker = new SocketClient()

            worker.url = `${url}/${uid}`
            worker.connect()

            events.forEach(e => worker.on(e, payload => {
                this.commit(`socket/${e}`, payload)
            }))

        } catch (e) {
        }
    },
    toLocal(state)
    {
        if (state.isConnected && uid) {
            this.$ls.set(`history_${uid}`, state.history)
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

        if (!e.wasClean && worker) {
            worker.reconnect(e)
        }
    },
    reject(state)
    {
        state.isConnected = false

        worker && worker.close()

        state.history = []
        state.stream = []

        worker = null
    },
    error(state, e)
    {
        state.error = e
    },
    message(state, { data } = {})
    {
        if (!state.isConnected) return

        let stream, tags, over, dataset = {}, stats = [], msg = {}

        try {

            msg = JSON.parse(data)

            if (state.settings) {
                dataset = { ...(state.settings.chart?.dataset || {}) }
                stats = state.settings.stats?.slice()
            }

        } catch (e) {
        }

        if (msg.code === 100) {
            msg.event.tags || (msg.event.tags = [])

            tags = Object.keys(dataset)

            try {

                msg.event.tags.forEach(tag => {
                    stats.forEach((v, i) => {
                        if (v.tag === tag) {
                            stats[i].count += 1
                        }
                    })
                    tags.forEach(t => {
                        if (t === tag) {
                            dataset[t][dataset[t].length - 1] += 1
                        }
                    })
                })

                state.settings = {
                    ...(state.settings || {}),
                    chart: { ...(state.settings?.chart || {}), dataset },
                    stats
                }

            } catch (e) {
            }

            msg.event.cut = cutText(plain(getText(msg.event)), 4, 50)
            stream = [msg.event, ...(state.stream || [])]

            if ((over = state.limit - stream.length) < 0) {
                stream.splice(over, Math.abs(over))
            }

            state.stream = stream
        }
    },
    clearStats(state)
    {
        const stats = state.settings?.stats.map(s => ({ ...s, count: 0 })) || []

        state.settings = { ...(state.settings || {}), stats }
    },
    removeFromHistory(state, item)
    {
        if (!this.state.app.user) return

        state.history || (state.history = [])

        const i = state.history.findIndex(v => v === item)

        if (i !== -1) {
            state.history.splice(i, 1)
            this.commit('socket/toLocal')
        }
    },
    addToHistory(state, item)
    {
        if (!this.state.app.user) return

        state.history || (state.history = [])

        state.history.unshift(item)

        this.commit('socket/toLocal')
    },

    ...runtimeInjection()
}

export const actions = {
    load: resolver()
}
