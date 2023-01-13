<template>
    <v-dialog-patched
        v-model="show"
        @leave="leave"
        @before-leave="beforeLeave"
        @after-enter="afterEnter"
        content-class="manual__installer--dialog"
        :fullscreen="fullscreen"
        :scrollable="!loading"
        :duration="1000"
        transition="slideY"
        max-width="50%"
    >
        <template #default="dialog">
            <v-card min-height="560px" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
                <v-toolbar :color="color" max-height="64px" dark flat>
                    <v-toolbar-title v-if="!mobile">{{ $t('cover.install') }}</v-toolbar-title>

                    <v-spacer />

                    <v-toolbar-items>
                        <v-btn v-if="mobile" @click="dialog.value = false" elevation="0" icon>
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-btn v-else @click="fullscreen = !fullscreen" elevation="0" icon>
                            <v-icon>{{ fullscreen ? 'mdi-arrow-collapse' : 'mdi-arrow-expand' }}</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-container v-if="groups.length">
                        <v-layout :justify-center="groups.length < 3" :justify-start="groups.length > 2" wrap>
                            <template v-for="(g, i) in groups">
                                <v-col class="card-box" :key="i" lg="4" md="4" sm="12">
                                    <div @click="$emit('apply', g)" class="install__single">
                                        <div class="install__inner">
                                            <v-avatar height="100px" width="100px">
                                                <v-img :src="g.photo" />
                                            </v-avatar>

                                            <h3>{{ g.name }}</h3>
                                        </div>
                                    </div>
                                </v-col>
                            </template>
                        </v-layout>
                    </v-container>
                    <v-container v-if="!groups.length" class="empty">
                        <h3>{{ $t('common.not_managed') }}</h3>
                    </v-container>

                    <div class="footer d-flex justify-center align-center" />
                </v-card-text>

                <div v-show="loading" class="loader">
                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24">
                        <path fill="red" d="M21 11h-.17c-1.053 0-1.958-.669-2.357-1.644l-.021-.049c-.408-.977-.249-2.097.5-2.846l.119-.119a.999.999 0 1 0-1.414-1.414l-.119.119c-.749.749-1.869.908-2.846.5l-.049-.021C13.669 5.128 13 4.218 13 3.165v-.081C13 2.447 12.553 2 12 2s-1 .447-1 1v.036c0 1.096-.66 2.084-1.673 2.503l-.006.003a2.71 2.71 0 0 1-2.953-.588l-.025-.025a.999.999 0 1 0-1.414 1.414l.036.036a2.69 2.69 0 0 1 .583 2.929l-.027.064A2.638 2.638 0 0 1 3.085 11h-.001C2.447 11 2 11.447 2 12s.447 1 1 1h.068a2.66 2.66 0 0 1 2.459 1.644l.021.049a2.69 2.69 0 0 1-.583 2.929l-.036.036a.999.999 0 1 0 1.414 1.414l.036-.036a2.689 2.689 0 0 1 2.929-.583l.143.06A2.505 2.505 0 0 1 11 20.83v.085c0 .638.447 1.085 1 1.085s1-.448 1-1v-.17c0-1.015.611-1.93 1.55-2.318l.252-.104a2.508 2.508 0 0 1 2.736.545l.119.119a.999.999 0 1 0 1.414-1.414l-.119-.119c-.749-.749-.908-1.869-.5-2.846l.021-.049c.399-.975 1.309-1.644 2.362-1.644h.08c.638 0 1.085-.447 1.085-1s-.447-1-1-1zM8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-4.5a2 2 0 1 1 .001-4.001A2 2 0 0 1 14 12z" />
                    </svg>
                </div>
            </v-card>
        </template>
    </v-dialog-patched>
</template>

<script>
    import { VDialogPatched } from '~/utils/v-dialog-patch'

    export default {
        components: {
            VDialogPatched
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
            groups() {
                const { groups = [] } = this.$store.state.app

                return groups.map(({ id, name, photo_50, photo_100, photo_200, photo_400 }) => {
                    return { id, name, photo: photo_400 || photo_200 || photo_100 || photo_50 }
                })
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
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
            afterEnter()
            {
                setTimeout(() => this.fullscreen = this.mobile)
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
    .manual__installer--dialog .v-card {
        .v-toolbar .v-toolbar__items {
            align-items: center;

            .v-btn {
                border-radius: 5px;
                height: 30px !important;
                margin: 0 3px;
            }
        }
        .v-card__text {
            padding: unset !important;

            .container {
                min-height: 93%;

                &.empty {
                    display: grid;
                    place-content: center;
                    height: calc(100% - 65px);
                }
                .card-box {
                    flex: 1 1 100%;

                    .install__single {
                        text-align: center;
                        background-color: #fff;
                        box-shadow: 0 0 30px 0 rgba(0,0,0,.05);
                        padding-bottom: 10px;
                        min-width: unset;

                        cursor: pointer;
                        border: none;

                        .install__inner {
                            padding-bottom: unset;
                            padding-top: 30px;

                            h3 {
                                max-width: 70%;
                                margin: 34px auto;
                                font-size: 2vmax;
                                @extend %ellipsis
                            }
                        }
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
        &.theme--dark {
            .v-card__text {
                background-color: #303030;

                .container {
                    .card-box .install__single {
                        background-color: #262626;
                        border: none;

                        .install__inner {
                            background-color: unset;

                            h3 {
                                color: #aaa;
                            }
                        }
                    }
                }
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
    @media all and (min-width: 1199px) {
        .manual__installer--dialog .v-card {
            .v-card__text .container .card-box {
                .install__single {
                    .install__inner h3 {
                        font-size: 1.5vmax;
                    }
                }
            }
        }
    }
    @media all and (max-width: 1199px) {
        .manual__installer--dialog .v-card {
            .v-card__text .container .card-box {
                width: 100%;
            }
        }
    }
    @media all and (max-width: 420px) {
        .manual__installer--dialog .v-card {
            .v-card__text {
                padding: 0 0 20px !important;

                .container .card-box {
                    padding: 0;
                }
            }
        }
    }
</style>
