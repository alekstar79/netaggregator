import { rndstring } from '~/utils/common/symbols.mjs'
import { send, success } from '~/utils/widget'

const keys = params => send('storage.getKeys', params),
    set = params => send('storage.set', params),
    get = params => send('storage.get', params),

    parser = (o, e) => ({ ...o, [e.key]: JSON.parse(e.value) }),
    store = list => list.length ? list.reduce(parser, {}) : {},
    // rm = k => k.match(/^w\d-list$/),

    v = '5.131'

export default {
    data: () => ({ time: 0 }),

    computed: {
        matchedNames() {
            return this.data.appellation && this.data.appellation === this.appellation
        }
    },
    methods: {
        skid(time)
        {
            const findSKID = () => Object.keys(this.$store.state.widget.save)
                .find(k => this.appellation === this.$store.state.widget.save[k].appellation)

            return this.matchedNames ? this.data.skid || findSKID() : `w${time}-${this.entity}`
        },
        getNamedWidget(skid)
        {
            const w = this.$store.state.widget,
                widget = w.widget[w.entity]

            widget.appellation = this.appellation || rndstring()
            widget.skid = skid

            return JSON.stringify(widget)
        },
        commit({ response = [] })
        {
            try {

                this.$store.commit('widget/set', { save: store(response) })

            } catch (e) {
            }
        },
        keys()
        {
            try {

                let filter = k => ({ keys: (k || []).filter(k => k.match(/^w\d+-\w+$/)) }),
                    { embed, frame, user, utoken: access_token } = this.$store.state.app,

                    options = { method: '/storage.getKeys', user_id: user.id, count: 1000, v },
                    resolve = Promise.resolve({})

                switch (true) {
                    case embed || frame:
                        resolve = keys({ count: 1000, v, access_token })
                            .then(({ response }) => filter(response))

                        break

                    case !!user:
                        resolve = this.$axios.post('/bypass', options)
                            .then(({ data: { response } }) => filter(response))

                        break
                }

                return resolve.catch(() => ({}))

            } catch (e) {
            }
        },
        remove({ key })
        {
            let { embed, frame, user, utoken: access_token } = this.$store.state.app,
                options = { method: '/storage.set', user_id: user.id, v },
                p = Promise.resolve(),
                time = +new Date()

            if (!this.time || this.time + 2e3 < time) {
                switch (true) {
                    case embed || frame:
                        p = set({ key, value: '', v, access_token })
                        break

                    case !!user:
                        p = this.$axios.post('/bypass', { key, value: '', ...options })
                            .then(({ data }) => data)

                        break
                }

                return p
                    .then(() => { this.$bus.$emit('snack', success('widget.removed')) })
                    .then(() => { this.time = time })
                    .then(this.keys)
                    .then(this.load)
                    .catch(this.errorHandler)
            }

            return p
        },
        save({ keys } = {})
        {
            let msg = `widget.${keys ? keys.length ? 'removed' : 'empty_list' : 'saved'}`,
                { embed, frame, user, utoken: access_token } = this.$store.state.app,
                options = { method: '/storage.set', user_id: user.id, v },

                p = Promise.resolve(),
                time = +new Date(),
                handler

            if (keys) {
                switch (true) {
                    case embed || frame:
                        handler = key => set.bind(null, { key, value: '', v, access_token })
                        break

                    case !!user:
                        options = { value: '', ...options }
                        handler = key => () => this.$axios.post('/bypass', { key, ...options })
                            .then(({ data }) => data)

                        break
                }

                return Promise.all(
                    keys.map((key, i) => p.then(() => setTimeout(handler(key), 2e3 * i)))
                ).then(() => {
                    this.$bus.$emit('snack', success(msg))
                    this.commit({})
                })
            }
            if (!this.time || this.time + 2e3 < time) {
                const key = this.skid(time),
                    value = this.getNamedWidget(key)

                switch (true) {
                    case embed || frame:
                        p = set({ key, value, v, access_token })
                        break

                    case !!user:
                        p = this.$axios.post('/bypass', { key, value, ...options })
                            .then(({ data }) => data)

                        break
                }

                return p
                    .then(() => { this.$bus.$emit('snack', success(msg)) })
                    .then(() => { this.time = time })
                    .then(this.keys)
                    .then(this.load)
                    .catch(this.errorHandler)
            }

            return p
        },
        load({ keys = [] } = {})
        {
            /* const remove = keys.filter(k => rm(k))

            if (remove.length) {
                return this.save({ keys: remove })
            } */

            let { embed, frame, user, utoken: access_token } = this.$store.state.app,
                p = Promise.resolve({})

            if (!keys.length) {
                this.commit({})
                return p
            }

            keys = keys.join(',')

            switch (true) {
                case embed || frame:
                    p = get({ keys, v, access_token })
                    break

                case !!user:
                    p = this.$axios.post('/bypass', { method: '/storage.get', user_id: user.id, keys, v })
                        .then(({ data }) => data)

                    break
            }

            return p
                .then(this.commit)
                .catch(this.errorHandler)
                .finally(this.keyLoadCompleted)
        }
    }
}
