import { Execute } from '~/utils/execute.mjs'
import { send } from '~/utils/widget'

import cities from '~/assets/data/cities.mjs'
import saveAs from 'file-saver'

const method = 'database.getCities',
    v = '5.131'

export default {
    methods: {
        saveAsJson(object)
        {
            try {

                saveAs(new Blob([JSON.stringify(object)], { type: 'application/json;charset=utf-8' }), 'cities.json')

            } catch (e) {
            }
        },
        async fetchCities(country_id = 1, need_all = 1, offset = 0, count = 1000)
        {
            if (this.clist.length) return

            let { embed, frame, user, utoken: access_token } = this.$store.state.app,
                concat = (accumulator, { items = [] }) => accumulator.concat(items),
                params = { country_id, offset, count, need_all, v },

                limit = Execute.MAX_API_CALLS,
                all = Number.MAX_SAFE_INTEGER,

                length, code, ret,

                response,
                error

            try {

                do {

                    if (!(length = all > limit * count ? limit : Math.ceil(all / count))) break

                    ({ code } = Execute.multiple(method, Array.from({ length }, (_, i) => {
                        return { ...params, offset: offset + (i * count) }
                    })).getCode()[1])

                    switch (true) {
                        case embed || frame:
                            ({ response, error } = await send('execute', { code, access_token, v }))
                            break

                        case !!user:
                            ({ data: { response, error } } = await this.$axios.post('/bypass', {
                                method: '/execute', code
                            }))
                    }

                    if (error || !Array.isArray(response)) break

                    if ((ret = response.reduce(concat, [])).length) {
                        this.clist = this.clist.concat(ret)
                    }

                    all = (response[0]?.count || 0) - this.clist.length
                    offset = this.clist.length

                } while (all > 0)

            } catch (e) {
            }

            if (!this.clist.length) {
                this.clist = cities
            }
        },
        async getCities(country_id = 1, need_all = 0, offset = 0, count = 1000)
        {
            if (this.clist.length) return

            let { embed, frame, user, utoken: access_token } = this.$store.state.app,
                params = { country_id, offset, count, need_all, v },
                solver = ({ items }) => items || [],

                response,
                error

            try {

                switch (true) {
                    case embed || frame:
                        ({ response, error } = await send(method, { access_token, ...params }))
                        break

                    case !!user:
                        ({ data: { response, error } } = await this.$axios.post('/bypass', {
                            method: `/${method}`, ...params
                        }))
                }

                error || (this.clist = solver(response))

            } catch (e) {
            }

            if (!this.clist.length) {
                this.clist = cities
            }
        },
        getCitiesStub()
        {
            return Promise.resolve(this.clist = cities)
        }
    }
}
