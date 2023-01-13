<template>
    <v-main class="app-main scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`" ref="root">
        <div v-if="scrollnav && $route.path && $route.path !== '/news'"
            v-click-outside="clickOutside"
            @click.stop="scrollTo"
            class="in_top left"
            :class="{ shift: $store.state.app.drawer }"
            :style="{
                top,
                height: `calc(100% - ${top})`,
                opacity: lswipe && (leftswipe || scrolltop || backward) ? .5 : 0,
                maxHeight
            }"
        >
            <span class="to-top" :style="{ opacity: scrolltop ? 1 : 0 }">
                ↑ {{ topbtn }}
            </span>
            <span class="chevron-left"
                :class="{ scrollable: scrolltop || backward }"
                @click.stop="swipe('prev')"
            >
                <v-icon>mdi-chevron-left</v-icon>
            </span>
            <span class="to-bottom" :style="{ opacity: backward ? 1 : 0 }">
                ↓ {{ backbtn }}
            </span>
        </div>

        <div v-if="scrollnav && $route.path && $route.path !== '/news'"
            v-click-outside="clickOutside"
            @click.stop="scrollTo"
            class="in_top right"
            :style="{
                top,
                height: `calc(100% - ${top})`,
                opacity: rswipe && (rightswipe || scrolltop || backward) ? .5 : 0,
                maxHeight
            }"
        >
            <span class="to-top" :style="{ opacity: scrolltop ? 1 : 0 }">
                ↑ {{ topbtn }}
            </span>
            <span class="chevron-right"
                :class="{ scrollable: scrolltop || backward }"
                @click.stop="swipe('next')"
            >
                <v-icon>mdi-chevron-right</v-icon>
            </span>
            <span class="to-bottom" :style="{ opacity: backward ? 1 : 0 }">
                ↓ {{ backbtn }}
            </span>
        </div>

        <nuxt />

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
                <v-btn @click="snackbar.open = false" aria-label="close" icon>
                    <v-icon>mdi-close-circle</v-icon>
                </v-btn>
            </template>
        </v-snackbar>

        <client-only>
            <viewer :images="frame" :options="options" @inited="inited" class="viewer">
                <img v-for="img in frame" :src="img.url" :key="img.url" alt="">
            </viewer>
        </client-only>

        <client-only v-if="!mobile">
            <lazy-core-context
                v-model="event"
                :buttons="buttons"
                @toggle="contextOnChange"
                data-id="canvas-context-menu"
            />
        </client-only>

        <helper-cookie-law lift />
    </v-main>
</template>

