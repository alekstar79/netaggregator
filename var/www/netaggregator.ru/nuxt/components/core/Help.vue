<template>
    <v-card class="help-dialog__card" :class="{ fullscreen }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="help-dialog__btn-wrapper" justify-start>
                <v-btn @click="$emit('close')" aria-label="close" icon>
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
                <v-btn v-if="!hint" @click="$emit('prev')" aria-label="prev" icon>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn v-if="!hint" @click="$emit('next')" aria-label="next" icon>
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs color="grey" class="help-dialog__tabs-header" height="60px" ref="tabs" hide-slider grow>
                <template v-if="!hint && !mobile">
                    <v-tab class="prev" @click="$emit('prev')" :ripple="false">
                        <v-icon>mdi-chevron-left</v-icon>
                    </v-tab>
                </template>
                <v-tab class="middle" @click="$emit('middle')" :ripple="false">
                    {{ $t(`help.${module.tab}_tab`) }}
                </v-tab>
                <template v-if="!hint && !mobile">
                    <v-tab class="next" @click="$emit('next')" :ripple="false">
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-tab>
                </template>
            </v-tabs>
        </template>

        <v-card-text class="help-dialog__card-pane">
            <slot />
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        props: {
            fullscreen: {
                type: Boolean,
                required: true
            },
            module: {
                type: Object,
                required: true
            },
            hint: {
                type: Boolean,
                required: true
            }
        },
        computed: {
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        mounted()
        {
            this.$nextTick().then(() => {
                if (!this.mobile || !this.$store.state.app.vkapp) {
                    this.$refs.tabs.$el.querySelector('.v-slide-group__prev').remove()
                    this.$refs.tabs.$el.querySelector('.v-slide-group__next').remove()
                }
            })

            this.$emit('update')
        }
    }
</script>

<style lang="scss" scoped>
    .v-card.help-dialog__card {
        .help-dialog__btn-wrapper {
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
        .help-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tab.prev {
                max-width: 15%;
            }
            ::v-deep .v-tab.next {
                max-width: 15%;
            }
        }
        .v-card__text.help-dialog__card-pane {
            min-height: 540px;
            padding: 15px 0 15px 15px;

            ::v-deep .swiper-container {
                .swiper-slide {
                    min-height: 510px;
                    max-height: 510px;
                    height: 100%;

                    .scrollbar-track {
                        border-radius: 4px;
                        background: unset;
                        width: 14px;

                        &.scrollbar-track-x {
                            display: none !important;
                        }
                        &.scrollbar-track-y {
                            cursor: pointer;
                        }
                        .scrollbar-thumb-y {
                            margin-left: 2px;
                            width: 6px;
                        }
                    }
                }
            }
            ::v-deep .pane.scroller {
                padding-right: 15px;

                &.os-host-overflow {
                    max-height: 100%;
                }
                .container {
                    h2 {
                        margin-bottom: 10px;
                    }
                    p {
                        font-size: 16px;
                    }
                    .pane__images {
                        cursor: pointer;

                        &.justify-flex {
                            flex-direction: column;

                            .v-image {
                                max-width: 100%;
                                margin: 5px 0;
                            }
                        }
                    }

                    &:not(.mobile) {
                        p:not(.pane__topic-closing) {
                            text-align: justify;
                        }
                    }
                    &:not(.fullscreen) {
                        max-width: 97%;
                    }
                    &.mobile {
                        .pane__images.justify-flex {
                            flex-direction: column;
                        }
                    }
                    &.fullscreen:not(.mobile) {
                        width: unset;

                        .pane__images {
                            max-width: 450px;
                            min-width: 250px;
                            width: 50%;

                            &.justify-flex {
                                flex-direction: row;
                                justify-content: space-around;
                                min-width: unset;
                                max-width: 100%;
                                width: unset;

                                .v-image {
                                    display: flex;
                                    max-width: 420px;
                                    margin: 10px;
                                }
                            }
                            &.right {
                                float: right;
                                margin-left: 10px;
                            }
                            &.left {
                                float: left;
                                margin-right: 10px;
                            }
                            &.pc2 .v-image {
                                max-width: 50%;
                            }
                            &.pc3 .v-image {
                                max-width: 30%;
                            }
                            &.pc4 .v-image {
                                max-width: 25%;
                            }
                        }
                    }
                }
                .clearfix::after {
                    display: flow-root;
                    content: '';
                    clear: both;
                }
            }
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .help-dialog__card-pane {
                max-height: calc(100vh - 61px);

                ::v-deep .swiper-container .swiper-slide {
                    height: calc(100vh - 81px);
                    min-height: unset;
                    max-height: unset;
                }
            }
        }
        &.theme--dark {
            .help-dialog__tabs-header {
                border-color: #8f8f8f;
            }
            .v-card__text.help-dialog__card-pane {
                ::v-deep .swiper-container .swiper-slide {
                    .scrollbar-track {
                        .scrollbar-thumb-y {
                            background: #424242;
                        }
                    }
                }
            }
        }
    }
    @media all and (max-width: 700px) {
        .v-card.help-dialog__card .v-card__text.help-dialog__card-pane {
            ::v-deep .pane.scroller .container {
                &.fullscreen {
                    .pane__images {
                        float: unset;
                        margin-right: unset;
                        margin-left: unset;
                        max-width: unset;
                        min-width: 100%;
                        width: 100%;
                    }
                }
            }
        }
    }
    @media all and (min-width: 1265px) {
        .v-card.help-dialog__card .v-card__text.help-dialog__card-pane {
            ::v-deep .pane.scroller .container {
                max-width: 1185px;
            }
        }
    }
    @media all and (max-width: 1265px) {
        .v-card.help-dialog__card .v-card__text.help-dialog__card-pane {
            ::v-deep .pane.scroller .container {
                &.fullscreen {
                    .pane__images.justify-flex {
                        max-width: 100%;
                    }
                }
            }
        }
    }
</style>
