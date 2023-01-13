<template>
    <v-dialog-patched
        v-model="show"
        @leave="leave"
        @before-leave="beforeLeave"
        @after-enter="afterEnter"
        content-class="basic__payment--dialog"
        :fullscreen="fullscreen"
        :scrollable="true"
        :duration="1000"
        transition="slideY"
        max-width="40%"
    >
        <template #default="dialog">
            <v-card min-height="420px">
                <v-toolbar :color="color" max-height="64px" dark flat>
                    <v-toolbar-title>{{ $t('payment.groups') }}</v-toolbar-title>

                    <v-spacer />

                    <v-toolbar-items>
                        <v-btn @click="dialog.value = false" elevation="0" icon>
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-container>
                        <v-layout :class="{ ...themeClasses, mobile }" justify-center fill-height column>
                            <template v-if="!user">
                                <v-list>
                                    <v-list-item :ripple="false">
                                        <v-list-item-title class="text-center disabled--text">
                                            {{ $t('common.needed') }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </template>
                            <template v-else-if="groups.length">
                                <v-list>
                                    <template v-for="item in groups">
                                        <v-list-item @click="choose(item)" :ripple="false" :key="item.id">
                                            <v-list-item-avatar :key="item.id">
                                                <v-img :src="item.photo_200 || item.photo_100 || item.photo_50" />
                                            </v-list-item-avatar>

                                            <v-list-item-title :class="`${item.token ? color : 'disabled'}--text`">
                                                {{ item.name | spoof(_self) }}
                                            </v-list-item-title>
                                        </v-list-item>
                                    </template>
                                </v-list>
                            </template>
                            <template v-else-if="nocommunity">
                                <v-list>
                                    <v-list-item :ripple="false">
                                        <v-list-item-title class="text-center disabled--text">
                                            {{ $t('common.nocommunity') }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </template>
                            <template v-else>
                                <v-list>
                                    <v-list-item :ripple="false">
                                        <v-list-item-title class="text-center disabled--text">
                                            {{ $t('common.not_managed') }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </template>
                        </v-layout>
                    </v-container>
                </v-card-text>
            </v-card>
        </template>
    </v-dialog-patched>
</template>

<script>
    import { VDialogPatched } from '~/utils/v-dialog-patch'
    import { spoof } from '~/utils/common/spoof.mjs'
    import { community } from '~/mixins/common'

    export default {
        mixins: [community],

        components: {
            VDialogPatched
        },
        filters: {
            spoof
        },
        props: {
            value: {
                type: Boolean,
                default: false
            }
        },
        model: {
            event: 'input',
            prop: 'value'
        },
        computed: {
            themeClasses() {
                return { [`theme--${this.$vuetify.theme.dark ? 'dark' : 'light'}`]: true }
            },
            color() {
                return this.$vuetify.theme.dark ? 'accent' : this.$store.state.app.color
            },
            nocommunity() {
                return this.$store.state.app.user && !this.groups.length
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            show: {
                set(value) {
                    this.$emit('input', value)
                },
                get() {
                    return this.value
                }
            }
        },
        watch: {
            value(v) {
                v && (this.loading = v) && this.init()
            }
        },
        data: () => ({
            fullscreen: false,
            loading: false
        }),
        methods: {
            choose(item)
            {
                this.$emit('choose', item)
                this.show = false
            },
            afterEnter()
            {
                setTimeout(() => this.fullscreen = this.mobile || this.$store.state.app.vkapp)
            },
            beforeLeave()
            {
                this.fullscreen = false
            },
            leave(el, done)
            {
                setTimeout(done, 1e3)
            },
            async init()
            {
                await this.$nextTick()

                this.loading = false
            }
        }
    }
</script>

<style lang="scss">
    %ellipsis {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    .basic__payment--dialog .v-card {
        .v-toolbar .v-toolbar__items {
            align-items: center;

            .v-btn {
                border-radius: 5px;
                height: 38px !important;
                margin: 0 10px;
            }
        }
        .v-card__text {
            padding: 20px 0 !important;

            .container {
                &.empty {
                    display: grid;
                    place-content: center;
                    height: calc(100% - 65px);
                }
                .layout .v-list {
                    padding: 0;

                    .v-list-item .v-list-item__title {
                        @extend %ellipsis
                    }
                }
            }
        }
        .loader {
            position: absolute;
            z-index: 99;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            display: grid;
            place-items: center;
            background-color: #fafbfd;
            font-size: 10rem;

            svg {
                animation: loader 1s infinite;
            }
        }
    }

    .slideY-enter-active {
        animation: slideYIn 1s ease;
    }
    .slideY-leave-active {
        animation: slideYOut 1s ease;
    }
    @keyframes slideYIn {
        from {
            opacity: 0;
            transform: translateY(-50vh);
        }
        70% {
            opacity: 1;
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes slideYOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        90% {
            opacity: 0;
        }
        to {
            opacity: 0;
            transform: translateY(-50vh);
        }
    }
    @media all and (max-width: 1199px) {
        .custom__payment--dialog .v-card {
            .v-card__text .container {
                width: 100%;
            }
        }
    }
    @media all and (max-width: 420px) {
        .custom__payment--dialog .v-card {
            .v-card__text {
                padding: 0 0 20px !important;

                .container {
                    padding: 0;
                }
            }
        }
    }
</style>