<script>
    import { createToolButton } from '~/utils/common/create-button.mjs'
    import { debounce } from '~/utils/common/debounce.mjs'
    import { shift } from '~/utils/common/shift.mjs'
    import { decode } from '~/utils/ubjson.mjs'
    import { context } from '~/mixins/common'

    import goTo from 'vuetify/lib/services/goto'
    import axios from 'axios'

    function extractHash(url)
    {
        return {
            id: url.slice(url.lastIndexOf('/') + 1).split('.')[0],
            url: url.slice(0, url.lastIndexOf('/') + 1)
        }
    }

    export default {
        mixins: [context],

        props: {
            toolbar: {
                type: Boolean,
                default: true
            },
            context: {
                default: null
            },
            scroll: {
                required: true,
                type: Number
            }
        },
        computed: {
            passive() {
                return (this.$BROWSER || {}).PASSIVE_SUPPORTED ? { passive: false } : false
            },
            buttons() {
                const route = this.$route.name ? this.$route.name.toLowerCase() : 'empty'

                return this.$store.state.context.buttons[route] || []
            },
            snackOptions() {
                return { bottom: this.mobile, right: !this.mobile, top: !this.mobile }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            event: {
                get() {
                    return this.$store.state.context.event
                },
                set(event) {
                    this.setContext(event)
                }
            }
        },
        data() {
            const self = this

            return {
                button: null,
                start: null,
                frame: [],

                rightswipe: false,
                leftswipe: false,
                scrollnav: true,
                scrolltop: false,
                backward: false,
                disabled: false,

                rswipe: false,
                lswipe: false,

                previous: 0,
                current: 0,
                width: 0,
                shift: 0,

                maxHeight: '100%',
                top: '60px',

                backbtn: 'Backward',
                topbtn: 'To top',

                threshold: {
                    min: 0,
                    max: 0
                },
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
                    content: '',
                    open: false
                },
                colors: {
                    success: '#5cb860',
                    warning: '#ffa21a',
                    error:   '#f55a4e'
                }
            }
        },
        watch: {
            '$store.state.context.active': 'setVisibilityNav',
            '$store.state.app.locale': 'localize',
            '$store.state.app.window': 'resize',

            scroll: 'trackScroll',
            rightswipe: 'resize',
            leftswipe: 'resize',

            toolbar(v) {
                setTimeout(this.resize.bind(this))
                this.top = v ? '60px' : '0px'
            },
            $route() {
                setTimeout(this.resize.bind(this))
                this.setVisibilityNav()
                this.setContext(null)
                this.reset()
            },
            context(ctx) {
                this.setContext(ctx)
            }
        },
        methods: {
            listener(state)
            {
                this.$refs.root.$el[`${state}EventListener`]('contextmenu', this.onContext, this.passive)
            },
            snack({ content, color = 'success', raw = false, timeout = 4000 })
            {
                this.snackbar = { content: raw ? content : this.$t(content), open: true, timeout, color }
            },
            imageEmiter({ src })
            {
                this.frame = []

                if (this.$route.path === '/cover') {
                    return this.edit(extractHash(src))
                }

                this.$store.commit('cover/set', { image: { src } })

                setTimeout(() => {
                    this.$router.push({ path: '/designer' })
                })
            },
            async edit({ id /*, url */ })
            {
                let error, edit, data, tmpl = id

                try {

                    if (id === 'template' || id === 'cover') {
                        return this.$bus.$emit('cover:edit')
                    }

                    // ({ data } = id !== 'template'
                    //     ? await axios.get(`/dcover/default/structs/${id}.wxg`, { responseType: 'blob' })
                    //     : await axios.get(`${url}/struct.wxg`, { responseType: 'blob' }))

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
                if (typeof edit === 'object') {
                    this.$store.commit('cover/set', { edit, tmpl })
                    await this.$router.push('/designer')
                }
            },
            localize(locale)
            {
                switch (locale) {
                    case 'en':
                        this.backbtn = 'Backward'
                        this.topbtn = 'To top'
                        break
                    case 'ru':
                        this.backbtn = 'Назад'
                        this.topbtn = 'Наверх'
                        break
                }
            },
            resize: debounce(function()
            {
                try {

                    let container = this.$refs.root.$el.querySelector('.v-main__wrap'),
                        { width } = this.$refs.root.$el.getBoundingClientRect()

                    this.width = width
                    this.shift = 0

                    if (this.$store.state.app.drawer) {
                        this.shift = 256
                        width -= 256
                    }

                    const mid = (width / 2) + this.shift

                    this.maxHeight = window.getComputedStyle(container).height
                    this.threshold = { min: mid - 350, max: mid + 350 }
                    this.scrollnav = width > 914

                } catch (e) {
                }

            }, 250),
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
            view({ idx, frame, edit = true })
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
            },
            onContext(event)
            {
                this.buttons.length && this.setContext(event)
            },
            contextOnChange(event)
            {
                const route = this.$route.name.toLowerCase(),
                    { active } = this.$store.state.context

                this.$bus.$emit('context:on-change', event)

                this.$store.commit('context/set', {
                    active: { ...active, [route]: event.icon }
                })
            },
            setVisibilityNav(active)
            {
                active || (active = this.$store.state.context.active)

                try {

                    const { buttons } = this.$store.state.context,
                        route = this.$route.name.toLowerCase(),
                        clone = [].concat(buttons[route]),

                        entities = route === 'widget' ? clone : shift(clone, 1, 1),
                        entity = active[route] || (entities[0] || {}).icon,
                        i = entities.findIndex(c => c.icon === entity)

                    this.rswipe = i < entities.length - 1
                    this.lswipe = i > 0

                } catch (e) {
                }
            },
            scrollTo()
            {
                if (this.disabled) return

                switch (true) {
                    case this.scrolltop:
                        this.previous = this.current
                        this.disabled = true

                        goTo(0).then(() => {
                            this.scrolltop = false
                            this.backward = true
                            this.disabled = false
                        })

                        break
                    case this.backward:
                        this.disabled = true

                        goTo(this.previous).then(() => {
                            this.scrolltop = true
                            this.backward = false
                            this.disabled = false
                        })
                }
            },
            clickOutside({ target })
            {
                /in_top|chevron-right|chevron-left/.test(target.classList.value) || this.reset()
            },
            swipeCompleted()
            {
                this.resize()
                this.reset()
            },
            trackScroll(scroll)
            {
                this.scrolltop = scroll > 100
                this.backward = false
                this.current = scroll
            },
            trackMouse({ clientX })
            {
                this.rightswipe = clientX > this.threshold.max
                this.leftswipe = clientX < this.threshold.min
            },
            swipe(direction)
            {
                this.disabled || !this.$route.name || this.$bus.$emit(`${this.$route.name.toLowerCase()}:${direction}`)
            },
            reset()
            {
                this.scrolltop = false
                this.backward = false
                this.previous = 0
                this.current = 0
            }
        },
        beforeDestroy()
        {
            window.removeEventListener('mousemove', this.trackMouse, this.passive)

            this.$bus.$off('swipe:completed', this.swipeCompleted)
            this.$bus.$off('snack', this.snack)
            this.$bus.$off('view', this.view)

            if (!this.mobile) {
                this.listener('remove')
            }
        },
        beforeMount()
        {
            this.$bus.$on('swipe:completed', this.swipeCompleted)
            this.$bus.$on('snack', this.snack)
            this.$bus.$on('view', this.view)
        },
        mounted()
        {
            this.$bus.$emit('snack:ready', { locale: this.$store.state.app.locale })
            window.addEventListener('mousemove', this.trackMouse, this.passive)

            this.localize(this.$store.state.app.locale)
            this.setVisibilityNav()
            this.resize()

            if (!this.mobile) {
                this.listener('add')
            }
        }
    }
