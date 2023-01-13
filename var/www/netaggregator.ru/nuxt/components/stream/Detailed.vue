<template>
    <v-card class="stream-detailed" :class="{ fullscreen, exact: !$store.state.app.vkapp }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="stream-detailed__btn-wrapper" justify-start>
                <v-btn @click="$emit('close')" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-btn :disabled="!user" @click="bookmarkHandler" icon>
                    <v-icon :class="{ 'disabled--text': !user }">
                        {{ inHistory ? 'mdi-trash-can-outline' : 'mdi-bookmark' }}
                    </v-icon>
                </v-btn>
                <v-btn @click="followLink(detailed)" icon>
                    <v-icon>mdi-redo-variant</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs class="stream-detailed__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                <v-tab @click="$emit('close')" :ripple="false">
                    <v-icon :color="color">mdi-window-close</v-icon>
                </v-tab>
                <v-tab :disabled="!user" @click="bookmarkHandler" :ripple="false">
                    <v-icon :class="{ 'disabled--text': !user }" :color="color">
                        {{ inHistory ? 'mdi-trash-can-outline' : 'mdi-bookmark' }}
                    </v-icon>
                </v-tab>
                <v-tab @click="followLink(detailed)" :ripple="false">
                    <v-icon :color="color">mdi-redo-variant</v-icon>
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="stream-detailed__pane scroller" ref="pane">
            <v-layout column py-4 px-5 ref="layout">
                <v-flex mt-2>
                    <v-list-item>
                        <v-list-item-avatar>
                            <a :href="author.author_url" target="_blank">
                                <v-avatar :size="42">
                                    <img src="img/avatars/m01r_130.png" alt="author">
                                </v-avatar>
                            </a>
                        </v-list-item-avatar>
                        <v-list-item-title>
                            {{ $t('common.tags') }}: {{ tags() }}
                        </v-list-item-title>
                    </v-list-item>
                </v-flex>

                <v-icon v-if="!mobile" @click="screenshot" class="screen-shot">
                    mdi-camera
                </v-icon>

                <v-flex v-html="links(text)" mt-2 />

                <v-flex v-if="attachments.length" mt-2>
                    <div class="justify-center wrap">
                        <div v-for="(a, i) in attachments" :class="classes(a)" :key="i">
                            <v-card v-if="a.type === 'photo'" @click="viewPhotos(a)" flat tile>
                                <v-img :src="photos(a)" aspect-ratio="1" />
                            </v-card>

                            <v-card v-if="a.type === 'video'" flat tile>
                                <v-img :src="videos(a)" max-width="100%" aspect-ratio="1.7" />
                                <lazy-stream-play @click="followToVideo(a)" />
                            </v-card>

                            <v-card v-if="a.type === 'link'" min-height="280" max-width="510" flat tile>
                                <div class="detailed-links__image-wrap">
                                    <div class="detailed-links__image" :style="`background-image: url(${background(a)})`" />
                                </div>

                                <div class="detailed-links__image-fade" />

                                <div class="detailed-links__info">
                                    <div class="detailed-links__info--title">
                                        {{ a.link.title }}
                                    </div>
                                    <v-btn @click="followLink({ url: a.link.url })" small>
                                        <lazy-stream-read /> {{ btnTitle(a) }}
                                    </v-btn>
                                </div>
                            </v-card>
                        </div>
                    </div>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import { rndstring } from '~/utils/common/symbols.mjs'
    import { SmoothPlugin } from '~/utils/smooth-plugin'
    import common  from '~/mixins/stream/common'

    import html2canvas from 'html2canvas'
    import saveAs from 'file-saver'

    const empty = '/img/creative/l07.jpg',
        path = 'https://vk.com/video',

        background = ({ link: { photo: p = {} } }) => p.photo_604 || p.photo_807 || p.photo_1280 || p.photo_130 || empty,
        videos = ({ video = {} }) => video.photo_1280 || video.photo_800 || video.photo_320,
        photos = ({ photo = {} }) => photo.photo_807 || photo.photo_604 || photo.photo_130

    export default {
        mixins: [common],

        data: () => ({
            smooth: null
        }),
        computed: {
            attachments() {
                return (this.detailed.attachments || []).filter(a => ['photo','video','link'].includes(a.type))
            },
            text() {
                return this.detailed.text || this.detailed.cut || ''
            },
            settings() {
                return this.$store.state.socket.settings || {}
            },
            detailed() {
                return this.$store.state.socket.detailed || {}
            },
            author() {
                return this.detailed.author || {}
            },
            inHistory() {
                const { history = [] } = this.$store.state.socket

                return this.detailed && history.length
                    ? history.some(i => i.event_id === this.detailed.event_id)
                    : false
            },
            fullscreen() {
                return this.mobile || this.$store.state.app.vkapp
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            user() {
                return this.$store.state.app.user
            }
        },
        methods: {
            background,
            photos,
            videos,

            bookmarkHandler()
            {
                if (!this.user) return

                const mutation = this.inHistory ? 'removeFromHistory' : 'addToHistory'

                this.$store.commit(`socket/${mutation}`, this.detailed)
            },
            followToVideo({ video = {} })
            {
                this.followLink(
                    !this.$store.state.app.webview
                        ? { url: `${path}${video.owner_id}_${video.id}` }
                        : this.detailed
                )
            },
            viewPhotos(p)
            {
                const frame = this.attachments.filter(a => a.type === 'photo').map(p => ({ url: photos(p) })),
                    url = photos(p)

                this.$bus.$emit('view', { idx: frame.findIndex(p => p.url === url), frame })
            },
            btnTitle({ link = {} })
            {
                const title = this.$t('common.follow')

                if (link.target === 'internal') {
                    return title
                }
                if (link.button_text) {
                    return link.button_text
                }
                if (link.button) {
                    return link.button.title || title
                }

                return title
            },
            tags()
            {
                const stats = this.settings.stats || [],
                    tags = this.detailed.tags || []

                return Object.values(stats)
                    .filter(v => tags.includes(v.tag))
                    .map(v => v.mark)
                    .join(' ')
            },
            classes({ type })
            {
                switch (type) {
                    case 'photo': return 'list__images-item'
                    case 'video': return 'list__videos-item'
                    case 'link':  return 'list__links-item'
                }

                return 'list__default-item'
            },
            async screenshot()
            {
                try {

                    const { width, height } = this.$refs.layout.getBoundingClientRect();

                    (await html2canvas(this.$refs.layout, { proxy: '/shotproxy', allowTaint: true, height, width }))
                        .toBlob(blob => saveAs(blob, rndstring() + '.png'), 'image/png', 1)

                } catch ({ message }) {
                    this.$bus.$emit('snack', { content: message, color: 'error', raw: true })
                }
            },
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
                            Scrollbar.use(SmoothPlugin)

                            this.smooth = Scrollbar.init(this.$refs.pane, {
                                damping: this.mobile ? .1 : 1,
                                continuousScrolling: false,

                                plugins: {
                                    SmoothPlugin: {
                                        events: [/wheel/]
                                    }
                                }
                            })

                            this.smooth.updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                }
            }
        },
        mounted()
        {
            this.$nextTick().then(this.initScroll)
        }
    }
