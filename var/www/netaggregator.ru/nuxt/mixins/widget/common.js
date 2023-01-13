import { Effect } from '~/utils/canvas/libs/effect'

import { isObject } from '~/utils/common/is-object.mjs'
import { delay } from '~/utils/common/delay.mjs'
import { extended } from '~/assets/data/widget'
import { Throttle } from '~/utils/throttle'

const throttle = Throttle.create(300),

    set = throttle.set.bind(throttle),
    run = throttle.run.bind(throttle)

export default {
    data: () => ({
        map: require('assets/data/widget').map,
        groups_id_freeze: false,
        promises: [],
        track: 0
    }),
    computed: {
        group_id: {
            set(group_id) {
                this.$store.commit('widget/set', { group_id })
            },
            get() {
                return this.$store.state.widget.group_id
            }
        },
        gtoken: {
            set(gtoken) {
                this.$store.commit('widget/set', { gtoken })
            },
            get() {
                return this.$store.state.widget.gtoken
            }
        },
        modules: {
            set(modules) {
                this.$store.commit('widget/set', { modules })
            },
            get() {
                return this.$store.state.widget.modules
            }
        },
        widget: {
            set(widget) {
                this.$store.commit('widget/set', { widget })
            },
            get() {
                return this.$store.state.widget.widget
            }
        },
        entity: {
            set(entity) {
                this.$store.commit('widget/set', { entity })
            },
            get() {
                return this.$store.state.widget.entity
            }
        },
        alter: {
            set(alter) {
                this.$store.commit('widget/set', { alter })
            },
            get() {
                return this.$store.state.widget.alter
            }
        },
        data: {
            get() {
                const { widget, entity } = this.$store.state.widget

                return widget[entity]
            },
            set(v) {
                const { widget, entity } = this.$store.state.widget

                widget[entity] = v

                this.$store.commit('widget/set', { widget })
            }
        },
        group() {
            return this.groups.find(g => g.id === this.group_id || g.value === this.group_id)
        },
        paid() {
            return !!this.group?.paid.widget
        }
    },
    watch: {
        group_id: run,

        track(v) {
            v || this.$emit('promises:fulfilled')
        }
    },
    methods: {
        initCommonModule()
        {
            throttle.has || set(gid => {
                if (!gid) return

                this.groupTokenResolver(gid)
                    .then(this.setGToken)
                    .catch(() => {})
            })
        },
        setGToken(group_token)
        {
            this.gtoken = group_token
            this.$emit('token:resolve')

            if (this.isImaged()) {
                this.promises = []
                this.checkImages()
            }
        },
        promisify(data, key)
        {
            const id = data[key]

            this.track++
            this.promises.push(
                this.getImagesById(id).then(imgs => {
                    if (id === '{uid}') {
                        return id
                    }
                    if (!imgs.length) {
                        data[key] = null

                        Effect.fromURL(data.src).then(e => {
                            data.src = e.grayscale().toURL()
                        })
                    }

                    return id

                }).catch(() => {
                    // noop
                }).finally(() => {
                    this.track--
                })
            )
        },
        checkImages(data = null, type = null)
        {
            type || (type = this.entity)
            data || (data = this.data)

            const k = type === 'cover_list' ? 'cover_id' : 'icon_id'

            if (Array.isArray(data)) {
                data.map(set => this.checkImages(set, type))
            }

            Object.keys(data).forEach(key => {
                if (Array.isArray(data[key]) || isObject(data[key])) {
                    this.checkImages(data[key], type)
                }
                if (key === k && data[key]) {
                    this.promisify(data, k)
                }
            })
        },
        proceed()
        {
            return this.promises.length ? Promise.all(this.promises) : Promise.resolve()
        },
        prepare(data)
        {
            return Object.keys(data).filter(k => !extended.includes(k)).reduce((o, k) => ({ ...o, [k]: data[k] }), {})
        },
        isImaged(type)
        {
            return ['list','match','cover_list','table','tiles'].includes(type || this.entity)
        },
        clearWidget(payload)
        {
            this.$store.commit('widget/clearWidget', payload)
        },
        previewAfterTransition({ group_id, data })
        {
            this.groups_id_freeze = true

            this.onceOnEvent('promises:fulfilled', () => {
                this.groups_id_freeze = false

                delay(700)
                    .then(() => this.openToolDialog(2))
                    .then(() => this.showWidgetPreviewBox())
            })

            this.data = data
            this.group_id = undefined
            this.group_id = group_id
        },
        onceOnEvent(event, callback)
        {
            if (typeof callback !== 'function') return

            const fulfilled = () => {
                this.$bus.$off(event, fulfilled)
                callback()
            }

            this.$bus.$on(event, fulfilled)
        }
    }
}