</script>

<style lang="scss" scoped>
    .app-main {
        padding: 60px 0 0;
        user-select: none;

        .in_top {
            position: fixed;
            display: flex;

            flex-direction: column;
            justify-content: center;
            align-items: center;

            padding: .5em;
            width: 100px;

            transition: opacity 1s ease;
            background-color: rgba(0,0,0,.1);
            user-select: none;
            cursor: pointer;
            z-index: 3;

            &.right {
                right: 0;
            }
            &.left {
                left: 0;

                &.shift {
                    left: 256px;
                }
            }
            span {
                position: absolute;
                display: block;

                transition: opacity 1s ease;
                color: rgba(0,0,0,.5);
                text-align: center;
                font-weight: bold;

                &.to-bottom {
                    margin-bottom: 10px;
                    bottom: 0;
                }
                &.to-top {
                    margin-top: 10px;
                    top: 0;
                }
            }
            .chevron-right,
            .chevron-left {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;

                height: 100%;
                width: 100%;

                background-color: rgba(0,0,0,0);
                transition: background-color .5s ease;

                &.scrollable {
                    height: calc(100% / 3);

                    &:hover {
                        background-color: rgba(0,0,0,.1);
                    }
                }
                .v-icon {
                    font-size: 4em;
                }
            }
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
        &.theme--dark {
            background: #242424 !important;

            .in_top {
                background-color: rgba(255,255,255,.1);

                span.scrollable:hover {
                    background-color: rgba(255,255,255,.1);
                }
                span {
                    color: rgba(255,255,255,.4);
                }
            }
        }
    }
</style>
