<template>
    <div class="image-list"
        :class="{ visible, [color]: true }"
        v-click-outside="hide"
        @wheel.prevent.stop="wheel"
        @touchstart="startDrag"
        @touchend="stopDrag"
        @touchmove="onDrag"
        ref="box"
    >
        <v-layout ref="layout">
            <template v-for="block in list">
                <v-flex :key="block.type" ref="cards">
                    <v-menu v-model="block.state"
                        transition="slide-y-transition"
                        :close-on-content-click="mobile"
                        :content-class="`bottom-menu ${block.type}`"
                        :max-width="block.items.length < 12 ? 300 : 305"
                        :min-width="block.items.length < 12 ? 300 : 305"
                        :offset-y="true"
                        max-height="420"
                        open-on-hover
                        top
                    >
                        <template #activator="{ on }">
                            <v-card v-on="block.on(on)" class="image-list__item" flat tile>
                                <v-img :src="block.src" aspect-ratio="1" />

                                <div class="img-overlay">
                                    <div class="bg">
                                        {{ $t(`graph.stiker_${block.type}`) }}
                                    </div>
                                </div>
                            </v-card>
                        </template>

                        <v-card class="image-list__box">
                            <lazy-helper-vlist
                                :[clickBehavior]="'prevent'"
                                :className="`image-list__scroller ${block.class}`"
                                :overflowBehavior="{ x: 'hidden', y: 'scroll' }"
                                :items="chunk(block.items, 3)"
                                :visibleNodeCount="10"
                                :rootHeight="420"
                                :itemHeight="99"
                                :nodePadding="4"
                                ref="scroll"
                            >
                                <template #default="{ item, index }">
                                    <v-layout class="scroller-list__row">
                                        <template v-for="(set, j) in item">
                                            <v-flex :key="set.src">
                                                <v-card :class="`scroller-list__images--item type-${block.type}`"
                                                    @click="$emit('choose', { ...set, adjust: block.type === 'bgd' })"
                                                    :ripple="false"
                                                    flat
                                                    tile
                                                >
                                                    <div class="thumb" :style="position(set, block)">
                                                        <div v-if="['bgd', 'set'].includes(block.type)"
                                                            @click.stop="view(index, j, block.items)"
                                                            class="view-marker"
                                                        >
                                                            <v-icon color="#fff" dense>
                                                                mdi-eye-outline
                                                            </v-icon>
                                                        </div>

                                                        <div :[clickBehavior]="'prevent'" class="overlay" />
                                                    </div>
                                                </v-card>
                                            </v-flex>
                                        </template>
                                    </v-layout>
                                </template>
                            </lazy-helper-vlist>
                        </v-card>
                    </v-menu>
                </v-flex>
            </template>
        </v-layout>
    </div>
</template>

