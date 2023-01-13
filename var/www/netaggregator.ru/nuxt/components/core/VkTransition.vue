<template>
    <v-card v-if="group" class="vk-transition__container">
        <v-btn @click="$emit('close')" class="vk-transition__cross--btn" aria-label="close" icon>
            <v-icon>mdi-close</v-icon>
        </v-btn>

        <v-card-text class="vk-transition__pane" :class="{ fullscreen }">
            <v-layout column justify-space-between align-center>
                <v-avatar class="group-logo" size="72">
                    <img :src="group.photo_100 || group.photo_50" alt="">
                </v-avatar>

                <h2 class="vk-transition__container--heading">
                    {{ group.name }}
                </h2>
                <p class="vk-transition__container--text">
                    {{ $t('common.need_login') }}
                </p>
                <p class="vk-transition__container--list">
                    {{ $t('common.allow_to') }}
                </p>
            </v-layout>
        </v-card-text>

        <v-card-actions class="vk-transition__actions">
            <v-layout justify-center>
                <v-btn class="shadowless" @click="transition" :color="color" aria-label="go-transition" block>
                    {{ $t('common.transition') }}
                </v-btn>
            </v-layout>
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        props: {
            group: {
                default: null,
                type: Object
            },
            action: {
                default: () => {},
                type: Function
            },
            fullscreen: {
                default: false,
                type: Boolean
            }
        },
        computed: {
            color() {
                return this.$store.state.app.color
            }
        },
        methods: {
            transition()
            {
                const { user } = this.$store.state.app

                this.action()

                window.location.assign(process.env.APP_URI + '_' + user.id)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .v-card.vk-transition__container {
        display: flex;

        flex-direction: column;
        justify-content: space-between;

        h2, p, ul {
            min-width: fit-content;
            max-width: 300px;

            text-align: center;
            word-wrap: normal;
            line-height: 1.4;

            -webkit-font-smoothing: subpixel-antialiased;
            -moz-osx-font-smoothing: auto;
        }
        h2 {
            margin-bottom: 10px;
            font-size: 15px !important;
            font-weight: 500;
            color: #000;
        }
        p, ul {
            margin-top: 0;
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0;
            color: #656565;
        }
        .group-logo {
            border-radius: 50%;
        }
        .vk-transition__cross--btn {
            position: absolute;
            right: 20px;
            top: 20px;

            height: 25px;
            width: 25px;
            margin: 0;

            cursor: pointer;
            color: #828a99;

            &:hover::before {
                background-color: currentColor;
            }
        }
        .vk-transition__pane {
            padding: 30px 15px 10px !important;

            &.fullscreen {
                padding: calc(100% / 3) 5px !important;
            }
            .vk-transition__container--heading {
                margin-top: 10px;
            }
        }
        .v-card__actions.vk-transition__actions {
            padding: 8px 16px 24px;
        }
        &.theme--dark {
            .vk-transition__container--heading {
                color: #656565;
            }
            .vk-transition__actions {
                ::v-deep .v-btn .v-btn__content {
                    color: #7a7a7a;
                }
            }
        }
    }
</style>
