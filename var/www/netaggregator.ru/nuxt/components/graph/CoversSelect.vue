<template>
    <v-card class="covers-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="covers-dialog__btn-wrapper" justify-start>
                <v-btn @click="close" icon>
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs :color="color" class="covers-dialog__tabs-header" height="60px" hide-slider grow>
                <v-tab @click="close" :ripple="false">
                    {{ $t('graph.templates') }}
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="covers-dialog__card-pane scroller" ref="pane">
            <cover-templates-list :designer="true" />
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        data: () => ({
            smooth: null
        }),
        methods: {
            initScroll()
            {
                if (this.smooth || !this.$refs.pane) return

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar(this.$refs.pane, {
                                scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' }
                            })
                        })

                } else {
                    import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar.init(this.$refs.pane, {
                                damping: this.mobile ? .1 : 1,
                                continuousScrolling: false
                            })

                            this.smooth.updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                }
            },
            close()
            {
                this.$emit('close')
            }
        },
        mounted()
        {
            this.$nextTick().then(this.initScroll)
        }
    }
</script>

<style lang="scss" scoped>
    .covers-dialog__card {
        height: 100%;

        .covers-dialog__btn-wrapper {
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
        .covers-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;
        }
        .covers-dialog__card-pane ::v-deep .scroll-content,
        .covers-dialog__card-pane ::v-deep .os-content,
        .covers-dialog__card-pane {
            max-height: calc(100% - 61px);

            &.os-host {
                min-height: calc(100vh - 61px);
            }
        }
        .covers-dialog__card-pane {
            padding: 15px 15px 0 !important;

            ::v-deep .scrollbar-track.scrollbar-track-y {
                margin-right: 2px;
                background: none;

                .scrollbar-thumb {
                    width: 5px;
                }
            }
        }
        &.theme--dark {
            .covers-dialog__tabs-header {
                border-color: #8f8f8f;
            }
            .covers-dialog__card-pane {
                ::v-deep .scrollbar-track.scrollbar-track-y {
                    .scrollbar-thumb {
                        background: #424242;
                    }
                }
            }
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .covers-dialog__card-pane {
                max-height: calc(100vh - 61px);
            }
        }
    }
</style>
