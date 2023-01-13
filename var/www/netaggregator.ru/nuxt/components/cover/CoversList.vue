<template>
    <v-list class="covers-list">
        <template v-if="list.length">
            <template v-for="(item, i) in list">
                <v-list-item
                    @click.stop="$set(stub, i, { rename: true })"
                    v-click-outside="clickOutside.bind(_self, i)"
                    :key="item._id"
                    :ripple="false"
                >
                    <v-text-field v-if="stub[i].rename" v-model.trim="item.name" :color="color" />
                    <v-list-item-title v-else v-text="item.name" :class="`${color}--text`" />

                    <v-btn @click.stop="idx = i" :color="color" aria-label="edit" icon>
                        <v-icon dense>mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn @click.stop="copy(item, i)" :color="color" aria-label="copy" icon>
                        <v-icon dense>mdi-content-copy</v-icon>
                    </v-btn>

                    <v-btn @click.stop="remove(item, i)" :color="color" aria-label="delete" icon>
                        <v-icon dense>mdi-trash-can-outline</v-icon>
                    </v-btn>
                </v-list-item>
            </template>
        </template>
        <template v-else>
            <v-list-item :class="{ divider: false }" :ripple="false">
                <v-list-item-title class="disabled--text text-center">
                    {{ $t('cover.new-cover') }}
                </v-list-item-title>
            </v-list-item>
        </template>

        <v-list-item @click="create" :ripple="false">
            <v-list-item-title class="text-center">
                <v-icon :color="color">mdi-plus-circle-outline</v-icon>
            </v-list-item-title>
        </v-list-item>
    </v-list>
</template>

<script>
    import { debounce } from '~/utils/common/debounce.mjs'
    import { setname } from '~/utils/cover'

    import cloneDeep from 'lodash/cloneDeep'
    import summ from 'hash-sum'

    const ERROR = {
        REMOVE: { content: 'Remove error', color: 'error', raw: true },
        RENAME: { content: 'Rename error', color: 'error', raw: true },
        COPY:   { content: 'Copy error',   color: 'error', raw: true }
    }

    export default {
        computed: {
            reload: {
                set(reload) {
                    this.$store.commit('cover/set', { reload })
                },
                get() {
                    return this.$store.state.cover.reload
                }
            },
            list: {
                set(list) {
                    this.$store.commit('cover/set', { list })
                },
                get() {
                    return this.$store.state.cover.list
                }
            },
            idx: {
                set(idx) {
                    this.$store.commit('cover/set', { idx })
                },
                get() {
                    return this.$store.state.cover.idx
                }
            },
            locale() {
                return this.$store.state.app.locale
            },
            color() {
                return this.$store.state.app.color
            }
        },
        data: () => ({
            modify: -1,
            stub: []
        }),
        watch: {
            list: 'clear',
            stub: {
                handler: 'track',
                deep: true
            }
        },
        methods: {
            clickOutside(i)
            {
                this.stub[i] && this.$set(this.stub, i, { rename: false })
            },
            create()
            {
                this.$store.commit('cover/createCover', {
                    name: +new Date(),
                    callback: ({ data }) => {
                        if (!data.set) return

                        this.$store.dispatch('cover/coversLoad')
                            .then(this.clear.bind(this))
                            .then(() => {
                                this.$set(this.stub, this.stub.length - 1, { rename: true })
                            })
                    }
                })
            },
            async copy(item, idx)
            {
                const list = this.list.slice(),
                    $new = cloneDeep(item),

                    name = setname($new.name, this.locale)

                $new.connections = []
                $new.name = name

                const { copy, _id } = await this.$store.dispatch('cover/copy', { item: $new, name })

                if (!copy || !_id) {
                    return this.$bus.$emit('snack', ERROR.COPY)
                }

                $new._id = _id

                list.splice(idx + 1, 0, $new)

                this.list = list
            },
            async remove(item, idx)
            {
                const { remove } = await this.$store.dispatch('cover/remove', item)

                if (!remove) {
                    return this.$bus.$emit('snack', ERROR.REMOVE)
                }

                const list = this.list.slice()

                list.splice(idx, 1)

                this.list = list

                this.$bus.$emit('snack', { content: 'common.removed', color: 'success' })
            },
            async rename(idx)
            {
                let doc, set, error

                if ((doc = this.list[idx])) {
                    ({ data: { set, error } } = await this.$store.dispatch('cover/save', {
                        doc: Object.keys(doc).reduce((c, k) => {
                            const key = k === '_id' ? 'hash' : k

                            return { ...c, [key]: doc[k] }

                        }, { connections: [] })
                    }))
                }

                if (doc && (!set || error)) {
                    return this.$bus.$emit('snack', ERROR.RENAME)
                }
            },
            clear()
            {
                this.$set(this, 'stub', Array.from(this.list, () => ({ rename: false })))
            },
            async preload()
            {
                try {

                    await this.$nextTick()

                    this.list.forEach(item => {
                        if (!item.background) return

                        (new Image()).src = `/dcover/${item.uid}/${item._id}/template.png&${
                            summ({ ...item, hash: this.reload })
                        }`
                    })

                } catch (e) {
                }
            },
            track: debounce(function(stub) {
                const modify = stub.findIndex(s => s.rename)

                if (this.modify > -1 && modify === -1) {
                    this.rename(this.modify)
                }

                this.modify = modify

            }, 100)
        },
        mounted()
        {
            this.preload().then(() => this.$emit('update'))
        },
        created()
        {
            this.clear()
        }
    }
</script>

<style lang="scss" scoped>
    .v-list.covers-list {
        .v-list-item {
            min-height: 48px;

            ::v-deep .v-btn.v-btn--icon {
                width: 41px;
                height: 41px;
                line-height: 41px;

                margin: 5px auto;
                padding: 0;

                &:hover::before {
                    background-color: currentColor;
                }
                .v-icon {
                    font-size: 20px !important;
                }
            }
            &.theme--dark {
                .v-list-item__title,
                .v-btn {
                    color: #7a7a7a !important;
                }
            }
        }
    }
</style>