</script>

<style lang="scss" scoped>
    .stream-detailed {
        height: 100%;

        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .stream-detailed__pane.scroller {
                max-height: calc(100vh - 86px);
            }
        }
        .stream-detailed__btn-wrapper {
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
        .stream-detailed__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            &.theme--dark {
                border-bottom: 1px solid #7a7a7a;
            }
            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
        .stream-detailed__pane ::v-deep .scroll-content,
        .stream-detailed__pane ::v-deep .os-content,
        .stream-detailed__pane {
            padding: 0 !important;
            min-height: 380px;
            max-height: 680px;

            a {
                color: #82b1ff;
            }
            .screen-shot {
                position: absolute;
                right: 25px;
                top: 30px;
            }
            .flex {
                .v-image.v-responsive {
                    max-width: unset;
                }
                .v-list-item {
                    color: #888 !important;
                    padding: 0;
                }
                .list__images-item {
                    min-width: 150px;
                    padding: 5px;
                }
                .list__videos-item {
                    min-width: 70%;
                    padding: 5px;

                    svg {
                        position: absolute;
                        left: 50%;
                        top: 50%;

                        transform: translate(-50%, -50%);
                    }
                }
                .list__links-item {
                    min-width: 100%;

                    .v-card {
                        margin: 0 auto;
                    }
                    .detailed-links__image-wrap {
                        position: absolute;
                        top: 0;

                        overflow: hidden;
                        height: 100%;
                        width: 100%;

                        .detailed-links__image {
                            position: absolute;
                            top: 0;

                            height: 100%;
                            width: 100%;

                            background-size: cover;
                            background-position: 50%;
                            background-color: #e7ebf0;
                            border-radius: 4px;
                        }
                    }
                    .detailed-links__image-fade {
                        position: absolute;
                        top: 0;

                        height: 100%;
                        width: 100%;

                        border-radius: 4px;
                        background-color: rgba(0,0,0,.3);
                    }
                    .detailed-links__info {
                        position: absolute;
                        top: 0;

                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        width: 100%;

                        .detailed-links__info--title {
                            box-sizing: border-box;
                            padding: 0 20px;
                            max-width: 100%;

                            text-align: center;
                            line-height: 1.1;
                            font-weight: 800;
                            font-size: 3vmin;

                            word-break: break-word;
                            word-wrap: break-word;
                            text-shadow: 0 4px 20px rgba(0,0,0,.3);
                            color: #fff;

                            -webkit-font-smoothing: subpixel-antialiased;
                                      -moz-osx-font-smoothing: grayscale;
                        }
                    }
                }
            }
            &.os-host::v-deep {
                min-height: calc(100vh - 86px);
            }
        }
        .stream-detailed__pane {
            ::v-deep .scrollbar-track.scrollbar-track-y {
                margin-right: 5px;
                background: none;

                .scrollbar-thumb {
                    width: 5px;

                    background: #7a7a7a;
                }
            }
        }
    }
</style>