<script>
    import { cancelIdleCallback, fulfill } from '~/utils/callbacks.mjs'
    import { rclamp } from '~/utils/common/clamp.mjs'

    import chunk from 'lodash/chunk'

    let wdg = (_, i) => ({ src: `/img/graph/wdg/widget${(i + 1).toString().padStart(2, 0)}.svg` }),
        bgd = (_, i) => ({ src: `/img/graph/bgd/photo${(i + 1).toString().padStart(3, 0)}.jpg` }),
        set = (_, i) => ({ src: `/img/graph/set/photo${(i + 1).toString().padStart(3, 0)}.jpg` }),
        svg = (_, i) => ({ src: `/img/graph/svg/shape${(i + 1).toString().padStart(3, 0)}.svg` }),
        png = (_, i) => ({ src: `/img/graph/png/frame${(i + 1).toString().padStart(3, 0)}.png` }),

        build = (length, fn) => Array.from({ length }, fn),
        is = action => typeof action === 'function',

        list = [
            { src: '/img/graph/widget.svg',     items: build(12,  wdg), class: 'pr-0', type: 'wdg' },
            { src: '/img/graph/frame.png',      items: build(100, png), class: 'pr-2', type: 'png' },
            { src: '/img/graph/shape.svg',      items: build(300, svg), class: 'pr-2', type: 'svg' },
            { src: '/img/graph/photo.jpg',      items: build(300, set), class: 'pr-2', type: 'set' },
            { src: '/img/graph/background.jpg', items: build(100, bgd), class: 'pr-2', type: 'bgd' }
        ],

        e = ((events = {}) => ({
            emit: (name, ...data) => (events[name] || []).forEach(fn => fn(...data)),
            on: (name, fn) => (events[name] = events[name] || []).push(fn)
        }))()

    /**
    * @typedef Tile
    * @type {String} src
    * @type {String} type
    * @type {String} class
    * @type {Array} items
    * @type {Boolean} state
    */
    function Tile(options)
    {
        Object.assign(this, options, { e, state: false })

        this.e.on('close', this.close.bind(this))
    }

    Tile.prototype.on = function(listeners) {
        Object.keys(listeners).forEach(action => {
            const fn = listeners[action]

            listeners[action] = e => {
                this.e.emit('close', this.type)

                is(fn) && fn(e)

                if (action === 'click') {
                    listeners.mouseenter(e)
                }
            }
        })

        return listeners
    }

    Tile.prototype.close = function(type) {
        if (this.type !== type) {
            this.state = false
        }
    }

    export default {
        props: {
            visible: {
                default: false,
                type: Boolean
            }
        },
        data: () => ({
            list: list.map(options => new Tile(options)),

            breackPoints: [
                { p: 125,  m:  1  },
                { p: 250,  m: .9  },
                { p: 430,  m: .8  },
                { p: 500,  m: .7  },
                { p: 620,  m: .6  },
                { p: 830,  m: .7  },
                { p: 860,  m: .75 },
                { p: 1000, m: .7  },
                { p: 1091, m: .6  },
                { p: 1200, m: .55 }
            ],

            scrollWrapperWidth: null,
            scrollAreaWidth: null,

            start: { y: 0, x: 0 },
            dragging: false,
            taskHandle: 0,
            multiplier: 1,
            translate: 0,
            step: 20,
            mark: 0,
            max: 0
        }),
        computed: {
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            clickBehavior() {
                return 'click-behavior'
            }
        },
        watch: {
            '$store.state.app.window': 'resize'
        },
        methods: {
            chunk,

            position({ src }, { type })
            {
                if (type === 'wdg') {
                    return { backgroundImage: `url(${src})` }
                }

                let regexp = /([a-z]{3,})(\d+)\.([a-z]{3})/ui,
                    backgroundPosition = 'center center',
                    entity = src.match(regexp) || [],

                    flat, num, k1, k2, n1, y, x

                if (entity.length) {
                    flat = type === 'bgd' || type === 'set'
                    num = parseInt(entity[2])

                    k1 = flat ? 100 : 99
                    k2 = flat ? 0 : 7
                    n1 = num - 1

                    y = k1 * (n1 / 10 | 0)
                    x = k1 * (n1 % 10)

                    backgroundPosition = `-${x + k2}px -${y + k2}px`
                }

                return { backgroundPosition }
            },
            view(i, j, items)
            {
                let chunks = chunk(items, 3),
                    l = chunks.length - 1,
                    click = chunks[i][j],

                    p = i > 0 ? i - 1 : i + 2,
                    n = i < l ? i + 1 : i - 2,

                    max = Math.max(p, i, n),
                    min = Math.min(p, i, n),
                    mid = (max + min) / 2,

                    frame = chunks[min].concat(chunks[mid], chunks[max]),
                    idx = frame.findIndex(p => p.src === click.src)

                this.$bus.$emit('view', { frame, idx })
            },
            hide({ target })
            {
                if (this.$parent.presentation || this.$store.state.canvas.fixed ||
                    target.getAttribute('click-behavior') === 'prevent') {
                    return
                }

                this.$emit('hide', { position: 'bottom', state: false })

                this.list.forEach(tile => tile.state = false)
            },
            calcPoint(wBody)
            {
                this.multiplier = .5

                this.breackPoints.some(item => {
                    if (item.p > wBody) {
                        this.multiplier = item.m
                        return true
                    }

                    return false
                })
            },
            boxLength(wBody, wCell, wLayout)
            {
                return Math.min(
                    Math.floor((this.multiplier * wBody) / wCell) * wCell,
                    wLayout
                )
            },
            delta({ deltaY, wheelDelta })
            {
                return Math.max(-1, Math.min(1, (deltaY || wheelDelta)))
            },
            resize()
            {
                const { cards, box, layout } = this.$refs,
                    wBody = this.$el.parentElement.clientWidth,
                    wCell = cards[0].clientWidth,
                    wLayout = wCell * cards.length

                this.calcPoint(wBody)

                box.style.width = this.boxLength(wBody, wCell, wLayout) + 'px'
                layout.style.width = wLayout + 'px'

                this.calculate()

                if (this.taskHandle) cancelIdleCallback(this.taskHandle)

                this.taskHandle = fulfill(() => {
                    try {

                        this.max = layout.clientWidth - box.clientWidth

                        this.$emit('change', {
                            position: 'bottom',
                            size: window.getComputedStyle(/** @type HTMLElement */ box)
                                .getPropertyValue('width')
                        })

                        return true

                    } catch (e) {
                    }
                })
            },
            wheel(e)
            {
                this.translate = rclamp(this.translate - this.delta(e) * this.step, 0, this.max)

                this.$refs.layout.style.transform = `translateX(-${this.translate}px)`
            },
            startDrag(e)
            {
                const evt = e.changedTouches ? e.changedTouches[0] : e

                this.calculate(() => {
                    this.start = { y: evt.pageY, x: evt.pageX }
                    this.dragging = true
                })
            },
            onDrag(e)
            {
                if (!this.dragging) return

                this.mark++

                if (this.mark % 2) return

                const evt = e.changedTouches ? e.changedTouches[0] : e,
                    deltaY = -(this.start.x - evt.clientX)

                this.start = { y: evt.clientY, x: evt.clientX }

                this.wheel({ deltaY })
            },
            stopDrag()
            {
                this.dragging = false
                this.mark = 0
            },
            getSize()
            {
                const $scrollWrapper = this.$refs.box,
                    $scrollArea = this.$refs.layout

                return {
                    scrollWrapperWidth: $scrollWrapper.clientWidth,
                    scrollAreaWidth: $scrollArea.clientWidth
                }
            },
            calculate(cb)
            {
                const size = this.getSize()

                if (size.scrollWrapperWidth !== this.scrollWrapperWidth ||
                    size.scrollAreaWidth !== this.scrollAreaWidth
                ) {
                    this.scrollWrapperWidth = size.scrollWrapperWidth
                    this.scrollAreaWidth = size.scrollAreaWidth
                }
                if (typeof cb === 'function') {
                    cb()
                }
            },
            viewBlock(idx)
            {
                this.list.forEach((_, i) => {
                    this.list[i].state = i === idx
                })

                return new Promise(resolve => {
                    setTimeout(resolve)
                })
            },
            hideBlock(idx)
            {
                this.list[idx].state = false
            }
        },
        updated()
        {
            this.$nextTick().then(this.resize)
        },
        mounted()
        {
            this.$nextTick().then(this.resize)
        }
    }
