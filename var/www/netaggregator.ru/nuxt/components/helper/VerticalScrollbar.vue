<template>
    <div>
        <div v-if="height < 100" @click="jump" class="scrollbar__scrollbar-vertical" ref="container">
            <div :class="'scrollbar' + (dragging || draggingFromParent ? '' : ' scrollbar-transition')"
                :style="{ height: height + '%', top: scrolling + '%' }"
                @touchstart="startDrag"
                @mousedown="startDrag "
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
                height: 100,
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
            height(v) {
                this.$emit('change', v < 100)
            },
            'wrapper.height'() {
                this.calculateSize(this)
            },
            'area.height'() {
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
                this.start = e.clientY
            },
            onDrag(e)
            {
                if (this.dragging) {
                    this.onDragging()

                    e.preventDefault()
                    e.stopPropagation()

                    e = e.changedTouches ? e.changedTouches[0] : e

                    let yMovement = e.clientY - this.start
                    let yMovementPercentage = yMovement / this.wrapper.height * 100

                    // Update the last e.clientY
                    this.start = e.clientY

                    // The next Vertical Value will be
                    let next = this.scrolling + yMovementPercentage

                    // Tell the parent to change the position
                    this.onChangePosition.call(this.$parent, next, 'vertical')
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

                    // Calculate the vertical Movement
                    let yMovement = e.clientY - position.top
                    let centerize = (this.height / 2)
                    let yMovementPercentage = yMovement / this.wrapper.height * 100 - centerize

                    // Update the last e.clientY
                    this.start = e.clientY

                    // The next Vertical Value will be
                    let next = this.scrolling + yMovementPercentage

                    // Tell the parent to change the position
                    this.onChangePosition.call(this.$parent, next, 'vertical')
                }
            },
            calculateSize(source)
            {
                this.height = source.wrapper.height / source.area.height * 100
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
                this.$emit('change', this.height < 100)
            })
        }
    }
</script>
