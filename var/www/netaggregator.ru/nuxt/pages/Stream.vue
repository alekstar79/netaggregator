<template>
    <v-container class="stream-page" fill-height justify-content-center>
        <client-only>
            <swiper :options="options" auto-destroy @ready="onReady">
                <template v-for="m in modules">
                    <swiper-slide :key="m.entity">
                        <lazy-component base="socket"
                            @detailed="open('stream-detailed')"
                            @settings="open('stream-settings')"
                            @update="updateSwiper"
                            :entity="m.entity"
                            :is="m.cmp"
                        />
                    </swiper-slide>
                </template>
            </swiper>
        </client-only>

        <v-dialog :fullscreen="fullscreen" content-class="stream-dialog" max-width="700px" ref="dialog">
            <lazy-component :is="dialog" @close="show = false" />
        </v-dialog>
    </v-container>
</template>

<script>
    import { context, slide, error } from '~/mixins/common'

    const // description = 'VK Streaming API manager - сервис, получающий ивенты из социальной сети ВК (посты, комментарии), в режиме реального времени. Проведение несложных статистических исследований, анализа эффективности маркетинговой стратегии, поиска контента в вк по ключевым словам.',
        description = 'Netagregator поможет настроить стрим из ВКонтакте. Прокачай свое сообщество! Все инструменты для управления в одном приложении!',
        title = 'Стримридер ВКонтакте | Читаем стрим ВК'

    export default {
        name: 'PageStream',

        mixins: [context, slide, error],

        head() {
            return {
                title: this.$t('common.stream'),
                meta: [
                    { name: 'description',         hid: 'description',         content: description },
                    { name: 'og:description',      hid: 'og:description',      content: description },
                    { name: 'og:url',              hid: 'og:url',              content: 'https://netaggregator.ru/stream' },
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
                name: 'VK Streaming API manager',
                url: 'https://netaggregator.ru/stream',
                image: 'https://netaggregator.ru/icon.png',
                sameAs: ['http://vk.com/netaggregator'],
                description
            }
        },
        computed: {
            entity: {
                set(entity) {
                    this.$store.commit('socket/set', { entity })
                },
                get() {
                    return this.$store.state.socket.entity
                }
            },
            show: {
                get() {
                    return this.$refs.dialog.isActive
                },
                set(v) {
                    this.$refs.dialog.isActive = v
                }
            },
            presentation() {
                return this.$store.state.app.presentation
            },
            modules() {
                return this.$store.state.socket.modules || []
            },
            smallscreen() {
                const { window: size } = this.$store.state.app

                return size
                    ? this.mobile && size.diagonal < 927
                    : this.mobile
            },
            fullscreen() {
                return this.mobile || this.smallscreen
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            // '$store.state.app.tilt': 'toggleTilt',

            entity: 'loadModule'
        },
        data: () => ({
            module: 'stream',
            dialog: null
        }),
        methods: {
            loadModule()
            {
                return this.$store.dispatch('socket/load').then(this.swipe).then(this.updateSwiper)
            },
            open(entity)
            {
                this.dialog = entity
                this.show = true
            },
            initStream()
            {
                this.loadModule().finally(() => {
                    this.$bus.$emit('loading:finish')
                })
            }
        },
        mounted()
        {
            this.$on('swiper:ready', this.initStream)
        }
    }
</script>

<style lang="scss" scoped>
    .stream-page {
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
        a {
            color: unset;
        }
    }
    @media all and (max-width: 375px) {
        .stream-dialog {
            margin: 0 !important;
            max-height: 100vh !important;
        }
        .stream-page {
            padding-right: 0 !important;
            padding-left: 0 !important;
            padding-top: 0 !important;

            ::v-deep .module.stream-module {
                width: 100% !important;
            }
        }
    }
</style>
