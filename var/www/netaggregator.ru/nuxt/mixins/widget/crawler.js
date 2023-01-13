import { map, stopkeys, extended } from '~/assets/data/widget'

import isObject from 'lodash/isObject'
import merge from 'lodash/merge'

export default {
    computed: {
        image_id() {
            return this.entity === 'cover_list' ? 'cover_id' : 'icon_id'
        }
    },
    methods: {
        srcFromStore(id)
        {
            const images = this.$store.state.widget.images,
                gid = this.group_id

            return (images[gid].find(item => item.id === id) || {}).src
        },
        collect(id, src)
        {
            this.$store.commit('widget/addImage', { id, src })
        },
        adjust(set, src, key)
        {
            if (!(key in set) && stopkeys.includes(key)) {
                set[key] = src[key]
            }
            if (key === this.image_id) {
                if (src[key] && src.src) {
                    this.collect(src[key], src.src)
                }
                if (set[key] && !set.src) {
                    set.src = this.srcFromStore(set[key])
                }
            }
            if (key === 'compact') {
                set[key] = src[key]
            }
        },
        tablefit(set, src)
        {
            set.forEach((row, i) => {
                if (Array.isArray(src[i])) {
                    if (src[i][0].icon_id && src[i][0].src) {
                        this.collect(src[i][0].icon_id, src[i][0].src)
                    }
                }
                if (Array.isArray(set[i])) {
                    if (row[0].icon_id) {
                        row[0].src = this.srcFromStore(row[0].icon_id)
                    }
                }
            })
        },
        equal(set, src)
        {
            const resolve = item => item && item.src ? { src: item.src } : {},
                k = this.image_id

            return set.map(t => isObject(t)
                ? { ...t, ...resolve(src.find(c => c[k] === t[k])) }
                : t
            )
        },
        crawler(set, src)
        {
            if (!Array.isArray(src)) {
                throw new TypeError('Non consistent data struct')
            }
            if (this.entity === 'table') {
                this.tablefit(set, src)
            }

            const fn = eq => (d, i) => this.bypass(d, eq[i])

            return set.map(fn(this.equal(set, src)))
        },
        bypass(set, src)
        {
            if (Array.isArray(set)) {
                return this.crawler(set, src)
            }

            Object.keys(src).forEach(key => {
                this.adjust(set, src, key)
            })

            Object.keys(set).forEach(key => {
                if (Array.isArray(set[key]) || isObject(set[key])) {
                    set[key] = this.bypass(set[key], src[key])
                }
            })

            return set
        },
        merge(data)
        {
            const fn = (o, k) => ({ ...o, [k]: this.data[k] }),
                trace = this.prepare(map[this.entity]()),
                source = this.prepare(this.data)

            if (!isObject(data)) {
                data = source
            }

            return {
                ...this.bypass(merge(trace, data), source),
                ...extended.reduce(fn, {})
            }
        }
    }
}
