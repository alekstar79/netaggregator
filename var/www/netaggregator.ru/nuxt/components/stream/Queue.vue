<template>
    <v-layout justify-center fill-height>
        <material-card class="module stream-module"
            :class="{ empty: !user || !data.length, [entity]: true }"
            :color="color"
            elevation="2"
            offset="12"
            full-width
            ref="card"
        >
            <template #header>
                <v-layout class="stream-header" justify-space-between wrap>
                    <lazy-core-hint :hint="{ entity: 'stream', id: stream ? 0 : 1 }" class="stream-header__title pa-3">
                        {{ $t(title) }}
                    </lazy-core-hint>

                    <div v-if="stream" class="stream-header__controls">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" :disabled="!user" @click="$emit('settings')" aria-label="settings" icon>
                                    <v-icon dense>mdi-cog</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.settings') }}</span>
                        </v-tooltip>
                    </div>
                </v-layout>
            </template>

            <v-list v-if="user && data.length" three-line>
                <template v-for="(item, i) in data">
                    <v-list-item @click="followLink(item, $event)" :class="{ divider: data[i+1] }" :key="`${entity}-${i}`" :ripple="false">
                        <v-list-item-title>{{ item.cut }}</v-list-item-title>

                        <v-btn @click.stop="bookmarkHandler(item)" :aria-label="action" :color="color" icon>
                            <v-icon dense>{{ action }}</v-icon>
                        </v-btn>

                        <v-btn @click.stop="detailedHandler(item)" aria-label="view" :color="color" icon>
                            <v-icon dense>mdi-eye-outline</v-icon>
                        </v-btn>
                    </v-list-item>
                </template>
            </v-list>
            <v-list v-else-if="user">
                <v-list-item :class="{ divider: false }" :ripple="false">
                    <v-list-item-title class="disabled--text">
                        {{ $t('stream.empty') }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
            <v-list v-else>
                <v-list-item :class="{ divider: false }" :ripple="false">
                    <v-list-item-title class="disabled--text">
                        {{ $t('common.needed') }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </material-card>
    </v-layout>
</template>

<script>
    import { zoomPan } from '~/utils/renderer.mjs'
    import common  from '~/mixins/stream/common'

    export default {
        mixins: [common],

        props: {
            entity: {
                default: 'stream',
                type: String
            }
        },
        computed: {
            action() {
                return this.stream ? 'mdi-playlist-plus' : 'mdi-playlist-minus'
            },
            title() {
                return this.stream ? 'stream.stream' : 'stream.bookmark'
            },
            stream() {
                return this.entity === 'stream'
            },
            data() {
                return this.$store.state.socket[this.entity] || []
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            user() {
                return this.$store.state.app.user
            }
        },
        data: () => ({
            discard: () => {}
        }),
        watch: {
            data() {
                this.$emit('update')
            }
        },
        methods: {
            bookmarkHandler(item)
            {
                if (!this.user) return

                this.$store.commit(
                    `socket/${this.stream ? 'addToHistory' : 'removeFromHistory'}`,
                    item
                )
            },
            detailedHandler(item)
            {
                this.$store.commit('socket/setDetailed', item)

                this.$emit('detailed')
            }
        },
        beforeDestroy()
        {
            this.discard()
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
    .stream-module {
        .stream-header {
            align-items: center;
            min-height: 55px;

            .stream-header__title {
                font-size: 16px;
            }
            .stream-header__controls {
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
            .stream-header {
                color: #7a7a7a;

                .v-btn.v-btn--icon {
                    color: #7a7a7a;
                }
            }
            .v-card__text .v-list {
                .v-list-item {
                    color: #7a7a7a !important;
                }
            }
        }
        ::v-deep .v-list {
            padding: 7px;
            width: 100%;

            .v-list-item {
                min-height: unset;
                padding: 0 10px;

                &.divider {
                    border-bottom: 1px solid #ccc;
                }
                .v-btn.v-btn--icon {
                    height: 41px;
                    width: 41px;
                    margin: 5px;
                }
            }
            &.theme--dark {
                .v-list-item.divider {
                    border-bottom: 1px solid rgba(73,73,73,.7);
                }
            }
        }
        ::v-deep .v-btn:hover::before {
            background-color: currentColor;
        }
    }
</style>
