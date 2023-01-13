<!--suppress EqualityComparisonWithCoercionJS -->
<template>
    <div v-bind="$attrs" :class="className" :style="rootStyle">
        <div class="content" :style="contentStyle" ref="content">
            <div class="spacer" :style="spacerStyle" ref="spacer">
                <template v-for="(item, i) in visibleItems">
                    <div :key="i">
                        <slot v-bind="item" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import { debounce } from '~/utils/common/debounce.mjs'

    /**
    * @see https://stackoverflow.com/questions/60924305/how-to-make-virtual-scroll
    * @see https://github.com/KingSora/OverlayScrollbars
    * @see https://github.com/idiotWu/smooth-scrollbar
    */
    export default {
        props: {
            visibleNodeCount: {
                type: [Number, String],
                default: null
            },
            visibleNodePercent: {
                type: [Number, String],
                default: null
            },
            nodePadding: {
                type: [Number, String],
                default: 10
            },
            rootHeight: {
                type: [Number, String],
                default: 300
            },
            itemHeight: {
                type: [Number, String],
                default: 10
            },
            className: {
                type: String,
                default: ''
            },
            overflowBehavior: {
                type: Object,
                default: () => ({
                    x: 'scroll',
                    y: 'scroll'
                })
            },
            items: {
                type: Array,
                required: true
            },
            clipAlways: {
                type: Boolean,
                default: false
            },
            snapHandle: {
                type: Boolean,
                default: false
            },
            virtual: {
                type: Boolean,
                default: true
            }
        },
        watch: {
            '$store.state.app.window': 'recalc',
            items: 'update'
        },
        data() {
            return {
                scrollStop: false,

                rowHeight: 0,
                scrollTop: 0,

                smooth: null
            }
        },
        computed: {
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            startIndex() {
                return this.virtual
                    ? Math.max(0, Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding)
                    : 0
            },
            spacerStyle() {
                return { transform: `translate3d(0px, ${this.startIndex * this.rowHeight}px, 0px)` }
            },
            indexedItems() {
                return this.items.map((item, index) => ({ item, index }))
            },
            computedCount() {
                let count = this.items.length

                if (this.virtual) {
                    switch (true) {
                        case this.visibleNodePercent !== null:
                            count *= this.visibleNodePercent
                            break
                        case this.visibleNodeCount !== null:
                            count = this.visibleNodeCount
                            break
                    }
                }

                return count
            },
            visibleItems() {
                const startIndex = isNaN(this.startIndex) ? 0 : this.startIndex

                const v = this.virtual
                    ? this.indexedItems.slice(startIndex, startIndex + this.computedCount)
                    : this.indexedItems

                if (v.length && !Array.isArray(v[v.length - 1].item)) {
                    this.detectEdge(v[v.length - 1].item)
                }

                return v
            },
            contentStyle() {
                return {
                    height: `${this.items.length * this.rowHeight}px`,
                    position: 'relative',
                    overflow: 'hidden'
                }
            },
            rootStyle() {
                return {
                    height: `${this.rootHeight}px`,
                    overflow: 'auto'
                }
            }
        },
        methods: {
            initScroll()
            {
                if (this.smooth) return

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar(this.$el, {
                                scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' },
                                callbacks: { onScroll: this.handleScroll },
                                overflowBehavior: this.overflowBehavior,
                                clipAlways: this.clipAlways
                            })
                        })

                } else {
                    import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar.init(this.$el, {
                                continuousScrolling: false,
                                alwaysShowTracks: true,
                                damping: .7
                            })

                            this.smooth.addListener(this.handleScroll)
                            this.smooth.updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                }
            },
            handleScroll({ offset = this.smooth.scroll().position } = {})
            {
                if (this.scrollStop) return

                // eslint-disable-next-line no-self-compare,eqeqeq
                if (offset.y != offset.y) {
                    this.scrollStop = true

                    return this.refresh()
                }

                this.scrollTop = offset.y
            },
            detectEdge(last)
            {
                'observer' in last && this.$emit('observer')
            },
            update()
            {
                this.smooth && this.smooth.update()
            },
            calculateRowHeight()
            {
                let { children = [] } = this.$refs.spacer || {},
                    largestHeight = this.itemHeight

                for (let i = 0; i < children.length; i++) {
                    if (children[i].offsetHeight > largestHeight) {
                        largestHeight = children[i].offsetHeight
                    }
                }

                this.rowHeight = largestHeight
            },
            refresh()
            {
                this.smooth.setPosition(0, 0)
                this.recalc()
            },
            recalc: debounce(function() {
                this.calculateRowHeight()
                this.update()

                this.scrollStop = false

            }, 10)
        },
        beforeDestroy()
        {
            this.smooth && this.smooth.destroy()
        },
        mounted()
        {
            this.$nextTick().then(() => {
                this.calculateRowHeight()
                this.initScroll()
            })
        }
    }
</script>

<style lang="scss" scoped>
    ::v-deep .scrollbar-track,
    ::v-deep .os-scrollbar .os-scrollbar-track {
        pointer-events: auto;
        cursor: pointer;
    }
</style>
