<template>
    <v-dialog v-model="show"
        content-class="ref-dialog"
        :max-width="mobile ? '100%' : '700px'"
        :fullscreen="mobile || force"
        :persistent="force"
        no-click-animation
    >
        <v-card class="ref-dialog__card" :class="{ fullscreen }" elevation="0">
            <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="ref-dialog__btn-wrapper" justify-start>
                    <v-btn @click="show = false" aria-label="close" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs class="ref-dialog__tabs-header" color="grey" height="60px" ref="tabs" hide-slider grow>
                    <v-tab class="middle" @click="toggleState" :ripple="false">
                        {{ $t('toolbar.referrals') }}
                    </v-tab>
                </v-tabs>
            </template>

            <v-card-text class="ref-dialog__card-pane scroller" ref="pane">
                <v-container>
                    <h3>{{ $t('common.referral_orders_percent') }}</h3>

                    <div class="referal-link well">
                        <h3 class="referal-link__heading">
                            {{ $t('common.ref_link') }}
                        </h3>

                        <v-row>
                            <v-col>
                                <v-text-field
                                    :value="link"
                                    :color="color"
                                    :disabled="link === ''"
                                    :placeholder="$t('common.needed')"
                                    append-icon="mdi-content-copy"
                                    @click:append="copy"
                                    hide-details
                                    readonly
                                    solo
                                />
                            </v-col>
                        </v-row>
                    </div>

                    <div class="table well">
                        <h3 class="table__heading">
                            {{ $t('common.statistics') }}
                        </h3>

                        <v-row>
                            <v-col>
                                <v-data-table
                                    :items="table"
                                    :headers="headers"
                                    :dense="mobile"
                                    class="elevation-2"
                                    hide-default-header
                                    hide-default-footer
                                />
                            </v-col>
                        </v-row>
                    </div>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: {
            value: {
                type: Boolean,
                required: true
            }
        },
        model: {
            event: 'toggle',
            prop: 'value'
        },
        computed: {
            link() {
                const { user } = this.$store.state.app

                return user && user.id
                    ? `https://netaggregator.ru/ref/${user.id}`
                    : ''
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            fullscreen() {
                return this.mobile
            },
            color() {
                return this.$store.state.app.color
            },
            headers() {
                const headers = [
                    { text: 'Event', align: 'start', value: 'name' },
                    { text: 'Count', value: 'count' }
                ]

                if (!this.mobile) {
                    headers.splice(1, 0, { text: 'Description', value: 'desc' })
                }

                return headers
            },
            table() {
                let { user } = this.$store.state.app,
                    t = this.$t.bind(this),

                    available = 0,
                    clicked = 0,
                    invited = 0

                if (user) {
                    available = user.available || 0
                    invited = user.invited?.length || 0
                    clicked = user.clicked || 0
                }

                const table = [
                        { name: t('common.clicks'),    count: clicked   },
                        { name: t('common.referrals'), count: invited   },
                        { name: t('common.available'), count: available }
                    ],

                    mixin = [
                        { desc: t('common.link_clicked') },
                        { desc: t('common.registered')   },
                        { desc: t('common.remuneration') }
                    ]

                if (!this.mobile) {
                    table.forEach((t, i) => {
                        t.desc = mixin[i].desc
                    })
                }

                return table
            },
            show: {
                set(v) {
                    this.$emit('toggle', v)
                },
                get() {
                    return this.value
                }
            }
        },
        watch: {
            show: 'update'
        },
        data: () => ({
            smooth: null,
            force: false
        }),
        methods: {
            initScroll()
            {
                if (!this.mobile || this.smooth || !this.$refs.pane) return

                import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                    .then(m => m.default || m)
                    .then(Scrollbar => {
                        this.smooth = Scrollbar(this.$refs.pane, {
                            scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' }
                        })
                    })
            },
            copy()
            {
                if (this.link === '') return

                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(this.link))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            update(show)
            {
                this.initScroll()

                if (!show || this.mobile || this.$store.state.app.vkapp) return

                this.$nextTick().then(() => {
                    this.$refs.tabs?.$el.querySelector('.v-slide-group__prev')?.remove()
                    this.$refs.tabs?.$el.querySelector('.v-slide-group__next')?.remove()
                })
            },
            showRef()
            {
                this.show = true
            },
            toggleState()
            {
                const key = this.mobile ? 'show' : 'force'

                this[key] = !this[key]
            }
        },
        mounted()
        {
            this.$nextTick().then(this.update.bind(this, true))
        }
    }
</script>

<style lang="scss" scoped>
    .v-card.ref-dialog__card {
        .ref-dialog__btn-wrapper {
            max-height: 60px;
            padding: 0 10px;

            ::v-deep .v-btn {
                cursor: pointer;
                margin: 0 5px;

                &:hover::before {
                    background-color: currentColor;
                }
            }
        }
        .ref-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-slide-group__content {
                transition: none;

                .v-tab::before {
                    transition: .3s opacity cubic-bezier(.25,.8,.5,1);
                }
            }
        }
        .v-card__text.ref-dialog__card-pane ::v-deep .scroll-content,
        .v-card__text.ref-dialog__card-pane ::v-deep .os-content,
        .v-card__text.ref-dialog__card-pane {
            padding: 20px;

            &.os-host {
                min-height: calc(100vh - 86px);
            }
        }
        .v-card__text.ref-dialog__card-pane {
            ::v-deep .scrollbar-track.scrollbar-track-y {
                margin-right: 5px;
                background: none;

                .scrollbar-thumb {
                    width: 5px;
                }
            }
            h3 {
                margin-bottom: 16px;
                font-weight: 500;
            }
            .referal-link, .table {
                border: 2px solid #f1f1f1;
                background: #fff;

                &.well {
                    min-height: 20px;
                    margin-bottom: 20px;
                    padding: 19px;

                    background-color: #f5f5f5;
                    border: 1px solid #e3e3e3;
                    border-radius: 4px;

                    box-shadow: inset 0 1px 1px rgb(0 0 0 / 5%);
                }
                .referal-link__heading,
                .table__heading {
                    margin-bottom: 20px;
                    margin-top: 0;
                }
            }
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .ref-dialog__card-pane {
                max-height: calc(100vh - 61px);
                padding: 10px;

                .table.well {
                    padding: 10px;

                    .v-data-table--dense {
                        ::v-deep tr {
                            display: flex;
                            justify-content: space-around;
                            border-bottom: thin solid rgba(0,0,0,.12);

                            td {
                                border-bottom: none;
                            }
                        }
                    }
                }
            }
        }
        &.theme--dark {
            .v-card__text.ref-dialog__card-pane {
                .referal-link, .table {
                    &.well {
                        background-color: #525252;
                    }
                }
            }
            .ref-dialog__tabs-header {
                border-color: #8f8f8f;
            }
        }
    }
    @media all and (min-width: 1265px) {
        .v-card.ref-dialog__card .v-card__text.ref-dialog__card-pane {
            .container {
                max-width: 1185px;
            }
        }
    }
</style>
