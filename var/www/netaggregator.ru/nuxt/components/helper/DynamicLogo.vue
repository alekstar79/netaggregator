<template>
    <div :class="`logo theme--${$vuetify.theme.dark ? 'dark' : 'light'}`" :style="{ opacity }">
        <div class="logo-container" :class="{ /* 'glitch-w': glitch && !mobile, 'glitch-m': glitch && mobile */ }" :style="{ height, width }">
            <template v-for="i in range">
                <svg :viewBox="viewBox" :stroke="stroke" :height="height" :width="width" :fill="fill" :key="i" ref="svg" />
            </template>
        </div>

        <h3 v-if="label" :class="{ /* glitch */ }" :data-text="label">
            {{ label }}
        </h3>
    </div>
</template>

<script>
    import { isObject, isBoolean } from 'lodash/lang'
    import { running } from '~/utils/callbacks.mjs'

    import { render } from 'posthtml-render/dist'
    import { parse } from 'postsvg'

    const cache = new Map()

    /**
    * @see https://medium.com/@jackysee/simple-loading-svg-inline-in-vue-35994f5326f2
    * @see https://medium.com/@modex13/vue-svg-88f1441fcfbe
    */
    export default {
        props: {
            src: {
                type: [String, Object, Array],
                required: true
            },
            delay: {
                type: [Number, String],
                default: 0
            },
            width: {
                type: [Number, String],
                default: 22
            },
            height: {
                type: [Number, String],
                default: 22
            },
            fill: {
                type: String,
                default: 'currentColor'
            },
            stroke: {
                type: String,
                default: 'none'
            },
            glitch: {
                default: false,
                type: Boolean
            }
        },
        data: () => ({
            started: false,
            loop: false,

            opacity: 1,
            cid: 0,

            rawsvg: '',
            label: '',
            text: ''
        }),
        computed: {
            viewBox() {
                return this.parsed ? this.parsed.root.attrs.viewBox : '0 0 24 24'
            },
            parsed() {
                return this.rawsvg ? parse(this.rawsvg) : null
            },
            range() {
                return this.glitch ? 3 : 1
            }
            /* mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            } */
        },
        watch: {
            rawsvg: 'refresh',
            glitch: 'refresh',
            stroke: 'refresh',
            fill: 'refresh',
            src: 'init'
        },
        methods: {
            async load(set)
            {
                const path = isObject(set) ? set.url : set,
                    url = `${process.env.ORIGIN_URL}${path}`

                if (!cache.has(url)) {
                    try {
                        cache.set(url, fetch(url).then(r => r.text()))
                    } catch (e) {
                        cache.delete(url)
                    }
                } else {
                    this.rawsvg = await cache.get(url)
                }
                if (set && 'text' in set) {
                    this.text = set.text.toUpperCase()
                }
            },
            refresh(mark)
            {
                this.started = !isBoolean(mark)

                Promise.resolve(this.parsed)
                    .then(tree => {
                        tree.each('path', node => (node.attrs.fill = this.fill))
                        return tree
                    })
                    .then(tree => render(tree.root.content))
                    .then(this.toggle)
                    .catch(error => {
                        this.$emit('error', error)
                    })
            },
            insert(html)
            {
                this.started = true
                this.label = this.text

                if (Array.isArray(this.$refs.svg)) {
                    this.$refs.svg.forEach(el => {
                        el.innerHTML = html
                    })
                } else {
                    this.$refs.svg.innerHTML = html
                }

                return Promise.resolve()
            },
            decrease()
            {
                return running(() => (this.opacity -= .01) <= 0)
            },
            increase()
            {
                return running(() => (this.opacity += .01) >= 1)
            },
            toggle(html)
            {
                const insert = this.insert.bind(this, html),
                    increase = this.increase.bind(this),
                    decrease = this.decrease.bind(this),
                    r = Promise.resolve()

                return this.loop && this.started
                    ? r.then(decrease).then(insert).then(increase)
                    : this.insert(html)
            },
            circle()
            {
                let self = this, i = 0

                this.started = false
                this.loop = true;

                (function loop() {
                    self.cid && clearTimeout(self.cid)
                    self.cid = setTimeout(loop, self.delay)
                    self.load(self.src[i++])
                    i %= self.src.length
                })()
            },
            single()
            {
                this.load(this.src)
            },
            init()
            {
                Array.isArray(this.src) ? this.circle() : this.single()
            }
        },
        async created()
        {
            Array.isArray(this.src) ? this.src.map(this.load) : await this.load(this.src)
        },
        mounted()
        {
            this.$nextTick().then(this.init)
        }
    }
</script>

<style lang="scss" scoped>
    .logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: absolute;
        left: 50%;
        top: 45%;

        will-change: opacity;
        transform: translate(-50%, -50%);
        cursor: pointer;

        .logo-container {
            position: relative;

            /* &.glitch-m {
                @include svgGlitch(#CFCFCF, 'rgba(0,0,0,0)', #CFCFCF, #F5F5F5, 100%, 100%, 0, 0);
            }
            &.glitch-w {
                @include svgGlitch(#CFCFCF, #F5F5F5, #CFCFCF, #F5F5F5, 100%, 100%, 0, 0);
            } */
            & > svg {
                will-change: transform, contents;
                position: absolute;
            }
        }
        h3 {
            padding: 10px 0;
            margin: 0;

            font-weight: 600 !important;
            text-transform: uppercase;
            text-align: center;

            letter-spacing: -1px;
            white-space: nowrap;
            user-select: none;
            color: #CFCFCF;

            will-change: transform, contents;

            /* &.color-secondary {
                @include textGlitch(#1abc9c, #F5F5F5, #1abc9c, #F5F5F5);
            }
            &.color-accent {
                @include textGlitch(#82b1ff, #F5F5F5, #82b1ff, #F5F5F5);
            }
            &.color-info {
                @include textGlitch(#00d3ee, #F5F5F5, #00d3ee, #F5F5F5);
            }
            &.glitch {
                @include textGlitch(#CFCFCF, #F5F5F5, #CFCFCF, #F5F5F5);
            } */
        }
        /* &.theme--dark {
            .logo-container {
                @include svgGlitch(#CFCFCF, #242424, #CFCFCF, #F5F5F5, 100%, 100%, 0, 0);
                background-color: #242424;
            }
            h3.glitch {
                @include textGlitch(#CFCFCF, #242424, #242424, #242424);
                background-color: #242424;
            }
        } */
    }
</style>
