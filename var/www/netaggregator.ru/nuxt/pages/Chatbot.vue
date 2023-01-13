<template>
    <v-container class="chatbot-page" fill-height justify-content-center>
        <client-only>
            <swiper :options="options" auto-destroy @ready="onReady">
                <template v-for="m in modules">
                    <swiper-slide :key="m.entity">
                        <lazy-component base="chatbot" @update="updateSwiper" :is="m.cmp" />
                    </swiper-slide>
                </template>
            </swiper>
        </client-only>

        <lazy-chatbot-variables />

        <v-menu v-model="emoji.show"
            :close-on-content-click="false"
            :position-x="emoji.x"
            :position-y="emoji.y"
            :z-index="emoji.z"
            absolute
        >
            <lazy-component :is="picker"
                :dark="$vuetify.theme.dark"
                :show-search="false"
                :emojis-by-row="7"
                @select="choose"
            />
        </v-menu>
    </v-container>
</template>

<script>
    import { context, slide, error } from '~/mixins/common'

    const // description = 'Чатбот - общается с подписчиками вашего сообщества, отвечает на вопросы и выполняет простые просьбы, избавляя администратора от однотипных задач, а подписчиков - от долгого ожидания ответа. Поддерживать активность сообщества 24/7. Иерархическая структура диалогов, медиа вложения, таргетированная рассылка, автосообщения, планирование.',
        description = 'Netaggregator поможет создать и настроить чат бот Вконтакте! Прокачай свое сообщество! Агрегатор инструментов для администрирования.',
        title = 'Чат бот ВКонтакте | Создание чат бота ВКонтакте'

    export default {
        name: 'PageChatbot',

        mixins: [context, slide, error],

        head() {
            return {
                title: this.$t('common.chatbot'),
                meta: [
                    { name: 'description',         hid: 'description',         content: description },
                    { name: 'og:description',      hid: 'og:description',      content: description },
                    { name: 'og:url',              hid: 'og:url',              content: 'https://netaggregator.ru/chatbot' },
                    { name: 'twitter:card',        hid: 'twitter:card',        content: 'summary_large_image' },
                    { name: 'twitter:title',       hid: 'twitter:title',       content: title },
                    { name: 'twitter:description', hid: 'twitter:description', content: description },
                    { name: 'twitter:image',       hid: 'twitter:image',       content: 'https://netaggregator.ru/icon.png' }
                ]
            }
        },
        jsonld()
        {
            return {
                '@context': 'https://schema.org/',
                '@type': 'WebSite',
                name: 'Чатбот',
                url: 'https://netaggregator.ru/chatbot',
                image: 'https://netaggregator.ru/icon.png',
                sameAs: ['http://vk.com/netaggregator'],
                description
            }
        },
        computed: {
            picker() {
                return () => import(/* webpackChunkName: "emoji" */ 'v-emoji-picker').then(m => m.VEmojiPicker)
            },
            presentation() {
                return this.$store.state.app.presentation
            },
            fullscreen() {
                return this.mobile || this.width <= 320 || this.$store.state.app.vkapp
            },
            width() {
                return (this.$store.state.app.window || {}).width || 320
            },
            modules() {
                return this.$store.state.chatbot.modules || []
            },
            emoji() {
                return this.$store.state.chatbot.emoji
            },
            entity: {
                set(entity) {
                    this.$store.commit('chatbot/set', { entity })
                },
                get() {
                    return this.$store.state.chatbot.entity
                }
            }
        },
        watch: {
            // '$store.state.app.tilt': 'toggleTilt',

            entity: 'loadModule'
        },
        data: () => ({
            module: 'chatbot'
        }),
        methods: {
            loadModule()
            {
                return this.$store.dispatch('chatbot/load').then(this.swipe).then(this.updateSwiper)
            },
            close()
            {
                this.$store.commit('chatbot/set', {
                    emoji: { show: false, handler: null, x: this.emoji.x, y: this.emoji.y, z: 0 }
                })
            },
            choose({ data })
            {
                this.emoji.handler(data)

                this.close()
            },
            async initChatbot()
            {
                const doit = await this.$ls.get('doit')

                if (doit && doit.entity) {
                    this.entity = doit.entity
                }

                this.loadModule().finally(() => {
                    this.$bus.$emit('loading:finish')
                })
            }
        },
        mounted()
        {
            this.$on('swiper:ready', this.initChatbot)
        },
        async asyncData({ store })
        {
            await store.dispatch('chatbot/chatsLoad', {})
        }
    }
</script>

<style lang="scss" scoped>
    .chatbot-page {
        justify-content: center;

        ::v-deep .swiper-container {
            height: 100%;

            .swiper-wrapper {
                .v-card.module {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    box-sizing: border-box;
                    min-height: 450px;
                    max-width: 700px;
                    width: 100%;

                    font-size: 13px;

                    .disabled--text {
                        text-align: center;
                        user-select: none;
                        cursor: default;
                    }
                    .v-list {
                        padding: 7px;
                        width: 100%;

                        .v-list__tile {
                            padding: 0 0 0 20px;
                        }
                    }
                    &.empty {
                        align-items: center;

                        & > div:last-child {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            flex: 1 1 380px;
                            width: 100%;
                        }
                    }
                }
            }
        }
    }
    .v-menu__content .emoji-picker {
        background-color: #fff;
        border: none;
        width: 100%;

        &.dark {
            background-color: #1e1e1e;
        }
    }
    @media all and (max-width: 415px) {
        .chatbot-page ::v-deep .chatbot-module {
            .v-card__actions .layout button.v-btn {
                margin: 5px;
                width: 100%;
            }
        }
    }
    @media all and (max-width: 375px) {
        ::v-deep .v-dialog {
            margin: 0 !important;
            width: 100%;
        }
        .chatbot-page {
            padding-right: 0 !important;
            padding-left: 0 !important;
            padding-top: 0 !important;

            ::v-deep .module.chatbot-module {
                width: 100% !important;
            }
        }
    }
</style>
