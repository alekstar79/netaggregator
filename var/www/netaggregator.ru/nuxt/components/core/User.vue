<template>
    <v-container @mouseenter="$emit('mouseenter')" @mouseleave="$emit('mouseleave')" class="user-menu">
        <v-system-bar v-if="fullscreen && $store.state.app.vkapp" :color="barColor" height="10px" />

        <v-layout column>
            <v-flex v-schema:scope="{ type: 'Person' }" class="mt-1" :key="action">
                <v-flex v-if="fullscreen">
                    <v-layout class="vk-transition" justify-start>
                        <v-btn @click="close" class="vk-transition__cross--btn" aria-label="close" icon>
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-layout>
                </v-flex>

                <v-avatar class="user-menu__avatar" size="130">
                    <img v-schema="{ prop: 'image' }" :src="avatar" :alt="name">
                </v-avatar>

                <v-card-text class="text-center">
                    <h4 v-schema="{ prop: 'name' }" class="card-title" v-text="name" />

                    <p class="card-description">{{ status }}</p>

                    <v-btn
                        v-if="presence"
                        class="shadowless v-btn--round mb-0"
                        aria-label="auth-reload"
                        :color="color"
                        @click="auth"
                    >
                        {{ $t(`common.${
                            !fail && user
                                ? 'logout'
                                : reload
                                    ? 'reload'
                                    : 'login'
                        }`) }}
                    </v-btn>
                </v-card-text>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import quotes from '~/assets/data/quotes'
    import { login } from '~/mixins/common'

    import random from 'lodash/random'

    export default {
        mixins: [login],

        props: {
            fullscreen: {
                default: false,
                type: Boolean
            }
        },
        computed: {
            name() {
                return this.user ? `${this.user.first_name} ${this.user.last_name}` : this.$t('common.guest')
            },
            status() {
                return  this.user && this.user.status ? this.getStatus() : this.getQuote()
            },
            barColor() {
                return this.$vuetify.theme.dark ? 'transparent' : '#f5f5f5'
            },
            avatar() {
                const ava = '/img/avatars/m01r_130.png'

                return this.user
                    ? this.user.photo_200 || this.user.photo_100 || ava
                    : ava
            },
            color() {
                return this.$store.state.app.color
            },
            owner() {
                return this.$store.state.app.owner
            },
            fake() {
                return this.$store.state.app.fake
            }
        },
        methods: {
            getStatus()
            {
                return this.user.status.replace(/[-—=*#@\s]+/g, ' ').trim().substr(0, 52) + '…'
            },
            getQuote()
            {
                return quotes[random(0, quotes.length - 1)]
            }
        }
    }
</script>

<style lang="scss" scoped>
    .container.user-menu {
        .vk-transition__cross--btn {
            cursor: pointer;
            color: #828a99;

            &:hover::before {
                background-color: currentColor;
            }
        }
        .layout .flex {
            .user-menu__avatar {
                display: block;
                margin: 0 auto;
                cursor: pointer;
            }
        }
        .v-card__text.text-center {
            padding-top: 16px;

            h4.card-title {
                margin-bottom: .75rem;
                font-size: 1.2rem;
                font-weight: 400;
                line-height: 1.5em;
                margin-top: 10px;
            }
            p.card-description {
                font-size: 1rem;
                font-weight: 400;
                line-height: 1.4;
                color: #999;
            }
            .v-btn.shadowless {
                margin: 10px 1px;
                padding: 12px 30px;
                height: auto;

                border-radius: 30px;
                line-height: 1.5em;
                cursor: pointer;
            }
        }
    }
</style>
