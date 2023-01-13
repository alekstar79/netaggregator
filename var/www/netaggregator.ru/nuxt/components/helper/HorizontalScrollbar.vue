<template>
    <div>
        <div v-if="width < 100" @click="jump" class="scrollbar__scrollbar-horizontal" ref="container">
            <div :class="'scrollbar' + (dragging || draggingFromParent ? '' : ' scrollbar-transition')"
                :style="{ width: width + '%', left: scrolling + '%' }"
                @touchstart="startDrag"
                @mousedown="startDrag"
                ref="scrollbar"
            />
        </div>
    </div>
</template>

<script>
    import { addEvents, removeEvents } from '~/utils/common/events.mjs'

    export default {
        props: {
            draggingFromParent: Boolean,
            scrolling: Number,
            wrapper: Object,
            area: Object,

            onChangePosition: Function,
            onDragging: Function,
            onStopDrag: Function,

            view: {
                type: Boolean,
                default: false
            }
        },
        model: {
            event: 'change',
            prop: 'view'
        },
        data() {
            return {
                dragging: false,
                width: 100,
                start: 0,

                events: {
                    mousemove: this.onDrag.bind(this),
                    touchmove: this.onDrag.bind(this),
                    mouseup: this.stopDrag.bind(this),
                    touchend: this.stopDrag.bind(this)
                }
            }
        },
        watch: {
            width(v) {
                this.$emit('change', v < 100)
            },
            'wrapper.width'() {
                this.calculateSize(this)
            },
            'area.width'() {
                this.calculateSize(this)
            }
        },
        methods: {
            startDrag(e)
            {
                e.preventDefault()
                e.stopPropagation()

                e = e.changedTouches ? e.changedTouches[0] : e

                this.dragging = true
                this.start = e.clientX
            },
            onDrag(e)
            {
                if (this.dragging) {
                    this.onDragging()

                    e.preventDefault()
                    e.stopPropagation()

                    e = e.changedTouches ? e.changedTouches[0] : e

                    let xMovement = e.clientX - this.start
                    let xMovementPercentage = xMovement / this.wrapper.width * 100

                    // Update the last e.clientX
                    this.start = e.clientX

                    // The next Horizontal Value will be
                    let next = this.scrolling + xMovementPercentage

                    // Tell the parent to change the position
                    this.onChangePosition.call(this.$parent, next, 'horizontal')
                }
            },
            stopDrag()
            {
                if (this.dragging) {
                    this.onStopDrag()
                    this.dragging = false
                }
            },
            jump(e)
            {
                let isContainer = e.target === this.$refs.container

                if (isContainer) {
                    let position = this.$refs.scrollbar.getBoundingClientRect()

                    // Calculate the horizontal Movement
                    let xMovement = e.clientX - position.left
                    let centerize = (this.width / 2)
                    let xMovementPercentage = xMovement / this.wrapper.width * 100 - centerize

                    // Update the last e.clientX
                    this.start = e.clientX

                    // The next Horizontal Value will be
                    let next = this.scrolling + xMovementPercentage

                    // Tell the parent to change the position
                    this.onChangePosition.call(this.$parent, next, 'horizontal')
                }
            },
            calculateSize(source)
            {
                this.width = source.wrapper.width / source.area.width * 100
            }
        },
        beforeDestroy()
        {
            removeEvents(this.events)
        },
        mounted()
        {
            addEvents(this.events)

            this.$nextTick().then(() => {
                this.calculateSize(this)
            }).then(() => {
                this.$emit('change', this.width < 100)
            })
        }
    }
</script>
