<template>
    <div @wheel.prevent="transformOpacity" class="wrapper" :class="{ bounce, fullscreen: mobile, presentation }" :style="{ zIndex }">
        <div class="flipper" :class="{ rotated }">
            <div class="front">
                <core-calc @flip="flip" @off="off" :background-color="background" />
            </div>

            <div class="back">
                <core-calendar @flip="flip" @off="off" :background-color="background" />
            </div>
        </div>
    </div>
</template>

<script>
    import { rgbaStringify } from '~/utils/common/rgba-stringify.mjs'
    import { hexToRgbA } from '~/utils/common/hex-to-rgba.mjs'
    import { rclamp } from '~/utils/common/clamp.mjs'

    const clamp = (v, l, h) => v > h ? h : v < l ? l : v

    function whichBtn({ which, button })
    {
        if (!which && button) {
            switch (true) {
                case !!(button & 1):  // left
                    which = 1
                    break
                case !!(button & 2):  // right
                    which = 3
                    break
                case !!(button & 4):  // midd
                    which = 2
                    break
            }
        }

        return which
    }

    export default {
        props: {
            presentation: {
                type: Boolean,
                default: false
            },
            entity: {
                type: String,
                default: 'calculator'
            }
        },
        computed: {
            zIndex() {
                const { draggable } = this.$store.state.canvas

                return draggable.length > 1
                    ? draggable.findIndex(el => el === this._uid)
                    : 7
            },
            theme() {
                return this.$vuetify.theme.isDark ? 'dark' : 'light'
            },
            background() {
                const theme = this.$vuetify.theme.themes[this.theme],
                    color = this.theme === 'light'
                        ? this.$store.state.app.color
                        : 'accent',

                    c = theme[color],
                    o = this.opacity

                return this.mobile ? c : rgbaStringify(hexToRgbA(c, o))
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            opacity: {
                set(calc) {
                    this.$store.commit('app/set', { calc })
                },
                get() {
                    return this.$store.state.app.calc
                }
            }
        },
        data: () => ({
            rotated: false,
            bounce: true,

            offsetX: null,
            offsetY: null,
            left: null,
            top: null,
            tid: null,
            oid: null,

            mode: 0,
            snap: 1
        }),
        watch: {
            '$store.state.app.window': 'recalc',

            entity(v) {
                this.rotated = v === 'calendar'
            },
            left(x) {
                this.$el.style.left = x + 'px'
            },
            top(y) {
                this.$el.style.top = y + 'px'
            },

            rotated: 'storePosition'
        },
        methods: {
            dragRemove()
            {
                this.$store.commit('canvas/dragRemove', this._uid)
            },
            dragPush()
            {
                this.$store.commit('canvas/dragPush', this._uid)
            },
            dragSort()
            {
                this.$store.commit('canvas/dragSort', this._uid)
            },
            recalc()
            {
                this.calculateCoords(this.$el.offsetLeft, this.$el.offsetTop)
            },
            calcByMount()
            {
                const x = this.$el.offsetLeft, y = this.$el.offsetTop

                this.setCoords({
                    ...this.modeResolver(x - (x % this.snap), y - (y % this.snap)),
                    offset: 50
                })
            },
            calculateCoords(x, y)
            {
                this.setCoords(this.modeResolver(x - (x % this.snap), y - (y % this.snap)))
            },
            setCoords({ left, top, rotated, offset = 0 })
            {
                const { width: cw, height: ch } = this.$el.getBoundingClientRect(),
                    { width: ww, height: wh } = this.$screen

                this.left = rclamp(left, 0, ww - cw - offset)
                this.top = rclamp(top, 0, wh - ch - offset)

                this.rotated = this.presentation
                    ? this.entity === 'calendar'
                    : rotated

            },
            modeResolver(x, y)
            {
                return {
                    left: this.mode === 2 ? this.left : x,
                    top:  this.mode === 1 ? this.top  : y,

                    rotated: this.rotated
                }
            },
            mouseUp()
            {
                document.removeEventListener('mousemove', this.mouseMove)
                document.removeEventListener('mouseup', this.mouseUp)

                this.storePosition()
            },
            mouseMove({ clientX: x, clientY: y })
            {
                this.calculateCoords(x - this.offsetX, y - this.offsetY)
            },
            mouseDown({ clientX: x, clientY: y, which, button })
            {
                this.dragSort()

                if (whichBtn({ which, button }) !== 1) return

                document.addEventListener('mousemove', this.mouseMove)
                document.addEventListener('mouseup', this.mouseUp)

                this.offsetX = x - this.$el.offsetLeft
                this.offsetY = y - this.$el.offsetTop
            },
            readPosition()
            {
                return this.mobile
                    ? Promise.reject()
                    : this.$ls.get('position', {}).then(position => position.combo || {
                        top: (this.$screen.height / 2) - this.$el.clientHeight / 2,
                        left: (this.$screen.width / 2) - this.$el.clientWidth / 2
                    })
            },
            storePosition()
            {
                return this.$ls.get('position', {})
                    .then(position => this.$ls.set('position', {
                        ...position,

                        combo: {
                            rotated: this.rotated,
                            left: this.left,
                            top: this.top
                        }
                    }))
            },
            transformOpacity(e)
            {
                const dy = (e.deltaY || e.wheelDelta) > 0 ? +.03 : -.03

                this.opacity = clamp(this.opacity + dy, .5, 1)
            },
            off()
            {
                this.$emit('tool:cancel', true)
                this.$emit('calc:off')
            },
            flip()
            {
                this.rotated = !this.rotated
            }
        },
        beforeDestroy()
        {
            this.storePosition()
            this.dragRemove()
        },
        beforeMount()
        {
            if (this.mobile) return this.bounce = false

            this.readPosition = this.readPosition.bind(this)
            this.setCoords = this.setCoords.bind(this)

            this.readPosition().then(this.setCoords)
        },
        async mounted()
        {
            this.dragPush()

            if (this.mobile) return

            await this.$nextTick()

            this.$el.addEventListener('mousedown', this.mouseDown)

            this.tid && clearTimeout(this.tid)
            this.tid = setTimeout(() => {
                this.bounce = false

                if (!this.presentation) {
                    this.calcByMount()
                }

            }, 1e3)
        }
    }
</script>

<style lang="scss" scoped>
    .wrapper {
        position: fixed;
        height: 100%;
        width: 100%;

        perspective: 1200px;
        -moz-transform: perspective(1200px);
        transform-style: preserve-3d;
        text-align: center;

        &.bounce {
            animation: 1s bounce;
        }
        &:not(.fullscreen) {
            max-height: 345px;
            max-width: 255px;
        }
        &.fullscreen {
            max-height: 100vh;
            max-width: 100%;

            border-radius: 0;
            animation: none;
        }
        .flipper {
            position: relative;
            height: 100%;
            width: 100%;

            border-radius: 5px;
            transform-style: preserve-3d;
            transition: .7s linear;

            box-shadow:
                0 2px 4px -1px rgba(0,0,0,.2),
                0 4px 5px 0 rgba(0,0,0,.14),
                0 1px 10px 0 rgba(0,0,0,.12);

            .front, .back {
                box-sizing: border-box;
                position: absolute;
                left: 0;
                top: 0;

                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                user-select: none;
            }
            .front {
                transform: rotateY(0deg);
            }
            .back {
                transform: rotateY(-180deg);
            }
            &.rotated {
                transform: rotateY(180deg);
            }
        }
        &.presentation {
            .flipper {
                transition: 300ms linear;
            }
            &.bounce {
                animation: 700ms bounce;
            }
        }
    }
    @keyframes bounce {
        from, 20%, 40%, 60%, 80%, to {
            animation-timing-function: cubic-bezier(.215,.61,.355,1);
        }
        0% {
            transform: scale3d(.3,.3,.3);
            opacity: 0;
        }
        20% {
            transform: scale3d(1.1,1.1,1.1);
        }
        40% {
            transform: scale3d(.9,.9,.9);
        }
        60% {
            transform: scale3d(1.03,1.03,1.03);
            opacity: 1;
        }
        80% {
            transform: scale3d(.97,.97,.97);
        }
        to {
            transform: scale3d(1,1,1);
            opacity: 1;
        }
    }
</style>
