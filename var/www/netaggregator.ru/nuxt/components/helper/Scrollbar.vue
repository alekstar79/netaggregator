<template>
    <div v-bind="$attrs" @click="calculateSize" class="scrollbar__wrapper" ref="wrapper">
        <div class="scrollbar__area"
            :class="{ 'scrollbar-transition': !dragging }"
            :style="{ marginTop: -1 * top + 'px', marginLeft: -1 * left + 'px', ...padding }"
            @wheel.prevent.stop="scroll"
            @touchstart="startDrag"
            @touchmove="onDrag"
            @touchend="stopDrag"
            ref="area"
        >
            <slot />

            <lazy-helper-vertical-scrollbar
                v-if="ready"
                v-model="vertical"
                :area="{ height: scrollAreaHeight }"
                :wrapper="{ height: scrollWrapperHeight }"
                :scrolling="vMovement"
                :dragging-from-parent="dragging"
                :on-change-position="handleChangePosition"
                :on-dragging="handleScrollbarDragging"
                :on-stop-drag="handleScrollbarStopDrag"
            />

            <lazy-helper-horizontal-scrollbar
                v-if="ready"
                v-model="horizontal"
                :area="{ width: scrollAreaWidth }"
                :wrapper="{ width: scrollWrapperWidth }"
                :scrolling="hMovement"
                :dragging-from-parent="dragging"
                :on-change-position="handleChangePosition"
                :on-dragging="handleScrollbarDragging"
                :on-stop-drag="handleScrollbarStopDrag"
            />
        </div>
    </div>
</template>

