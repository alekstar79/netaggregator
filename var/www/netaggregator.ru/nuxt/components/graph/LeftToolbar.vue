<template>
    <div class="tool-wrapper left" v-bind="$attrs" v-click-outside="hide" :class="{ [color]: true, visible, flat: !docked }" :style="style">
        <div v-if="!mobile" class="drag-header-left" :class="{ [color]: true }">
            <svg fill="#eee" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 25" width="50" height="25">
                <path d="M11.56 6.25C11.56 5.1 10.62 4.17 9.48 4.17C8.33 4.17 7.4 5.1 7.4 6.25C7.4 7.4 8.33 8.33 9.48 8.33C10.62 8.33 11.56 7.4 11.56 6.25ZM17.81 18.75C17.81 17.6 16.87 16.67 15.73 16.67C14.58 16.67 13.65 17.6 13.65 18.75C13.65 19.9 14.58 20.83 15.73 20.83C16.87 20.83 17.81 19.9 17.81 18.75ZM11.56 18.75C11.56 17.6 10.62 16.67 9.48 16.67C8.33 16.67 7.4 17.6 7.4 18.75C7.4 19.9 8.33 20.83 9.48 20.83C10.62 20.83 11.56 19.9 11.56 18.75ZM11.56 12.5C11.56 11.35 10.62 10.42 9.48 10.42C8.33 10.42 7.4 11.35 7.4 12.5C7.4 13.65 8.33 14.58 9.48 14.58C10.62 14.58 11.56 13.65 11.56 12.5ZM17.81 12.5C17.81 11.35 16.87 10.42 15.73 10.42C14.58 10.42 13.65 11.35 13.65 12.5C13.65 13.65 14.58 14.58 15.73 14.58C16.87 14.58 17.81 13.65 17.81 12.5ZM21.98 8.33C23.12 8.33 24.06 7.4 24.06 6.25C24.06 5.1 23.12 4.17 21.98 4.17C20.83 4.17 19.9 5.1 19.9 6.25C19.9 7.4 20.83 8.33 21.98 8.33ZM17.81 6.25C17.81 5.1 16.87 4.17 15.73 4.17C14.58 4.17 13.65 5.1 13.65 6.25C13.65 7.4 14.58 8.33 15.73 8.33C16.87 8.33 17.81 7.4 17.81 6.25ZM24.06 12.5C24.06 11.35 23.12 10.42 21.98 10.42C20.83 10.42 19.9 11.35 19.9 12.5C19.9 13.65 20.83 14.58 21.98 14.58C23.12 14.58 24.06 13.65 24.06 12.5ZM24.06 18.75C24.06 17.6 23.12 16.67 21.98 16.67C20.83 16.67 19.9 17.6 19.9 18.75C19.9 19.9 20.83 20.83 21.98 20.83C23.12 20.83 24.06 19.9 24.06 18.75Z" />
                <path d="M30.08 6.25C30.08 5.1 29.15 4.17 28 4.17C26.85 4.17 25.92 5.1 25.92 6.25C25.92 7.4 26.85 8.33 28 8.33C29.15 8.33 30.08 7.4 30.08 6.25ZM36.33 18.75C36.33 17.6 35.4 16.67 34.25 16.67C33.1 16.67 32.17 17.6 32.17 18.75C32.17 19.9 33.1 20.83 34.25 20.83C35.4 20.83 36.33 19.9 36.33 18.75ZM30.08 18.75C30.08 17.6 29.15 16.67 28 16.67C26.85 16.67 25.92 17.6 25.92 18.75C25.92 19.9 26.85 20.83 28 20.83C29.15 20.83 30.08 19.9 30.08 18.75ZM30.08 12.5C30.08 11.35 29.15 10.42 28 10.42C26.85 10.42 25.92 11.35 25.92 12.5C25.92 13.65 26.85 14.58 28 14.58C29.15 14.58 30.08 13.65 30.08 12.5ZM36.33 12.5C36.33 11.35 35.4 10.42 34.25 10.42C33.1 10.42 32.17 11.35 32.17 12.5C32.17 13.65 33.1 14.58 34.25 14.58C35.4 14.58 36.33 13.65 36.33 12.5ZM40.5 8.33C41.65 8.33 42.58 7.4 42.58 6.25C42.58 5.1 41.65 4.17 40.5 4.17C39.35 4.17 38.42 5.1 38.42 6.25C38.42 7.4 39.35 8.33 40.5 8.33ZM36.33 6.25C36.33 5.1 35.4 4.17 34.25 4.17C33.1 4.17 32.17 5.1 32.17 6.25C32.17 7.4 33.1 8.33 34.25 8.33C35.4 8.33 36.33 7.4 36.33 6.25ZM42.58 12.5C42.58 11.35 41.65 10.42 40.5 10.42C39.35 10.42 38.42 11.35 38.42 12.5C38.42 13.65 39.35 14.58 40.5 14.58C41.65 14.58 42.58 13.65 42.58 12.5ZM42.58 18.75C42.58 17.6 41.65 16.67 40.5 16.67C39.35 16.67 38.42 17.6 38.42 18.75C38.42 19.9 39.35 20.83 40.5 20.83C41.65 20.83 42.58 19.9 42.58 18.75Z" />
            </svg>
        </div>

        <nav class="left-toolbar">
            <template v-for="(tool, i) in tools">
                <v-tooltip :key="i" :disabled="mobile" right>
                    <template #activator="{ on }">
                        <v-btn class="toolbar-item"
                            @click="tool.handler"
                            :disabled="tool.hidden"
                            :aria-label="tool.id"
                            v-on="on"
                            ripple
                            tile
                            icon
                        >
                            <v-icon>{{ tool.icon }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t(tool.name) }}</span>
                </v-tooltip>
            </template>
        </nav>
    </div>
