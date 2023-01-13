<template>
    <v-app class="app-root" v-resize="setWrapper">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" :color="barColor" app />
        <v-main ref="ctx"><nuxt /></v-main>

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
                    <v-btn @click="snackbar.open = false" icon>
                        <v-icon>mdi-close-circle</v-icon>
                    </v-btn>
                </template>
            </v-snackbar>

            <viewer :options="options" :images="frame" @inited="inited" class="viewer">
                <img v-for="{ url, src } in frame" :src="url || src" :key="url || src" alt="">
            </viewer>

            <lazy-core-context
                v-if="!mobile"
                v-model="event"
                :buttons="buttons"
                @toggle="contextOnChange"
            />

            <core-help-dialog v-model="help" />
            <core-law-dialog v-model="law" />

            <helper-cookie-law />
        </client-only>
    </v-app>
</template>

<script>
    import { createToolButton } from '~/utils/common/create-button.mjs'
    import { swichTheme } from '~/utils/common/switch-theme.mjs'
    import { decode } from '~/utils/ubjson.mjs'

    import { context, wrapper } from '~/mixins/common'

    import axios from 'axios'

    import '~/assets/css/opentype.css'

    /* function suppressScroll(e)
    {
        const owner = findNearestScrollableParent(e.target)

        if (!owner || owner === document.documentElement || owner === document.body) {
            e.preventDefault()
        }
    }

    function findNearestScrollableParent(firstNode)
    {
        let scrollable = null, node = firstNode

        while (!scrollable && node) {
            if (node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight) {
                if (!overflowIsHidden(node)) {
                    scrollable = node
                }
            }

            node = node.parentNode
        }

        return scrollable
    }

    function overflowIsHidden(node)
    {
        const style = window.getComputedStyle(node)

        return style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden'
    } */

    const busEvents = {
        'toggle:designer': 'designerHelp',
        'toggle:common': 'commonHelp',
        'image:loaded': 'closeViewer',
        'show:law-docs': 'showLaw',
        'show:help': 'showHelp',
        snack: 'snack',
        view: 'view'
    }

    function extractHash(url)
    {
        return {
            id: url.slice(url.lastIndexOf('/') + 1).split('.')[0],
            url: url.slice(0, url.lastIndexOf('/') + 1)
        }
    }

    export default {
        name: 'LayoutGraph',

        mixins: [context, wrapper],

        head() {
            const url = `${process.env.TARGET_URL}${this.$route.path.toLowerCase().replace(/\/$/, '')}`,
                { theme = 'light' } = this.$store.state.app

            return {
                link: [{ href: url, rel: 'canonical' }],
                bodyAttrs: {
                    itemscope: '',
                    itemtype: 'https://schema.org/WebPage',
                    class: `theme--${theme}`
                },
                htmlAttrs: {
                    class: 'hidden-html'
                }
            }
        },
        computed: {
            event: {
                get() {
                    return this.$store.state.context.event
                },
                set(event) {
                    this.setContext(event)
                }
            },
            passive() {
                return (this.$BROWSER || {}).PASSIVE_SUPPORTED ? { passive: false } : false
            },
            snackOptions() {
                return { bottom: this.mobile, right: !this.mobile, top: !this.mobile }
            },
            barColor() {
                return this.$vuetify.theme.dark ? '#121212' : '#f5f5f5'
            },
            buttons() {
                return this.$store.state.context.buttons.graph
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        data() {
            const self = this

            return {
                button: null,
                viewer: null,
                start: null,

                help: false,
                law: false,

                helpModuleIdx: 0,
                frame: [],

                options: {
                    button: this.mobile,
                    focus: false,
                    edit: false,

                    viewed() {
                        self.button = self.options.edit
                            ? self.insertButton()
                            : self.removeButton()
                    },
                    hide() {
                        self.frame = []
                    }
                },
                snackbar: {
                    color: 'success',
                    timeout: 4000,
                    open: false,
                    content: ''
                },
                colors: {
                    success: '#5cb860',
                    warning: '#ffa21a',
                    error:   '#f55a4e'
                }
            }
        },
        watch: {
            '$store.state.app.theme': 'toggleTheme',

            $route() {
                this.setContext(null)
            },
            help(v) {
                v || this.reset()
            }
        },
        methods: {
            snack({ content, color = 'success', raw = false, timeout = 4000 })
            {
                this.snackbar = { content: raw ? content : this.$t(content), open: true, timeout, color }
            },
            toggleTheme(v)
            {
                if ((this.$vuetify.theme.dark = v === 'dark')) {
                    this.$store.commit('app/set', { color: 'accent' })
                }

                this.$bus.$emit('theme:toggle', v)

                swichTheme(v)
            },
            imageEmiter(img)
            {
                this.closeViewer();

                /pixabay/.test(img.src) ? this.$bus.$emit('paste:image', img) : this.edit(extractHash(img.src))
            },
            async edit({ id })
            {
                let error, edit, data, tmpl = id

                try {

                    ({ data } = await axios.get(`/dcover/default/structs/${id}.wxg`, { responseType: 'blob' }))

                    edit = decode(await data.arrayBuffer())

                } catch (e) {
                    error = e.message

                    try {

                        if (data && (edit = JSON.parse(await data.text()))) {
                            error = edit.error
                        }

                    } catch (e) {
                    }
                }

                if (error) {
                    return this.snack({ content: `Error: ${error}`, color: 'error', raw: true })
                }

                this.$store.commit('cover/set', { edit, tmpl })
                this.$bus.$emit('edit:tmpl')
            },
            insertButton()
            {
                if (this.button) return this.button

                let span = createToolButton(this.imageEmiter, 'edit-btn'),
                    s = Date.now() + 300,
                    c = null

                do {

                    c = document.body.querySelector('.viewer-container')

                } while (!c && (s > +new Date()))

                if (!c) return null

                c.append(span)

                return span
            },
            removeButton()
            {
                this.button && this.button.remove()

                return null
            },
            view({ frame, idx, edit = true })
            {
                this.options.edit = edit
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
            closeViewer()
            {
                this.viewer && this.viewer.hide()
            },
            contextOnChange(event)
            {
                this.$bus.$emit('context:on-change', event)
            },
            showHelp()
            {
                this.help = true
            },
            showLaw()
            {
                this.law = true
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
                this.$store.commit('help/set', { section: 'designer' })
            }
        },
        beforeDestroy()
        {
            // document.body.removeEventListener('touchmove', suppressScroll, this.passive)
            Object.entries(busEvents).forEach(([event, handler]) => {
                this.$bus.$off(event, this[handler])
            })

            this.$refs.ctx.$el.removeEventListener(
                'contextmenu',
                this.setContext,
                this.passive
            )
        },
        beforeMount()
        {
            Object.entries(busEvents).forEach(([event, handler]) => {
                this.$bus.$on(event, this[handler])
            })
        },
        mounted()
        {
            /**
            * @see https://stackoverflow.com/questions/23862204/disable-ios-safari-elastic-scrolling
            * @see https://stackoverflow.com/questions/10357844/how-to-disable-rubber-band-in-ios-web-apps
            * @see https://stackoverflow.com/a/43334940
            */
            // document.body.addEventListener('touchmove', suppressScroll, this.passive)
            this.$bus.$emit('snack:ready', { locale: this.$i18n.locale })

            if (this.mobile) return

            this.$refs.ctx.$el.addEventListener(
                'contextmenu',
                this.setContext,
                this.passive
            )
        },
        created()
        {
            this.$store.commit('help/set', { section: 'designer' })
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
        ::v-deep .v-main.fixed-presentation {
            position: fixed;
            height: 100vh;
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
        ::v-deep .v-snack__wrapper {
            min-width: unset;
            max-width: 340px;
            width: 95%;

            .v-snack__content {
                display: flex;

                .icon-container {
                    margin-right: 10px;
                }
            }
        }
        .viewer {
            display: none;
        }
    }
</style>
