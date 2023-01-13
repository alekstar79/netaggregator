<template>
    <v-app class="app-root" v-resize="setWrapper">
        <v-main><nuxt /></v-main>

        <client-only>
            <v-snackbar
                v-model="snackbar.open"
                v-bind="snackOptions"
                :timeout="snackbar.timeout"
                :color="colors[snackbar.color] || snackbar.color"
            >
                <div class="icon-container">
                    <v-icon dense>mdi-bell-plus</v-icon>
                </div>

                <span v-text="snackbar.content" />

                <template #action>
                    <v-btn @click="snackbar.open = false" aria-label="close button" icon>
                        <v-icon>mdi-close-circle</v-icon>
                    </v-btn>
                </template>
            </v-snackbar>

            <v-fab-transition>
                <v-btn v-show="showGoToTop"
                    v-scroll="onScroll"
                    class="to-top-btn mb-2 mr-3"
                    aria-label="to top button"
                    :color="color"
                    @click="goTop"
                    fixed
                    bottom
                    right
                    dark
                    fab
                >
                    <svg xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        class="v-icon__svg"
                        aria-hidden="true"
                        role="img"
                    >
                        <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
                    </svg>
                </v-btn>
            </v-fab-transition>

            <viewer :options="options" :images="frame" @inited="inited" class="viewer">
                <img v-for="{ url, src } in frame" :src="url || src" :key="url || src" alt="">
            </viewer>

            <core-help-dialog v-model="help" />
            <core-law-dialog v-model="law" />
            <core-ref-dialog v-model="ref" />

            <helper-cookie-law />

            <v-fab-transition>
                <v-btn v-if="!mobile && button"
                    class="to-top-btn mb-2 ml-3"
                    aria-label="vk social button"
                    :color="color"
                    @click="chatOpen"
                    fixed
                    bottom
                    left
                    dark
                    fab
                >
                    <v-icon>mdi-vk</v-icon>
                </v-btn>
            </v-fab-transition>

            <div v-show="chat" id="vk_community_messages" ref="widget" />
        </client-only>
    </v-app>
</template>