</template>

<script>
    import { debounce } from '~/utils/common/debounce.mjs'
    import { rclamp } from '~/utils/common/clamp.mjs'

    function coords(e)
    {
        return {
            x: typeof e.pageX !== 'undefined' ? e.pageX : e.touches[0].pageX,
            y: typeof e.pageY !== 'undefined' ? e.pageY : e.touches[0].pageY
        }
    }

    function check(el, target)
    {
        if (!el.classList.contains(target)) {
            return !!el.parentElement && check(el.parentElement, target)
        }

        return true
    }

    function whichBtn(e, which = 1)
    {
        if (!e.which && e.button) {
            switch (true) {
                case !!(e.button & 1):  // left
                    e.which = 1
                    break
                case !!(e.button & 2):  // right
                    e.which = 3
                    break
                case !!(e.button & 4):  // midd
                    e.which = 2
                    break
            }
        }

        return e.which === which
    }

    export default {
        props: {
            visible: {
                default: false,
                type: Boolean
            },
            tools: {
                required: true,
                type: Array
            }
        },
        data() {
            return {
                width: '49px',
                docked: true,
                down: false,
                zIndex: 99,

                flat: {
                    left: this.left,
                    top: '50%'
                }
            }
        },
        computed: {
            eventsDetermine() {
                return this.mobile
                    ? { start: 'touchstart', move: 'touchmove', end: 'touchend' }
                    : { start: 'mousedown',  move: 'mousemove', end: 'mouseup' }
            },
            left() {
                return !this.visible ? `calc(-${this.width} + 5px)` : '5px'
            },
            style() {
                return this.docked ? { left: this.left } : { zIndex: this.zIndex, ...this.flat }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            '$store.state.app.window': 'update',

            docked(value) {
                if (value) {
                    this.flat = {
                        left: this.left,
                        top: '50%'
                    }
                }
            }
        },
        methods: {
            measure()
            {
                let w, h

                if ((h = this.$el.clientHeight)) {
                    this.$emit('change', { position: 'left', size: `${h}px` })
                }
                if ((w = this.$el.clientWidth)) {
                    this.width = `${w}px`
                }
            },
            mousedown(e)
            {
                if (this.down || !whichBtn(e) || !check(e.target, 'drag-header-left')) return

                let rect = this.$el.getBoundingClientRect(),
                    { width: sw, height: sh } = this.$screen,
                    { move, end } = this.eventsDetermine,

                    shiftX = e.clientX - rect.left,
                    shiftY = e.clientY - rect.top,

                    height = rect.height / 2,
                    width = rect.width,

                    lh = sh - height,
                    lw = sw - width,

                    self = this,

                    left, top

                function moveAt({ x, y }) {
                    top = rclamp(y - shiftY + height, height - shiftY + 10, lh)
                    left = rclamp(x - shiftX, 0, lw)

                    self.flat = {
                        left: left + 'px !important',
                        top: top + 'px !important'
                    }
                }

                function mousemove(e) {
                    e.stopPropagation()
                    e.preventDefault()

                    moveAt(coords(e))
                }

                function mouseup() {
                    document.removeEventListener(move, mousemove)
                    document.removeEventListener(end, mouseup)

                    self.down = false
                    self.docked = left < 18
                    self.zIndex = 99
                }

                document.addEventListener(move, mousemove)
                document.addEventListener(end, mouseup)

                this.docked = false
                this.zIndex = 100
                this.down = true

                e.stopPropagation()
                e.preventDefault()

                moveAt(coords(e))
            },
            hide({ target })
            {
                if (target.getAttribute('click-behavior') === 'prevent') return

                this.$emit('hide', { position: 'left', state: false })
            },
            update: debounce(function() {
                this.measure()
            }, 0)
        },
        mounted()
        {
            this.update()

            this.$nextTick().then(() => {
                this.$el.addEventListener(this.eventsDetermine.start, this.mousedown)
            })
        },
        beforeDestroy()
        {
            this.$el.removeEventListener(this.eventsDetermine.start, this.mousedown)
        }
        /* updated()
        {
            this.update()
        } */
    }
</script>

<style lang='scss' scoped>
    .tool-wrapper.left {
        transition: .2s cubic-bezier(.4,0,.2,1);
        z-index: 99;

        &.visible,
        &:hover {
            left: 5px !important;
        }
        &.flat {
            transition: unset;

            &.visible,
            &:hover {
                left: unset;
            }
        }
        .drag-header-left {
            position: absolute;
            top: -15px;
            left: 0;

            width: 100%;

            border-radius: 5px;
            text-align: center;
            cursor: pointer;

            svg {
                height: 15px;
            }
        }
        .left-toolbar {
            display: grid;
            grid-template-rows: repeat(auto-fit, 44px);
            grid-auto-flow: column;
            max-height: 60vh;
            direction: rtl;
        }
    }
</style>