<script>
    import { debounce } from '~/utils/common/debounce.mjs'

    export default {
        props: {
            onMaxScroll: Function,
            speed: {
                type: Number,
                default: 53
            }
        },
        watch: {
            '$store.state.app.window': 'update',

            horizontal(v) {
                this.emitReady({ horizontal: v })
            },
            vertical(v) {
                this.emitReady({ vertical: v })
            }
        },
        computed: {
            padding() {
                const padding = {}

                if (!this.horizontal) {
                    padding.paddingBottom = 0
                    padding.paddingTop = 0
                }
                if (!this.vertical) {
                    padding.paddingRight = 0
                    padding.paddingLeft = 0
                }

                return padding
            }
        },
        data: () => ({
            start: { y: 0, x: 0 },
            left: 0,
            top: 0,

            vMovement: 0,
            hMovement: 0,

            scrollWrapperHeight: null,
            scrollWrapperWidth: null,
            scrollAreaHeight: null,
            scrollAreaWidth: null,

            horizontal: false,
            vertical: false,

            allowBodyScroll: false,
            dragging: false,
            ready: false
        }),
        methods: {
            emitReady: debounce(function(data)
            {
                this.$emit('ready', data)

            }, 0),
            emitScroll()
            {
                this.$emit('scroll', {
                    top: this.top,
                    left: this.left,
                    vMovement: this.vMovement,
                    hMovement: this.hMovement,
                    areaHeight: this.scrollAreaHeight,
                    areaWidth: this.scrollAreaWidth
                })
            },
            scroll(e)
            {
                // Make sure the content height is not changed
                this.calculateSize(() => {
                    let num = this.speed

                    // DOM events
                    let shifted = e.shiftKey
                    let scrollY = e.deltaY > 0 ? num : -(num)
                    let scrollX = e.deltaX > 0 ? num : -(num)

                    // Fix Mozilla shifted wheel~
                    if (shifted && e.deltaX === 0) scrollX = e.deltaY > 0 ? num : -(num)

                    // Next value
                    let nextY = this.top + scrollY
                    let nextX = this.left + scrollX

                    // Is it scrollable?
                    let canScrollY = this.scrollAreaHeight > this.scrollWrapperHeight
                    let canScrollX = this.scrollAreaWidth > this.scrollWrapperWidth

                    if (canScrollY && !shifted) {
                        // Vertical scrolling
                        this.normalizeVertical(nextY)
                    }
                    if (shifted && canScrollX) {
                        // Horizontal scrolling
                        this.normalizeHorizontal(nextX)
                    }
                })
            },
            startDrag(e)
            {
                this.touchEvent = e

                const evt = e.changedTouches ? e.changedTouches[0] : e

                // Make sure the content height is not changed
                this.calculateSize(() => {
                    this.dragging = true
                    this.start = { y: evt.pageY, x: evt.pageX }
                })
            },
            onDrag(e)
            {
                if (this.dragging) {
                    e.preventDefault()
                    e.stopPropagation()

                    // Prevent click event when it dragging
                    if (this.touchEvent) {
                        this.touchEvent.preventDefault()
                        this.touchEvent.stopPropagation()
                    }

                    let evt = e.changedTouches ? e.changedTouches[0] : e

                    // Invers the movement
                    let yMovement = this.start.y - evt.clientY
                    let xMovement = this.start.x - evt.clientX

                    // Update the last e.client
                    this.start = { y: evt.clientY, x: evt.clientX }

                    // The next vertical value will be
                    let nextY = this.top + yMovement
                    let nextX = this.left + xMovement

                    this.normalizeVertical(nextY)
                    this.normalizeHorizontal(nextX)
                }
            },
            stopDrag(/* e */)
            {
                this.touchEvent = false
                this.dragging = false
            },
            scrollToX(x)
            {
                this.normalizeHorizontal(x)
            },
            scrollToY(y)
            {
                this.normalizeVertical(y)
            },
            normalizeVertical(next)
            {
                const elementSize = this.getSize()

                // Vertical scrolling
                const lowerEnd = elementSize.scrollAreaHeight - elementSize.scrollWrapperHeight

                // Max scroll down
                const maxBottom = next > lowerEnd
                if (maxBottom) {
                    next = lowerEnd
                }

                // Max scroll up
                const maxTop = next < 0
                if (maxTop) {
                    next = 0
                }

                // Update the vertical value if it's needed
                const shouldScroll = this.top !== next
                this.allowBodyScroll = !shouldScroll

                if (shouldScroll) {
                    this.shouldScrollY(next, elementSize)

                    if (this.onMaxScroll && (maxTop || maxBottom)) {
                        this.onMaxScroll.call(this.$parent, {
                            bottom: maxBottom,
                            top: maxTop,
                            right: false,
                            left: false
                        })
                    }
                }
            },
            shouldScrollY(next, { scrollAreaHeight })
            {
                this.top = next
                this.vMovement = next / scrollAreaHeight * 100
                this.emitScroll()
            },
            normalizeHorizontal(next)
            {
                const elementSize = this.getSize()

                // Horizontal scrolling
                const rightEnd = elementSize.scrollAreaWidth - this.scrollWrapperWidth

                // Max Scroll right
                const maxRight = next > rightEnd
                if (maxRight) {
                    next = rightEnd
                }

                // Max scroll left
                const maxLeft = next < 0
                if (next < 0) {
                    next = 0
                }

                // Update the horizontal value
                const shouldScroll = this.left !== next
                this.allowBodyScroll = !shouldScroll

                if (shouldScroll) {
                    this.shouldScrollX(next, elementSize)

                    if (this.onMaxScroll && (maxRight || maxLeft)) {
                        this.onMaxScroll.call(this.$parent, {
                            right: maxRight,
                            left: maxLeft,
                            bottom: false,
                            top: false
                        })
                    }
                }
            },
            shouldScrollX(next, { scrollAreaWidth })
            {
                this.left = next
                this.hMovement = next / scrollAreaWidth * 100
                this.emitScroll()
            },
            handleChangePosition(movement, orientation)
            {
                // Make sure the content height is not changed
                this.calculateSize(() => {
                    const next = movement / 100

                    if (orientation === 'vertical') {
                        this.normalizeVertical(next * this.scrollAreaHeight)
                    }
                    if (orientation === 'horizontal') {
                        this.normalizeHorizontal(next * this.scrollAreaWidth)
                    }
                })
            },
            handleScrollbarDragging()
            {
                this.dragging = true
            },
            handleScrollbarStopDrag()
            {
                this.dragging = false
            },
            getSize()
            {
                const $scrollWrapper = this.$refs.wrapper,
                    $scrollArea = this.$refs.area

                return {
                    // Scroll area height and width
                    scrollAreaHeight: $scrollArea.children[0].clientHeight,
                    scrollAreaWidth: $scrollArea.children[0].clientWidth,

                    // Scroll wrapper height and width
                    scrollWrapperHeight: $scrollWrapper.clientHeight,
                    scrollWrapperWidth: $scrollWrapper.clientWidth
                }
            },
            calculateSize(cb)
            {
                try {

                    const size = this.getSize()

                    if (size.scrollWrapperHeight !== this.scrollWrapperHeight ||
                        size.scrollWrapperWidth !== this.scrollWrapperWidth ||
                        size.scrollAreaHeight !== this.scrollAreaHeight ||
                        size.scrollAreaWidth !== this.scrollAreaWidth
                    ) {
                        // Scroll area height and width
                        this.scrollAreaHeight = size.scrollAreaHeight
                        this.scrollAreaWidth = size.scrollAreaWidth

                        // Scroll wrapper height and width
                        this.scrollWrapperHeight = size.scrollWrapperHeight
                        this.scrollWrapperWidth = size.scrollWrapperWidth

                        // Make sure the wrapper is ready, then render the scrollbar
                        this.ready = true
                    }
                    if (typeof cb === 'function') {
                        cb()
                    }

                } catch (e) {
                }
            },
            update: debounce(function() {
                this.calculateSize()
            }, 0)
        },
        updated()
        {
            this.update()
        },
        mounted()
        {
            this.update()
        }
    }
</script>

<style lang="scss" scoped>
    .scrollbar__wrapper {
        position: relative;
        margin: 0 auto;

        background: white;
        overflow: hidden;

        ::v-deep .scrollbar-transition,
        ::v-deep .scrollbar__scrollbar-vertical,
        ::v-deep .scrollbar__scrollbar-horizontal {
            transition: all .5s ease;
        }
        ::v-deep .scrollbar-transition.scrollbar {
            transition: opacity .5s linear;
        }
        &:hover ::v-deep .scrollbar__scrollbar-horizontal,
        &:hover ::v-deep .scrollbar__scrollbar-vertical {
            opacity: 1;
        }
        ::v-deep .scrollbar__scrollbar-horizontal,
        ::v-deep .scrollbar__scrollbar-vertical {
            opacity: .5;
            position: absolute;
            background: transparent;

            &:hover {
                background: rgba(0,0,0,.3);
            }
            .scrollbar {
                position: relative;
                background: rgba(0,0,0,.5);
                cursor: default;
            }
        }
        ::v-deep .scrollbar__scrollbar-horizontal {
            height: 5px;
            width: 100%;
            bottom: 0;
            right: 0;

            .scrollbar {
                height: 5px;
            }
        }
        ::v-deep .scrollbar__scrollbar-vertical {
            height: 100%;
            width: 5px;
            right: 0;
            top: 0;

            .scrollbar {
                width: 5px;
            }
        }
    }
</style>