<script>
    import goTo from 'vuetify/lib/services/goto'
    import { wrapper } from '~/mixins/common'

    const busEvents = {
        'toggle:designer': 'designerHelp',
        'toggle:common': 'commonHelp',
        'show:law-docs': 'showLaw',
        'show:help': 'showHelp',
        'show:ref': 'showRef',
        snack: 'snack',
        view: 'view'
    }

    const chatOptions = {
        disableButtonTooltip: 1,
        widgetPosition: 'left',
        buttonType: 'no_button'
    }

    export default {
        name: 'LayoutZimed',

        mixins: [wrapper],

        head() {
            const url = `${process.env.TARGET_URL}${this.$route.path.toLowerCase().replace(/\/$/, '')}`,
                { theme = 'light' } = this.$store.state.app

            return {
                link: [{ href: url, rel: 'canonical' }],
                htmlAttrs: {},
                bodyAttrs: {
                    itemscope: '',
                    itemtype: 'https://schema.org/WebPage',
                    class: `theme--${theme}`
                }
            }
        },
        computed: {
            snackOptions() {
                return { bottom: this.mobile, right: !this.mobile, top: !this.mobile }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            showGoToTop() {
                return this.offsetTop > 500
            }
        },
        data() {
            const self = this

            return {
                headerScrollPos: 100,
                offsetTop: 0,

                viewer: null,
                start: null,
                vk: null,
                wg: null,

                expand: false,
                button: false,
                chat: false,
                flap: false,
                help: false,
                law: false,
                ref: false,
                cid: false,

                frame: [],

                options: {
                    button: false,
                    focus: false,

                    hide() {
                        self.frame = []
                    }
                },
                colors: {
                    success: '#5cb860',
                    warning: '#ffa21a',
                    error:   '#f55a4e'
                },
                snackbar: {
                    color: 'success',
                    timeout: 4000,
                    open: false,
                    content: ''
                }
            }
        },
        watch: {
            help(v) {
                v || this.reset()
            }
        },
        methods: {
            snack({ content, color = 'success', raw = false, timeout = 4000 })
            {
                this.snackbar = { content: raw ? content : this.$t(content), open: true, timeout, color }
            },
            clearCallbacks()
            {
                if (window.vkAsyncInitCallbacks?.length) {
                    window.vkAsyncInitCallbacks = window.vkAsyncInitCallbacks.filter(cb => cb !== this.setMessagesVkOpenApi)
                }
            },
            setObserver(el)
            {
                const observer = new MutationObserver(() => {
                    if (!(this.flap = !this.flap)) return

                    const style = window.getComputedStyle(el, null)

                    if (parseInt(style.height) > 50) {
                        el.classList.remove('as-button')
                        el.classList.add('as-widget')
                        this.expand = true
                    } else {
                        el.classList.remove('as-widget')
                        el.classList.add('as-button')
                        this.expand = false
                    }
                })

                observer.observe(el, {
                    attributes: true
                })
            },
            async awaitForIframe(i = 90)
            {
                let w

                while (!(w = this.$refs.widget) && --i) {
                    await new Promise(resolve => setTimeout(resolve, 9))
                }

                return w
            },
            async setMessagesVkOpenApi()
            {
                try {

                    if (this.vk) return

                    this.vk = VK.Widgets.CommunityMessages('vk_community_messages', 147718403, chatOptions)

                    this.clearCallbacks()

                    if ((this.wg = await this.awaitForIframe())) {
                        let t = 'community messages widget'

                        this.setObserver(this.wg)

                        this.vk?.minimize()
                        this.button = true
                        this.chat = true

                        this.wg.getElementsByTagName('iframe')[0]
                            .setAttribute('title', t)

                        return
                    }

                } catch (e) {
                }

                this.$vkOpenApi()
            },
            chatOpen()
            {
                this.expand ? this.vk?.minimize() : this.vk?.expand()

                this.expand = !this.expand
            },
            onScroll(event)
            {
                this.offsetTop = event.target.scrollingElement.scrollTop

                this.$bus.$emit('stricky', {
                    fixed: this.offsetTop > this.headerScrollPos
                })
            },
            goTop()
            {
                return goTo(0).then(() => this.$bus.$emit('shift:top'))
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
            view({ frame, idx })
            {
                this.frame = frame
                this.start = idx
            },
            inited(viewer)
            {
                if (!this.frame.length) return

                /**
                * @see https://github.com/mirari/v-viewer
                */
                viewer.view(this.start)

                this.viewer = viewer
            },
            showHelp()
            {
                this.help = true
            },
            showLaw()
            {
                this.law = true
            },
            showRef()
            {
                this.ref = true
            }
        },
        beforeDestroy()
        {
            Object.entries(busEvents).forEach(([event, handler]) => {
                this.$bus.$off(event, this[handler])
            })

            if (this.mobile) return

            this.$bus.$off('loading:finish', this.setMessagesVkOpenApi)

            this.clearCallbacks()
        },
        beforeMount()
        {
            Object.entries(busEvents).forEach(([event, handler]) => {
                this.$bus.$on(event, this[handler])
            })

            if (this.mobile) return

            this.$bus.$on('loading:finish', this.setMessagesVkOpenApi)
        },
        created()
        {
            if (!process.browser) return

            this.setMessagesVkOpenApi = this.setMessagesVkOpenApi.bind(this)

            window.vkAsyncInitCallbacks || (window.vkAsyncInitCallbacks = [])

            window.vkAsyncInitCallbacks.push(this.setMessagesVkOpenApi)
        },
        mounted()
        {
            this.$bus.$emit('snack:ready', { locale: this.$i18n.locale })

            if (this.$store.state.app.goto > 0) {
                goTo(this.$store.state.app.goto).then(() => {
                    this.$store.commit('app/set', { goto: 0 })
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .app-root {
        .v-application--wrap {
            #vk_community_messages {
                box-shadow: rgba(0, 0, 0, .2) 0 5px 5px -3px,
                    rgba(0, 0, 0, .14) 0 8px 10px 1px,
                    rgba(0, 0, 0, .12) 0 3px 14px 2px;

                &.as-button {
                    border-radius: 50%;
                    max-width: 50px;
                }
                &.as-widget {
                    box-shadow: none;
                    border-radius: 0;
                }
            }
            & > .to-top-btn {
                z-index: 99;

                .v-icon__svg {
                    fill: currentColor;
                }
            }
        }
        .viewer {
            display: none;
        }
    }
</style>