</script>

<style lang='scss' scoped>
    .image-list {
        position: absolute;
        bottom: 0;
        left: 50%;

        border-radius: 5px;
        box-shadow:
            0 2px 4px -1px rgba(0,0,0,.2),
            0 4px 5px 0 rgba(0,0,0,.14),
            0 1px 10px 0 rgba(0,0,0,.12);

        transform: translate(-50%, 90px);
        transition: .2s cubic-bezier(.4,0,.2,1);
        overflow: hidden;

        z-index: 99;

        &.visible {
            bottom: 100px;
        }
        &:hover {
            bottom: 100px;
        }
        ::v-deep .layout {
            justify-content: flex-start;
            align-items: center;

            .flex {
                position: relative;
                padding: 7px;
                width: 100px;

                cursor: pointer;

                .image-list__item {
                    background-color: transparent !important;

                    .v-image {
                        border-radius: 5px;
                        filter: blur(2px);
                        transition: 1s filter;
                    }
                    .img-overlay {
                        position: absolute;
                        left: 0;
                        top: 0;

                        height: 100%;
                        width: 100%;

                        pointer-events: none;
                        cursor: pointer;

                        .bg {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100%;
                            width: 100%;

                            border-radius: 5px;
                            background-color: rgba(0,0,0,.1);
                            transition: 1s background-color, .7s color, .3s text-shadow;
                            font-weight: 500;
                            color: #ECECEC;

                            text-shadow:
                                -0 -1px 1px #606060,
                                0 -1px 1px #606060,
                                -0 1px 1px #606060,
                                0 1px 1px #606060,
                                -1px -0 1px #606060,
                                1px -0 1px #606060,
                                -1px 0 1px #606060,
                                1px 0 1px #606060,
                                -1px -1px 1px #606060,
                                1px -1px 1px #606060,
                                -1px 1px 1px #606060,
                                1px 1px 1px #606060,
                                -1px -1px 1px #606060,
                                1px -1px 1px #606060,
                                -1px 1px 1px #606060,
                                1px 1px 1px #606060;
                        }
                    }
                    &:hover {
                        .img-overlay .bg {
                            text-shadow: none;
                            background-color: transparent;
                            color: transparent;
                        }
                        .v-image {
                            filter: blur(0);
                        }
                    }
                }
            }
        }
    }
    .v-menu__content.bottom-menu {
        border-radius: 5px;

        .image-list__box {
            background-color: #fff;

            ::v-deep .image-list__scroller {
                .scroll-content {
                    background-color: #fff;
                }
                .scroller-list__row > div {
                    flex: 0 1 90px;
                    cursor: pointer;

                    padding: 5px 0 0 5px;

                    &:last-of-type {
                        padding-right: 5px;
                    }

                    .scroller-list__images--item {
                        .thumb {
                            background-color: rgb(250, 251, 252);
                            background-repeat: no-repeat;
                            background-size: auto;

                            height: 93px;
                            width: 93px;
                        }
                        &.type-png .thumb {
                            background-image: url(/img/graph/png-sprite.png)
                        }
                        &.type-svg .thumb {
                            background-image: url(/img/graph/svg-sprite.png)
                        }
                        &.type-set .thumb {
                            background-image: url(/img/graph/set-sprite.jpg)
                        }
                        &.type-bgd .thumb {
                            background-image: url(/img/graph/bg-sprite.jpg)
                        }
                        &.type-wdg .thumb {
                            background-size: contain;
                        }
                        .overlay {
                            background-color: rgba(70,70,70,.1);
                            transition: background-color .5s;
                            height: 100%;
                            width: 100%;
                        }
                        &.type-set .overlay,
                        &.type-bgd .overlay {
                            background-color: rgba(70,70,70,.4)
                        }
                        &:hover .overlay {
                            background-color: transparent;
                        }
                        .view-marker {
                            position: absolute;
                            right: 0;
                            top: 0;

                            padding: 5px 15px;
                            user-select: none;
                            cursor: pointer;
                            opacity: .7;
                        }
                    }
                }
                .scrollbar-track {
                    border-radius: 4px;
                    background: unset;

                    &.scrollbar-track-x {
                        display: none !important;
                    }
                    .scrollbar-thumb-y {
                        width: 5px;
                    }
                }
            }
        }
    }
</style>
