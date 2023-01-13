<template>
    <v-container class="news-page">
        <v-layout class="articles__list">
            <template v-for="(t, i) in articles">
                <v-flex class="articles__list--cell" :key="i">
                    <v-card>
                        <div class="articles__list--image-wrapper" @click="showNews(i)">
                            <v-img v-visible.once:300px="load.bind(_self)"
                                lazy-src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                                :data-src="`/img/articles/thumb/${t.thumb}`"
                                class="articles__list--image"
                                alt="article image"
                                aspect-ratio="1.6"
                            />

                            <div class="articles__list--overlay" />

                            <div class="articles__list--title">
                                {{ t.name }}
                            </div>
                        </div>
                    </v-card>
                </v-flex>
            </template>
        </v-layout>

        <v-dialog v-model="show"
            content-class="news-dialog"
            :max-width="mobile ? '100%' : '700px'"
            :fullscreen="fullscreen"
            :persistent="force"
            no-click-animation
            eager
        >
            <v-card class="news-dialog__card" :class="{ fullscreen }" elevation="0">
                <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

                <template v-if="mobile && $store.state.app.vkapp">
                    <v-layout class="news-dialog__btn-wrapper" justify-start>
                        <v-btn @click="show = false" aria-label="close" icon>
                            <v-icon>mdi-window-close</v-icon>
                        </v-btn>
                        <v-btn @click="prev" aria-label="prev" icon>
                            <v-icon>mdi-chevron-left</v-icon>
                        </v-btn>
                        <v-btn @click="next" aria-label="next" icon>
                            <v-icon>mdi-chevron-right</v-icon>
                        </v-btn>
                    </v-layout>
                </template>
                <template v-else>
                    <v-tabs class="news-dialog__tabs-header" height="60px" color="grey" ref="tabs" hide-slider grow>
                        <template v-if="!mobile">
                            <v-tab class="prev" @click="prev" :ripple="false">
                                <v-icon>mdi-chevron-left</v-icon>
                            </v-tab>
                        </template>
                        <v-tab class="middle" @click="toggleState" :ripple="false">
                            {{ current.date }}
                        </v-tab>
                        <template v-if="!mobile">
                            <v-tab class="next" @click="next" :ripple="false">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-tab>
                        </template>
                    </v-tabs>
                </template>

                <v-card-text class="news-dialog__card-pane">
                    <swiper :options="sliderOptions" @ready="onReady" auto-destroy>
                        <template v-for="(a, i) in articles">
                            <swiper-slide :key="i">
                                <v-layout class="pane scroller"
                                    :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`"
                                    ref="pane"
                                >
                                    <core-news :article="a" :fullscreen="fullscreen" :key="i" />
                                </v-layout>
                            </swiper-slide>
                        </template>
                    </swiper>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
    import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter'
    import { Swiper as SwiperClass } from 'swiper/core'

    import { each } from '~/utils/async-array.mjs'
    import visible from '~/directives/visible'

    const description = 'Уникальный набор инструментов для сообществ ВКонтакте. Все для управления в одном приложении! Новостной блог Netagregator',
        title = 'Инструменты для сообществ ВКонтакте | Блог'

    function revoke() {}

    /**
    * Possible alternatives
    * @see https://content.nuxtjs.org/ru
    */
    export default {
        name: 'PageNews',

        components: getAwesomeSwiper(SwiperClass),

        directives: { visible },

        fetchKey: 'articles',

        head() {
            return {
                title: this.$t('common.news'),
                meta: [
                    { name: 'description',         hid: 'description',         content: description },
                    { name: 'og:description',      hid: 'og:description',      content: description },
                    { name: 'og:url',              hid: 'og:url',              content: 'https://netaggregator.ru/news' },
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
                name: 'Новости',
                url: 'https://netaggregator.ru/stream',
                image: 'https://netaggregator.ru/icon.png',
                sameAs: ['http://vk.com/netaggregator'],
                description
            }
        },
        computed: {
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            articles() {
                return this.$store.state.news.articles
            },
            color() {
                return this.$store.state.app.color
            },
            fullscreen() {
                return this.mobile || this.force
            }
        },
        watch: {
            fullscreen() {
                this.smooth[this.newsIdx]?.scrollTo(null, 0)
            },
            show(v) {
                v ? this.updateSwiper() : this.reset()
            }
        },
        data: () => ({
            sliderOptions: {
                observer: true,
                observeSlideChildren: true,
                touchStartPreventDefault: false,
                allowTouchMove: true,
                centeredSlides: true,
                autoHeight: true,
                spaceBetween: 20
            },

            swiper: null,
            smooth: [],

            force: false,
            show: false,

            current: {},
            newsIdx: 0,

            revoke
        }),
        methods: {
            load({ el })
            {
                const holder = el.querySelector('.v-image__placeholder'),
                    img = el.querySelector('.v-image__image'),
                    url = img.style.backgroundImage

                if (/\/articles\/thumb/.test(url)) return

                if (el.dataset && el.dataset.src) {
                    this.$store.dispatch('news/cacheImage', el.dataset)
                    img.style.backgroundImage = `url(${el.dataset.src})`
                    img.style.backgroundPosition = 'center center'
                }

                img.classList.remove('v-image__image--preload')

                holder && holder.remove()
            },
            async preCache(idx)
            {
                if (!this.articles[idx]?.thumb) return

                await this.$store.dispatch('news/cacheImage', {
                    src: `/img/articles/thumb/${this.articles[idx]?.thumb}`
                })
            },
            preload()
            {
                const { articles, cache } = this.$store.state.news

                if (cache.size >= articles.length) {
                    return this.revoke()
                }

                this.revoke = each(articles, async (_, i) => {
                    await this.preCache(i)
                }, 50)
            },
            initScroll()
            {
                if (this.smooth[this.newsIdx]) return

                const pane = this.$refs.pane[this.newsIdx]

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth[this.newsIdx] = Scrollbar(pane, {
                                scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' },
                                overflowBehavior: { x: 'hidden', y: 'scroll' }
                            })
                        })
                        .catch(revoke)

                } else {
                    import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth[this.newsIdx] = Scrollbar.init(pane, {
                                damping: this.mobile ? .5 : 1,
                                continuousScrolling: false
                            })

                            this.smooth[this.newsIdx].updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                        .catch(revoke)
                }
            },
            onReady(swiper)
            {
                if (this.swiper) return

                this.swiper = swiper

                this.attachEvents()
                this.updateSwiper()

                if (!this.smooth[this.newsIdx]) {
                    this.initScroll()
                }
            },
            attachEvents()
            {
                this.swiper.off('slideNextTransitionStart', this.next)
                this.swiper.off('slidePrevTransitionStart', this.prev)

                if (this.sliderOptions.allowTouchMove) {
                    this.swiper.on('slideNextTransitionStart', this.next)
                    this.swiper.on('slidePrevTransitionStart', this.prev)
                }
            },
            showNews(idx)
            {
                this.slideTo(idx)

                this.show = true
            },
            toggleState()
            {
                const key = this.mobile ? 'show' : 'force'

                this[key] = !this[key]
            },
            updateSwiper()
            {
                this.swiper && this.swiper.update()
            },
            slideTo(idx)
            {
                if (idx < 0 || !this.articles[idx]) return

                this.current = this.articles[idx]
                this.newsIdx = idx

                this.initScroll()

                if (!this.sliderOptions.allowTouchMove) {
                    this.swiper && this.swiper.slideTo(idx)
                }
            },
            next()
            {
                this.slideTo(this.newsIdx + 1)
            },
            prev()
            {
                this.slideTo(this.newsIdx - 1)
            },
            reset()
            {
                this.force = false
            }
        },
        async fetch()
        {
            await this.$store.dispatch('news/loadNews')
        },
        beforeMount()
        {
            this.sliderOptions.allowTouchMove = this.mobile
        },
        mounted()
        {
            this.$nextTick().then(() => {
                if (!this.mobile || !this.$store.state.app.vkapp) {
                    this.$refs.tabs.$el.querySelector('.v-slide-group__prev').remove()
                    this.$refs.tabs.$el.querySelector('.v-slide-group__next').remove()
                }
            })
        },
        created()
        {
            if (process.browser) {
                this.$bus.$emit('loading:finish')
                this.preload()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .news-page {
        padding-bottom: 30px;

        .articles__list {
            flex-flow: row wrap;
            justify-content: center;

            .articles__list--cell {
                flex: 0 1 460px;

                ::v-deep .v-card {
                    position: relative;

                    padding: 10px;
                    margin: 7px;

                    .articles__list--image-wrapper {
                        position: relative;
                        cursor: pointer;

                        .articles__list--image {
                            display: block;

                            max-height: 280px;

                            background-position: 50%;
                            background-size: cover;
                            vertical-align: middle;
                        }
                        .articles__list--overlay,
                        .articles__list--title {
                            position: absolute;
                            left: 0;
                            top: 0;

                            height: 100%;
                            width: 100%;

                            transition: opacity 40ms linear;
                            color: white;

                            text-align: center;
                            font-size: 1.2em;
                        }
                        .articles__list--overlay {
                            background-color: #000;
                            opacity: 0;
                        }
                        .articles__list--title {
                            padding: 8vmin 15px;
                            background-color: unset;
                            opacity: 1;
                        }
                        &:hover .articles__list--overlay {
                            opacity: .5;
                        }
                    }
                    .articles__list--controls {
                        position: absolute;
                        display: flex;
                        bottom: 15px;
                        left: 10px;

                        .articles__list--button {
                            margin: 0 0 0 7px;
                            min-width: 170px;

                            background-color: #0f9d58 !important;
                            color: white;

                            ::v-deep .v-btn__content {
                                justify-content: space-around !important;

                                .v-btn {
                                    z-index: 1;
                                }
                            }
                        }
                    }
                }
            }
            a {
                color: unset;
            }
        }
    }
    .v-card.news-dialog__card {
        .news-dialog__btn-wrapper {
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
        .news-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tab.prev {
                max-width: 15%;
            }
            ::v-deep .v-tab.next {
                max-width: 15%;
            }
        }
        .v-card__text.news-dialog__card-pane {
            min-height: 540px;
            padding: 15px 0 15px 15px;

            ::v-deep .swiper-container {
                .swiper-slide {
                    min-height: 650px;
                    max-height: 650px;
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
                    .pane__topic-disclosure svg {
                        vertical-align: middle;
                    }
                    .pane__topic-closing {
                        margin: 16px auto;
                        text-align: center;
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
                                margin-left: 20px;
                                margin-bottom: 10px;
                            }
                            &.left {
                                float: left;
                                margin-right: 20px;
                                margin-bottom: 10px;
                            }
                            &.pc1 .v-image {
                                max-width: 100%;
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
            }
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .news-dialog__card-pane {
                max-height: calc(100vh - 61px);

                ::v-deep .swiper-container .swiper-slide {
                    height: calc(100vh - 81px);
                    min-height: unset;
                    max-height: unset;
                }
            }
        }
        &.theme--dark {
            .news-dialog__tabs-header {
                border-color: #8f8f8f;
            }
            .v-card__text.news-dialog__card-pane {
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
    @media all and (max-width: 375px) {
        .news-page {
            padding-right: 0 !important;
            padding-left: 0 !important;
            padding-top: 0 !important;
            width: 100% !important;
        }
    }
    @media all and (max-width: 700px) {
        .v-card.news-dialog__card .v-card__text.news-dialog__card-pane {
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
        .v-card.news-dialog__card .v-card__text.news-dialog__card-pane {
            ::v-deep .pane.scroller .container {
                max-width: 1185px;
            }
        }
    }
    @media all and (max-width: 1265px) {
        .v-card.news-dialog__card .v-card__text.news-dialog__card-pane {
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
