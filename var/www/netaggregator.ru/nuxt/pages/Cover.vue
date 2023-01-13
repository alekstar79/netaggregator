<template>
    <v-container class="cover-page" fill-height justify-content-center>
        <client-only>
            <swiper :options="options" auto-destroy @ready="onReady">
                <template v-for="m in modules">
                    <swiper-slide :key="m.entity">
                        <lazy-component base="cover"
                            @detailed="detailed = true"
                            @settings="settings = true"
                            @update="updateSwiper"
                            :multiply="true"
                            :is="m.cmp"
                        />
                    </swiper-slide>
                </template>
            </swiper>
        </client-only>
    </v-container>
</template>

<script>
    import { context, slide, error } from '~/mixins/common'

    const // description = 'Конструктор динамических обложк сообщества, которые содержат полезную для подписчиков информацию и обновляют ее при наступлении событий в группе или на внешних сервисах. Отображаемая информация, дизайн обложки, легко и гибко настраивается в графическом редакторе. Редактор, позволяет создать дизайн любой сложности.',
        description = 'Netagregator - создание динамической обложки ВК. Добавить обложку вконтакте. Все для редактирования VK обложек сообщества в одном месте!',
        title = 'Редактор динамических обложек ВКонтакте | Обложка для группы ВК'

    export default {
        name: 'PageCover',

        mixins: [context, slide, error],

        head() {
            return {
                title: this.$t('common.dcover'),
                meta: [
                    { name: 'description',         hid: 'description',         content: description },
                    { name: 'og:description',      hid: 'og:description',      content: description },
                    { name: 'og:url',              hid: 'og:url',              content: 'https://netaggregator.ru/cover' },
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
                name: 'Конструктор динамических обложк',
                url: 'https://netaggregator.ru/cover',
                image: 'https://netaggregator.ru/icon.png',
                sameAs: ['http://vk.com/netaggregator'],
                description
            }
        },
        computed: {
            entity: {
                set(entity) {
                    this.$store.commit('cover/set', { entity })
                },
                get() {
                    return this.$store.state.cover.entity
                }
            },
            fullscreen() {
                return Boolean(this.mobile || this.width <= 320 || this.$store.state.app.vkapp)
            },
            width() {
                return (this.$store.state.app.window || {}).width || 320
            },
            modules() {
                return this.$store.state.cover.modules || []
            },
            presentation() {
                return this.$store.state.app.presentation
            }
        },
        watch: {
            // '$store.state.app.tilt': 'toggleTilt',

            entity: 'loadModule'
        },
        data: () => ({
            settings: false,
            module: 'cover'
        }),
        methods: {
            loadModule()
            {
                return this.$store.dispatch('cover/load').then(this.swipe).then(this.updateSwiper)
            },
            async initCover()
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
            this.$on('swiper:ready', this.initCover)
        },
        async asyncData({ store })
        {
            await Promise.all([
                store.dispatch('cover/coversLoad', {}),
                store.dispatch('cover/templatesLoad')
            ])
        }
    }
</script>

<style lang="scss" scoped>
    .cover-page {
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
                        white-space: normal;
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
    @media all and (max-width: 375px) {
        .cover-dialog {
            margin: 0 !important;
            max-height: 100vh !important;
        }
        .cover-page {
            padding-right: 0 !important;
            padding-left: 0 !important;
            padding-top: 0 !important;

            ::v-deep .module.cover-module {
                width: 100% !important;
            }
        }
    }
</style>
