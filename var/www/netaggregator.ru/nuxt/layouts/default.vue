<template>
    <v-app class="app-root" :class="{ fixed: presentation }" v-resize="setWrapper">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" :color="barColor" height="20px" app />
        <core-toolbar :scroll="scroll" @state="toolbar = $event" @calc:on="calculator = !calculator" />

        <core-drawer v-show="show" @intro="startIntro" @help="help = true" @law="law = true" @ref="ref = true" @fake="fakeToggler" />
        <core-view :scroll="scroll" :toolbar="toolbar" :context="context" />
        <core-footer />

        <client-only>
            <template v-if="mobile">
                <v-dialog v-model="calculator" fullscreen>
                    <helper-flipper @calc:off="calculator = false" />
                </v-dialog>
            </template>
            <template v-else>
                <helper-flipper
                    v-if="calculator"
                    @calc:off="calculator = false"
                    :presentation="presentation"
                    :entity="combo"
                />
            </template>

            <core-help-dialog v-model="help" />
            <core-law-dialog v-model="law" />
            <core-ref-dialog v-model="ref" />

            <!--<v-menu v-model="menu"
                transition="slide-y-transition"
                :close-on-content-click="false"
                :max-height="chatSize.height"
                :min-width="chatSize.width"
                :key="force"
                eager
                left
                top
            >
                <template #activator="{ on, attrs }">
                    <v-btn v-on="on"
                        v-bind="attrs"
                        class="chat-btn"
                        elevation="1"
                        :color="color"
                        fixed
                        bottom
                        right
                        dark
                        fab
                    >
                        <v-icon>
                            mdi-chat-processing-outline
                        </v-icon>
                    </v-btn>
                </template>

                <core-noop v-if="!currentUser.id" :style="chatSize" class="chat__noop disabled--text">
                    <p>Authorize needed...</p>
                </core-noop>
                <chat-window v-else
                    :height="chatSize.height"
                    :show-audio="false"
                    :show-add-room="false"
                    :show-reaction-emojis="false"
                    :single-room="singleRoom"
                    :current-user-id="currentUser.id"
                    :room-id="roomId"
                    :rooms="loadedRooms"
                    :loading-rooms="loadingRooms"
                    :messages="messages"
                    :messages-loaded="messagesLoaded"
                    :rooms-loaded="roomsLoaded"
                    :room-message="roomMessage"
                    @fetch-more-rooms="fetchMoreRooms"
                    @fetch-messages="fetchMessages"
                    @send-message="sendMessage"
                    @edit-message="editMessage"
                    @delete-message="deleteMessage"
                    @open-file="openFile"
                    @open-user-tag="openUserTag"
                    @typing-message="typingMessage"
                />
            </v-menu>-->
        </client-only>
    </v-app>
</template>

