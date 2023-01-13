<template>
    <div class="guide track" :class="type">
        <div class="info unselectable track" :style="info" v-html="pixel + 'px'" />
    </div>
</template>

<script>
    import { mapState } from 'vuex'

    const { floor, max, min } = Math

    function coords(e)
    {
        return {
            x: typeof e.clientX !== 'undefined' ? e.clientX : e.touches[0].clientX,
            y: typeof e.clientY !== 'undefined' ? e.clientY : e.touches[0].clientY
        }
    }

    export default {
        props: {
            type: {
                required: true,
                type: String
            },
            snap: {
                type: [Number, String],
                default: 1
            },
            id: {
                required: true,
                type: Number
            },
            evt: {
                default: null
            },
            set: {
                default: null
            }
        },
        data: () => ({
            drag: false,
            percent: 0,
            pixel: 0,

            display: 'none',
            left: 0,
            top: 0
        }),
        computed: {
            ...mapState('canvas', ['client','origin','scaled','track']),

            eventsDetermine() {
                return this.mobile
                    ? { start: 'touchstart', move: 'touchmove', end: 'touchend' }
                    : { start: 'mousedown',  move: 'mousemove', end: 'mouseup' }
            },
            originSize() {
                return this.type === 'v' ? this.origin.width : this.origin.height
            },
            scaledSize() {
                return this.type === 'v' ? this.scaled.width : this.scaled.height
            },
            cursor() {
                return this.type === 'v' ? 'col-resize' : 'row-resize'
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            info() {
                let { display, left, top } = this

                if (this.drag) {
                    display = 'block'
                }
                if (this.pixel < 0) {
                    display = 'none'
                }

                return { display, left, top }
            }
        },
        watch: {
            drag(status) {
                document.body.style.cursor = status ? this.cursor : 'auto'
            },
            set(data) {
                this.setPercent(data).setGuide()
            }
        },
        methods: {
            addEvents()
            {
                const { move, end } = this.eventsDetermine

                document.addEventListener(move, this.mouseMove)
                document.addEventListener(end, this.mouseUp)
            },
            removeEvents()
            {
                const { move, end } = this.eventsDetermine

                document.removeEventListener(move, this.mouseMove)
                document.removeEventListener(end, this.mouseUp)
            },
            update({ id, percent, pixel })
            {
                if (pixel < 0) {
                    percent = null
                    pixel = null
                }

                this.$emit('update:guide', { id, percent, pixel })
            },
            setGuide()
            {
                let left = 0, top = 0

                switch (this.type) {
                    case 'v': left = this.percent + '%'; break
                    case 'h': top = this.percent + '%'
                }

                this.$el.style.left = left
                this.$el.style.top = top

                return this
            },
            setInfo({ clientX, clientY })
            {
                let left, top

                if (this.type === 'v') {
                    top = max(min(clientY, this.scaled.height) - 27, 2)
                    left = 2

                    switch (true) {
                        case clientX > this.scaled.width:
                            left = -52
                            break

                        case clientX > this.scaled.width - 52:
                            left = this.scaled.width - clientX - 52
                    }
                }
                if (this.type === 'h') {
                    left = max(min(clientX, this.scaled.width) - 52, 2)
                    top = 2

                    switch (true) {
                        case clientY > this.scaled.height:
                            top = -27
                            break

                        case clientY > this.scaled.height - 27:
                            top = this.scaled.height - clientY - 27
                    }
                }

                this.left = left + 'px'
                this.top = top + 'px'

                if (this.pixel >= 0) {
                    this.display = 'block'
                }

                return this
            },
            calcPercent({ clientX, clientY })
            {
                let pc = this.type === 'v' ? clientX : clientY,
                    snap = Number(this.snap)

                pc = max(min(pc, this.scaledSize), -30)
                pc /= this.scaled.scale
                pc = floor(pc)
                pc -= (pc % snap)

                this.percent = 100 * pc / this.originSize
                this.pixel = pc

                return this
            },
            setPercent({ percent, pixel })
            {
                this.percent = percent
                this.pixel = pixel

                return this
            },
            mouseUp()
            {
                this.removeEvents()
                this.drag = false
                this.update(this)
            },
            mouseMove(e)
            {
                let { x, y } = coords(e)

                x -= this.client.left + this.track.x
                y -= this.client.top + this.track.y

                this.calcPercent({ clientX: x, clientY: y })
                    .setInfo({ clientX: x, clientY: y })
                    .setGuide()
            },
            mouseDown(e)
            {
                const { x, y } = coords(e)

                this.mouseMove({ clientX: x, clientY: y })

                this.addEvents()
                this.drag = true
            },
            mouseOver()
            {
                this.display = 'block'
            },
            mouseOut()
            {
                this.display = 'none'
            }
        },
        beforeDestroy()
        {
            document.body.style.cursor = 'auto'
            this.display = 'none'

            this.removeEvents()
        },
        mounted()
        {
            const { start } = this.eventsDetermine

            this.$el.addEventListener(start, this.mouseDown)

            if (!this.mobile) {
                this.$el.addEventListener('mouseover', this.mouseOver)
                this.$el.addEventListener('mouseout', this.mouseOut)
            }

            switch (true) {
                case this.evt !== null:
                    this.mouseDown(this.evt)
                    break

                case this.set !== null:
                    this.setPercent(this.set)
                        .setGuide()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .guide {
        position: absolute;

        .info {
            position: absolute;
            height: 25px;
            width: 50px;

            text-align: center;
            line-height: 25px;
            font-size: 13px;

            background-color: #eee !important;
            border: solid 1px #ccc !important;
            color: #000
        }
        &.v {
            height: 100%;
            width: 1px;

            padding-right: 2px !important;
            border-left: solid 1px #00f;
            cursor: col-resize;

            .info {
                left: 2px
            }
        }
        &.h {
            height: 1px;
            width: 100%;

            padding-bottom: 2px !important;
            border-top: solid 1px #00f;
            cursor: row-resize;

            .info {
                top: 2px
            }
        }
    }
</style>
