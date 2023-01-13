<template>
    <v-layout justify-center fill-height>
        <material-card class="module cover-module covers-list"
            :class="{ empty: !user || !list.length }"
            :color="color"
            elevation="2"
            offset="12"
            full-width
            ref="card"
        >
            <template #header>
                <v-layout class="cover-header" :justify-space-between="!mobile || !editor" :justify-end="mobile && editor" wrap>
                    <lazy-core-hint v-if="!mobile || !editor" :hint="{ entity: 'cover', id: 0 }" class="cover-header__title pa-3">
                        {{ editor ? title || 'No name' : $t('cover.list') }}
                    </lazy-core-hint>

                    <div v-if="editor" class="cover-header__controls">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="showInstallerDialog = true" aria-label="installer" icon>
                                    <v-icon dense>mdi-check</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.install') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="edit" aria-label="edit" icon>
                                    <v-icon dense>mdi-pencil-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.edit') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="editor = null" aria-label="editor" icon>
                                    <lazy-helper-return :fill="fill" />
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.return') }}</span>
                        </v-tooltip>
                    </div>
                    <div v-else class="cover-header__controls">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="reload" :disabled="!user" aria-label="reload" icon>
                                    <v-icon dense>mdi-sync</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.reload') }}</span>
                        </v-tooltip>
                    </div>
                </v-layout>
            </template>

            <v-layout justify-center>
                <lazy-cover-editor v-if="editor" v-on="$listeners" ref="editor" />
                <lazy-cover-covers-list v-else-if="user" v-on="$listeners" />

                <v-list v-else class="covers-list">
                    <v-list-item :ripple="false">
                        <v-list-item-title class="text-center disabled--text">
                            {{ $t('common.needed') }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-layout>
        </material-card>

        <cover-manual-installer v-model="showInstallerDialog" @apply="manual" />
    </v-layout>
</template>

<script>
    import { debounce } from '~/utils/common/debounce.mjs'
    import { zoomPan } from '~/utils/renderer.mjs'

    export default {
        computed: {
            editor: {
                get() {
                    return this.$store.state.cover.idx !== null
                },
                set(idx) {
                    this.$store.commit('cover/set', { idx })
                }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            cover() {
                const { idx, list } = this.$store.state.cover

                return list[idx] || {}
            },
            title() {
                return this.cover.name || ''
            },
            list() {
                return this.$store.state.cover.list
            },
            fill() {
                return this.$vuetify.theme.dark ? '#8f8f8f' : '#fff'
            },
            color() {
                return this.$store.state.app.color
            },
            user() {
                return this.$store.state.app.user
            }
        },
        data: () => ({
            discard: () => {},

            showInstallerDialog: false,
            settings: false
        }),
        methods: {
            async manual({ id })
            {
                this.showInstallerDialog = false

                let doc, data, status

                try {

                    if (!(doc = Object.keys(this.cover).reduce(
                        (c, k) => ({ ...c, [k === '_id' ? 'hash' : k]: this.cover[k] }),
                        { connections: [], manual: true }

                    )).connections.includes(id)) {
                        doc.connections.push(id)
                    }

                    ({ data, status } = await this.$store.dispatch('cover/save', { doc }))

                    if (status === 200 && data.set === this.cover._id) {
                        return this.$bus.$emit('snack', { content: 'cover.add_to_rendering', color: 'success' })
                    }

                } catch (e) {
                }

                this.$bus.$emit('snack', {
                    content: 'cover.internal_error',
                    color: 'error',
                    raw: true
                })
            },
            edit: debounce(function()
            {
                this.$refs.editor && this.$refs.editor.startEdit()

            }, 0),
            reload(p)
            {
                this.$store.dispatch('cover/coversLoad', p)
            },
            exit()
            {
                this.editor = null
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('settings:reload', this.exit)
            this.$bus.$off('cover:edit', this.edit)

            this.discard()
        },
        mounted()
        {
            this.exit = this.exit.bind(this)
            this.edit = this.edit.bind(this)

            this.$bus.$on('settings:reload', this.exit)
            this.$bus.$on('cover:edit', this.edit)

            this.$emit('update')

            this.$nextTick(() => { try {
                this.discard = zoomPan(this.$refs.card.$el)
            } catch (e) {
            } })
        },
        created()
        {
            const { idx, list } = this.$store.state.cover

            list[idx] || this.exit()
        }
    }
</script>

<style lang="scss" scoped>
    .cover-module {
        .cover-header {
            align-items: center;
            min-height: 55px;

            .cover-header__title {
                font-size: 16px;

                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;

                ::v-deep .v-avatar {
                    margin-right: 5px;
                }
            }
            .cover-header__controls {
                display: flex;
                flex-wrap: wrap;
                font-weight: 500;
                padding: 0 7px;

                ::v-deep .v-btn.v-btn--icon {
                    height: 41px;
                    width: 41px;
                    margin: 0;

                    &:hover::before {
                        background-color: currentColor;
                        opacity: .3;
                    }
                    .v-icon {
                        font-size: 20px;
                    }
                }
            }
        }
        ::v-deep .v-btn:hover::before {
            background-color: currentColor;
        }
        &.theme--dark {
            .cover-header {
                color: #7a7a7a;

                ::v-deep .v-btn.v-btn--icon {
                    color: #7a7a7a;
                }
            }
            .v-list.covers-list .v-list-item {
                .v-list-item__title {
                    color: #7a7a7a !important;
                }
            }
        }
    }
</style>