<script>
    import { swichTheme } from '~/utils/common/switch-theme.mjs'
    import { debounce } from '~/utils/common/debounce.mjs'
    import { wrapper, steps } from '~/mixins/common'

    // import chat from '~/mixins/common/chat'
    // import { roomsRef, usersRef } from '~/firestore'
    // import { Snow } from '~/utils/snow'

    // ScrollBugFix
    // Taken from: https://gist.github.com/diachedelic/d8949839815293e8556e
    // Fixes: http://openradar.appspot.com/radar?id=6113789778853888

    function resolve() {}

    export default {
        name: 'LayoutDefault',

        mixins: [wrapper, steps/* chat */],

        head() {
            let path = this.$route.path.toLowerCase().replace(/\/$/, ''),
                url = `${process.env.TARGET_URL}${path}`,
                link = []

            if (['/chatbot','/stream','/widget','/cover'].includes(path)) {
                link = [{ href: url, rel: 'canonical' }]
            }

            return {
                bodyAttrs: {
                    class: `theme--${this.$store.state.app.theme}`,
                    itemtype: 'https://schema.org/WebPage',
                    itemscope: ''
                },
                htmlAttrs: {
                    class: 'screen_100'
                },
                link
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            barColor() {
                return this.$vuetify.theme.dark ? '#121212' : '#f5f5f5'
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            fake: {
                set(fake) {
                    this.$store.commit('app/set', { fake })
                },
                get() {
                    return this.$store.state.app.fake
                }
            }
            /* currentUser() {
                let { user } = this.$store.state.app,
                    avatar = '/img/avatars/m01r_130.png',
                    roomName = 'Undefined',
                    username = 'Undefined',
                    id

                if (user) {
                    username = roomName = `${user.first_name} ${user.last_name}`
                    avatar = user.photo_100 || user.photo_200 || avatar
                    id = user.id
                }

                return {
                    roomId: id,
                    roomName,
                    username,
                    avatar,
                    id
                }
            },
            chatSize() {
                let { width: w, height: h } = this.$screen,
                    height = '600px',
                    width = '420px'

                if (this.currentUser.id === admin) {
                    height = `${h - h * .2}px`
                    width = `${w - w * .2}px`
                }

                return { height, width }
            }, */
        },
        watch: {
            '$store.state.app.theme': 'toggleTheme',
            '$store.state.app.hints': 'toggleHints',
            // '$store.state.app.tilt': 'toggleTilt',

            /* currentUser(v) {
                v.id || this.reload()
            }, */

            presentation(v) {
                document.documentElement.classList[v ? 'add' : 'remove']('presentation')
                this.$store.commit('app/set', { presentation: v })

                v ? this.fakeLoad() : this.fakeUnLoad()
            },
            help(v) {
                v || this.reset()
            }
        },
        data: () => ({
            fakeData: [
                { src: 'settings', commit: 'app/setSettings' },
                { src: 'chatbot',  commit: 'chatbot/set' },
                { src: 'socket',   commit: 'socket/set' },
                { src: 'covers',   commit: 'cover/set' }
            ],

            calculator: false,
            combo: undefined,

            toolbar: true,
            show: false,
            menu: false,
            help: false,
            law: false,
            ref: false,

            context: null,
            tid: null,
            sid: null,

            scroll: 0,

            resolve
        }),
        methods: {
            fakeToggler()
            {
                this.fake ? this.fakeUnLoad() : this.fakeLoad()
            },
            async fakeLoad()
            {
                const { credentials, user } = this.$store.state.app

                if (credentials && user) return

                await Promise.all(this.fakeData.map(({ src, commit }) => {
                    return import(`~/assets/data/${src}`).then(data => {
                        this.$store.commit(commit, /settings/i.test(commit) ? { ...data, fake: true } : data)
                    })
                }))

                this.fake = true

                this.$bus.$emit('settings:reload', 'login')
            },
            fakeUnLoad()
            {
                if (!this.fake) return

                this.fake = false

                this.$store.commit('app/set', { credentials: undefined, user: undefined, groups: [] })
                this.$store.commit('socket/set', { settings: null, history: [], stream: [] })
                this.$store.commit('chatbot/set', { list: [] })
                this.$store.commit('cover/set', { list: [] })

                this.$bus.$emit('settings:reload', 'logout')
            },
            toggleTheme(v)
            {
                if ((this.$vuetify.theme.dark = v === 'dark')) {
                    this.$store.commit('app/set', { color: 'accent' })
                }

                this.$bus.$emit('theme:toggle', v)

                swichTheme(v)
            },
            toggleHints(v)
            {
                this.$bus.$emit('hints:toggle', v)
            },
            /* toggleTilt(v)
            {
                this.$ls.set('tilt', v)
            }, */
            setTheme()
            {
                this.toggleTheme(this.$store.state.app.theme)
            },
            clear()
            {
                document.body.querySelectorAll('svg').forEach(svg => {
                    document.body === svg.parentNode && svg.remove()
                })
            },
            entity(module)
            {
                return this.$store.state[module].entity
            },
            swipe(module, entity)
            {
                this.tid && this.free()

                return new Promise(resolve => {
                    this.resolve = resolve

                    const active = { ...this.$store.state.context.active, [module]: entity }

                    this.$store.commit(`${module}/set`, { entity })
                    this.$store.commit('context/set', { active })

                    this.tid = setTimeout(() => {
                        this.tid = null
                        resolve()

                    }, 1e3)
                })
            },
            free()
            {
                clearTimeout(this.tid)

                this.resolve()
            },
            designerHelp()
            {
                this.$store.commit('help/set', { section: 'designer' })
            },
            commonHelp()
            {
                this.$store.commit('help/set', { section: 'common' })
            },
            reset()
            {
                this.$store.commit('help/set', { section: 'common' })
            },
            showLaw()
            {
                this.law = true
            },
            finish: debounce(function()
            {
                this.show = true

            }, 100)
            /* reload()
            {
                setTimeout(() => this.force = !this.force, 250)
            }
            resetData()
            {
                roomsRef.get().then(val => {
                    val.forEach(async val => {
                        const ref = roomsRef.doc(val.id).collection('messages')

                        await ref.get().then(res => {
                            if (res.empty) return
                            res.docs.map(doc => ref.doc(doc.id).delete())
                        })

                        roomsRef.doc(val.id).delete()
                    })
                })

                usersRef.get().then(val => {
                    val.forEach(val => {
                        usersRef.doc(val.id).delete()
                    })
                })
            } */
        },
        beforeDestroy()
        {
            this.$bus.$off('toggle:designer', this.designerHelp)
            this.$bus.$off('toggle:common', this.commonHelp)
            this.$bus.$off('show:law-docs', this.showLaw)

            this.$bus.$on('loading:finish', this.finish)
            // this.$bus.$off('settings:reload', this.init)
        },
        beforeMount()
        {
            this.$bus.$on('toggle:designer', this.designerHelp)
            this.$bus.$on('toggle:common', this.commonHelp)
            this.$bus.$on('show:law-docs', this.showLaw)

            this.$bus.$on('loading:finish', this.finish)
            // this.$bus.$on('settings:reload', this.init)

            window.addEventListener('scroll', () => {
                this.scroll = window.pageYOffset || document.documentElement.scrollTop
            })
        },
        mounted()
        {
            this.$nextTick().then(this.setTheme).then(this.clear)
                // .then(this.resetData)
                // .then(this.init)
        },
        created()
        {
            this.$store.commit('help/set', { section: 'common' })
        }
    }
</script>

<style lang="scss" scoped>
    .v-application.app-root {
        transition: background .22s ease-in-out;

        &.theme--light {
            background: #F5F5F5 !important;
        }
        &.theme--dark {
            background: #242424 !important;
        }
        &.fixed {
            position: fixed;
            bottom: 0;
            right: 0;
            left: 0;
            top: 0;
        }
        ::v-deep .v-application--wrap {
            .app-main .v-main__wrap {
                .container:not(.news-page) {
                    max-width: 100%;
                }
            }
            /* .chat-btn {
                bottom: 70px;
                right: 90px;
            } */
        }
        ::v-deep .v-menu__content {
            border-radius: 4px;

            /* .vac-card-window::v-deep {
                .vac-emoji-wrapper .vac-emoji-picker {
                    overflow: auto;
                }
            }
            .chat__noop {
                display: flex;
                justify-content: center;
                align-items: center;

                background-color: #fff;
            } */
        }
        ::v-deep .v-tooltip__content {
            padding: 10px 15px;
            text-align: center;
            color: #555 !important;
            background: #fff;

            box-shadow:
                0 8px 10px 1px rgba(0,0,0,.14),
                0 3px 14px 2px rgba(0,0,0,.12),
                0 5px 5px -3px rgba(0,0,0,.2);
        }
        ::v-deep .login-dialog {
            height: 540px;

            &.v-dialog--fullscreen {
                height: 100vh;
            }
        }
    }
    @media all and (min-width: 1265px) {
        ::v-deep .v-application--wrap .app-main .v-main__wrap {
            .container.news-page {
                max-width: 1185px;
            }
        }
    }
</style>
