<template>
    <v-layout justify-center fill-height>
        <material-card class="module cover-module templates"
            :class="{ empty: !$store.state.cover.templates.length }"
            :color="color"
            elevation="2"
            offset="12"
            full-width
            ref="card"
        >
            <template #header>
                <v-layout class="cover-header" justify-space-between>
                    <lazy-core-hint :hint="{ entity: 'cover', id: 1 }" class="cover-header__title pa-3">
                        {{ $t('cover.templates') }}
                    </lazy-core-hint>

                    <div class="cover-header__controls">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click.stop="sort = !sort" aria-label="sort-toggle" icon>
                                    <v-icon>{{ sort ? 'mdi-sort-descending' : 'mdi-sort-ascending' }}</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.sort') }}</span>
                        </v-tooltip>

                        <v-menu open-on-click>
                            <template #activator="{ attrs, on: menu }">
                                <v-tooltip :disabled="mobile" nudge-bottom="40">
                                    <template #activator="{ on: tooltip }">
                                        <v-btn v-bind="attrs" v-on="{ ...menu, ...tooltip }" aria-label="tags" icon>
                                            <v-icon>mdi-tag-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>{{ $t('tooltip.tag_filter') }}</span>
                                </v-tooltip>
                            </template>

                            <v-list>
                                <template v-for="({ value }, i) in tags">
                                    <v-list-item @click="current = tags[i]"
                                        :disabled="value === current.value"
                                        :key="`${value}-${i}`"
                                        link
                                    >
                                        <v-list-item-title v-text="$t(`cover.${value}`)" />
                                    </v-list-item>
                                </template>
                            </v-list>
                        </v-menu>

                        <template v-if="allowed">
                            <v-tooltip :disabled="mobile" nudge-bottom="40">
                                <template #activator="{ on }">
                                    <v-btn v-on="on" @click.stop="clearCache" aria-label="clear-cache" icon>
                                        <v-icon>mdi-sync</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ $t('tooltip.clear_cache') }}</span>
                            </v-tooltip>
                        </template>

                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click.stop="addTemplate" aria-label="add-template" icon>
                                    <v-icon>mdi-plus-circle-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.add_template') }}</span>
                        </v-tooltip>
                    </div>
                </v-layout>
            </template>

            <cover-templates-list :filter="current" :order="order" />
        </material-card>
    </v-layout>
</template>

<script>
    import { zoomPan } from '~/utils/renderer.mjs'
    import { cache } from '~/mixins/common'

    const tags = [
        { value: 'all'      },
        { value: 'popular'  },
        { value: 'business' },
        { value: 'club'     },
        { value: 'holiday'  },
        { value: 'urban'    },
        { value: 'event'    },
        { value: 'game'     },
        { value: 'brand'    },
        { value: 'person'   },
        { value: 'sport'    },
        { value: 'shop'     },
        { value: 'studio'   },
        { value: 'travel'   }
    ]

    export default {
        mixins: [cache],

        computed: {
            order: {
                set(order) {
                    this.$store.commit('cover/set', { order })
                },
                get() {
                    return this.$store.state.cover.order
                }
            },
            sort: {
                set(order) {
                    this.order = order ? 'asc' : 'desc'
                },
                get() {
                    return this.order === 'asc'
                }
            },
            allowed() {
                const list = [25520481, 465174119, 466483621, 486939909],
                    { user } = this.$store.state.app

                return user && list.includes(user.id)
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            current() {
                this.$nextTick(() => { this.$emit('update') })
            }
        },
        data: () => ({
            discard: () => {},
            current: tags[0],
            tags
        }),
        methods: {
            addTemplate()
            {
                this.$bus.$emit('snack', { content: 'common.develop', color: 'success' })
            }
        },
        mounted()
        {
            this.$emit('update')

            this.$nextTick(() => { try {
                this.discard = zoomPan(this.$refs.card.$el)
            } catch (e) {
            } })
        }
    }
</script>

<style lang="scss" scoped>
    .cover-module {
        .cover-header {
            align-items: center;
            min-height: 55px;

            .cover-header__title {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                font-size: 16px;

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
        &.theme--dark {
            .cover-header {
                color: #7a7a7a;

                ::v-deep .v-btn.v-btn--icon {
                    color: #7a7a7a;
                }
            }
        }
    }
</style>
