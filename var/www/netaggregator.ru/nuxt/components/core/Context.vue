<template>
    <v-dialog v-model="view" :content-class="`context theme--${$vuetify.theme.dark ? 'dark' : 'light'}`" :transition="false" :persistent="presentation" hide-overlay eager>
        <svg :style="{ height, width }" @wheel.prevent="transformOpacity" @contextmenu.prevent="hide" @click.prevent="hide" ref="nav" />
    </v-dialog>
</template>

<script>
    const clamp = (v, l, h) => v > h ? h : v < l ? l : v

    function polarToCartesian(cx, cy, r, angle)
    {
        angle = (angle - 90) * Math.PI / 180

        return {
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        }
    }

    function describeArc(x, y, r, startAngle, endAngle, lineMove, alter)
    {
        const start = polarToCartesian(x, y, r, startAngle %= 360),
            end = polarToCartesian(x, y, r, endAngle %= 360)

        return '' + (lineMove ? 'L' : 'M') + start.x + ' ' + start.y +
            ' A' + r + ' ' + r + ', 0, ' + (endAngle - startAngle >= 180 ? 1 : 0) +
            ', ' + (alter ? 0 : 1) + ', ' + end.x + ' ' + end.y
    }

    function describeSector(x, y, r, r2, startAngle, endAngle)
    {
        return '' + describeArc(x, y, r, startAngle, endAngle, false, false) +
            ' ' + describeArc(x, y, r2, endAngle, startAngle, true, true) +
            'Z'
    }

    function hover(fIn, fOut, sIn, sOut)
    {
        return this.mouseover(fIn, sIn).mouseout(fOut || fIn, sOut || sIn)
    }

    function toggleActiveState()
    {
        for (let i = 0; i < 3; i++) {
            this[i].toggleClass('active')
        }
    }

    function plugin(snap)
    {
        snap.plugin((snap, el) => el.prototype.hover = hover)

        return true
    }

    /**
    * @see http://sorax.org
    * @see https://github.com/artsorax/sl_radialnav_demo
    */
    export default {
        props: {
            value: null,

            path: {
                default: '/img/radialnav/icons.svg',
                type: String
            },
            buttons: {
                required: true,
                type: Array
            },
            offsetX: {
                type: Number,
                default: 0
            },
            offsetY: {
                type: Number,
                default: 0
            }
        },
        data: () => ({
            presentation: null,
            container: null,
            paper: null,
            area: null,
            snap: null,

            radial: null,
            text: null,

            width: '100%',
            height: '100%',
            duration: 300,
            r: 125,

            view: false
        }),
        computed: {
            icons: {
                set(icons) {
                    this.$store.commit('context/set', { icons })
                },
                get() {
                    return this.$store.state.context.icons
                }
            },
            opacity: {
                set(menu) {
                    this.$store.commit('app/set', { menu })
                },
                get() {
                    return this.$store.state.app.menu
                }
            },
            theme() {
                return this.$vuetify.theme.dark ? 'dark' : 'light'
            },
            color() {
                const theme = this.$vuetify.theme.themes[this.theme]

                return theme[
                    this.theme === 'light'
                        ? this.$store.state.app.color
                        : 'accent'
                ]
            },
            angle() {
                return 360 / (this.buttons.length || 6)
            },
            r2() {
                return .35 * this.r
            }
        },
        watch: {
            '$store.state.app.locale': 'update',
            '$store.state.app.color': 'update',

            opacity: 'change',
            theme: 'update',
            value: 'show',

            $route() {
                this.init()
            }
        },
        methods: {
            setNodes()
            {
                /** @type {Element} */
                const el = this.$refs.nav

                this.radial = el.querySelectorAll('path.radial-sector')
                this.text = el.querySelectorAll('text.radial-hint')
            },
            setAttributes(attrs)
            {
                attrs || (attrs = this.$attrs)

                Object.keys(attrs).forEach(k => {
                    k === 'data-id'
                        ? this.container.node.setAttribute('id', attrs[k])
                        : this.container.node.setAttribute(k, attrs[k])
                })
            },
            transformOpacity(e)
            {
                const dy = (e.deltaY || e.wheelDelta) > 0 ? +.03 : -.03

                this.opacity = clamp(this.opacity + dy, .4, 1)
            },
            change(opacity)
            {
                if (!this.radial) return

                this.radial.forEach(path => path.style.opacity = opacity)
            },
            toggle(view)
            {
                this.view = view
            },
            animate(obj, idx, start, end, duration, easing, fn, cb)
            {
                obj.animation || (obj.animation = [])

                if (obj.animation[idx]) {
                    obj.animation[idx].stop()
                }

                obj.animation[idx] = this.snap.animate(start, end, fn, duration, easing, cb)
            },
            animateContainer(start, end, duration, easing)
            {
                this.animate(this, 0, start, end, duration, easing, val => {
                    this.container.transform('r' + (90 - 90 * val) + ',' + this.c + ',' + this.c + 's' + val + ',' + val + ',' + this.c + ',' + this.c)
                }, this.toggle.bind(this, !start))
            },
            animateButtons(start, end, min, max, easing)
            {
                const r = (min, max) => Math.random() * (max - min) + min,
                    ref = this.container

                return Object.keys(ref).filter(i => !Number.isNaN(+i)).map(
                    i => this.animate(ref[i], 0, start, end, r(min, max), easing, val => {
                        ref[i].transform('r' + (this.angle * i) + ',' + this.c + ',' + this.c + 's' + val + ',' + val + ',' + this.c + ',' + this.c)
                    }, () => {})
                )
            },
            animateButtonHover(button, start, end, duration, easing, cb)
            {
                return this.animate(button, 1, start, end, duration, easing, val => {
                    button[0].attr({ d: describeSector(this.c, this.c, this.r - val * 10, this.r2, 0, this.angle) })
                    button[2].transform('s' + (1.1 - val * .1) + ',' + (1.1 - val * .1) + ',' + this.c + ',' + this.c)
                }, cb)
            },
            sector()
            {
                const { c, r, r2, area, angle, color: fill, opacity } = this

                return area.path(describeSector(c, c, r, r2, 0, angle))
                    .attr({ fill, stroke: fill, opacity })
                    .addClass('radial-sector')
            },
            icon(btn)
            {
                const { c, r, r2, angle } = this,
                    icons = this.snap.parse(this.icons),
                    icon = icons.select('#' + btn.icon),
                    bbox = icon.getBBox()

                icon.transform(
                    'T'  + (c - bbox.x - bbox.width / 2) +
                    ', ' + (c - bbox.y - r + r2 - bbox.height / 2 - 5) +
                    ' R' + (angle / 2) + ',' + c + ',' + c + 'S.7'
                )

                icon.addClass('radial-icon')

                return icon
            },
            hint(btn)
            {
                const { c, r, angle, area, /* color: fill, */ opacity } = this,
                    fill = this.theme === 'light' ? '#333333' : '#7a7a7a',
                    text = this.$t(`context.${btn.hint || btn.icon}`),
                    textpath = describeArc(c, c, r, 0, angle),

                    hint = area.text(0, 0, text/* .toUpperCase() */)
                        .addClass('radial-hint hide')
                        .attr({ textpath, opacity })

                hint.select('*').attr({
                    startOffset: '50%',
                    fill
                })

                return hint
            },
            buttonOver(btn)
            {
                const { easeinout = n => n } = window.mina || {},
                    self = this

                return function() {
                    if (!self.buttons.length) return

                    self.$emit('hover', btn)
                    self.animateButtonHover(this, 0, 1, 2e2, easeinout)
                    this[2].removeClass('hide')
                }
            },
            buttonOut(btn)
            {
                const { elastic = n => n } = window.mina || {},
                    self = this

                return function() {
                    if (!self.buttons.length) return

                    self.$emit('out', btn)
                    self.animateButtonHover(this, 1, 0, 2e3, elastic, () => {
                        this[2].addClass('hide')
                    })
                }
            },
            button(btn, sector, icon, hint)
            {
                const over = this.buttonOver(btn),
                    out = this.buttonOut(btn)

                return this.area.g(sector, icon, hint)
                    .mouseup(() => this.$emit('toggle', btn))
                    .hover(toggleActiveState)
                    .hover(over, out)
            },
            update()
            {
                this.$nextTick(() => {
                    if (!this.icons || !this.container) return

                    try {

                        this.container.clear()

                        this.buttons.forEach(btn => this.container.add(
                            this.button(btn, this.sector(), this.icon(btn), this.hint(btn))
                        ))

                        this.setNodes()

                    } catch (e) {
                    }
                })
            },
            hide()
            {
                const { easeinout = n => n } = window.mina || {},
                    ms = this.duration

                this.animateButtons(1, 0, ms, ms, easeinout)
                this.animateContainer(1, 0, ms, easeinout)

                if (this.presentation) {
                    this.presentation = false

                    setTimeout(() => {
                        this.view = false
                    }, ms)
                }

                this.$emit('input', null)
            },
            show(e)
            {
                if (!e) return this.hide()

                this.presentation = e.presentation

                let { offsetX, offsetY, c, duration: ms } = this,
                    { elastic = n => n } = window.mina || {},

                    x = e.clientX - c - offsetX,
                    y = e.clientY - c - offsetY

                if (this.presentation) {
                    ms = 200
                }

                try {

                    this.area.attr({ x, y })
                    this.toggle(true)

                    this.animateButtons(0, 1, ms, ms * 8, elastic)
                    this.animateContainer(0, 1, ms * 8, elastic)

                } catch (error) {
                }

                if (e.preventDefault) {
                    e.preventDefault()
                }
            },
            init(snap, size = 500)
            {
                (snap && plugin(snap)) || ({ snap } = this)

                if (!snap) return Promise.reject()

                return this.$nextTick().then(() => {
                    this.paper || (this.paper = snap(this.$refs.nav))
                    this.paper.clear()

                    this.area = this.paper.svg(0, 0, size, size)
                    this.area.addClass('radial-nav')
                    this.container = this.area.g()
                    this.container.transform('s0')
                    this.snap = snap

                    this.c = size / 2
                    this.r = size / 4

                    this.setAttributes()

                    return this.loadIcons()
                })
                    .then(this.update)
                    .catch(() => {})
            },
            loadIcons()
            {
                return this.icons
                    ? Promise.resolve()
                    : fetch(this.path)
                        .then(r => r.ok ? r.text() : null)
                        .then(icons => {
                            this.icons = icons
                        })
            }
        },
        created()
        {
            this.snap = import(/* webpackChunkName: "snapsvg" */ 'snapsvg-cjs').then(m => m.default)
        },
        mounted()
        {
            this.snap.then(this.init)
        }
    }
</script>

<style lang="scss" scoped>
    ::v-deep .context {
        display: block;
        min-height: 100%;
        height: 100%;
        width: 100%;
        margin: 0;

        box-shadow: unset;
        border-radius: 0;
        overflow: hidden;
        transition: none;

        .hide {
            display: none;
        }
        .radial-nav {
            cursor: pointer;
        }
        .radial-sector {
            stroke-width: 1;
            transition: opacity .4s;
        }
        .radial-sector.active {
            opacity: 1 !important;
        }
        .radial-icon {
            pointer-events: none;
            transition: all .4s;
            fill: #eee;
        }
        .radial-icon.active {
            fill: #333;
        }
        .radial-hint {
            font-size: .75em;
            font-weight: bold;
            text-anchor: middle;
            /* firefox 95 bug -> 96 branch resolved see https://bugzilla.mozilla.org/show_bug.cgi?id=1738560 */
            text-transform: uppercase;
            opacity: 0 !important;
            transition: opacity .7s;
        }
        .radial-hint.active {
            opacity: 1 !important;
        }
        &.theme--dark {
            .radial-icon {
                fill: #7a7a7a;
            }
        }
    }
</style>
