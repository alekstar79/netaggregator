<template>
    <div :style="{ background: `url(${$vuetify.theme.dark ? bg2 : bg1}) repeat`, left: track.x + 'px', top: track.y + 'px' }"
        @contextmenu.prevent.stop="$emit('context', $event)"
        @touchstart.capture="onDown"
        @touchmove.capture="onMove"
        @touchend.capture="onUp"
        class="rg-overlay"
    >
        <template v-for="type in ['h','v']">
            <graph-ruler :type="type" :key="type" />
        </template>

        <slot />

        <template v-for="(g, i) in guidesList">
            <graph-guide
                v-show="controls.guides"
                @update:guide="updateGuide"
                :snap="g.type === 'v' ? x : y"
                :type="g.type"
                :evt="g.evt"
                :set="g.set"
                :key="i"
                :id="i"
            />
        </template>

        <graph-rulers-menu :canvas="$parent.canvas" />
    </div>
</template>

<script>
    import { bg1, bg2 } from '~/assets/data/canvas-icons'
    import { Fabric } from '~/utils/canvas/import.mjs'
    import { Bindings } from '~/utils/keybind'

    let isTouch = typeof TouchEvent !== 'undefined',
        currentPoint = { x: 0, y: 0 },
        touchDown = false,
        fabric,

        midPoint = (p1, p2) => new fabric.Point(
            p1.clientX + (p2.clientX - p1.clientX) * .5,
            p1.clientY + (p2.clientY - p1.clientY) * .5
        )

    export default {
        data: () => ({
            bindings: Bindings.instance,
            events: [{ event: 'click', handler: null }],
            offmap: [],
            bg1,
            bg2
        }),
        computed: {
            guidesList: {
                set(guidesList) {
                    this.$store.commit('canvas/set', { guidesList })
                },
                get() {
                    return this.$store.state.canvas.guidesList
                }
            },
            gridList: {
                set(gridList) {
                    this.$store.commit('canvas/set', { gridList })
                },
                get() {
                    return this.$store.state.canvas.gridList
                }
            },
            track: {
                get() {
                    return this.$store.state.canvas.track || { x: 0, y: 0 }
                },
                set(track) {
                    this.$store.commit('canvas/set', { track })
                }
            },
            controls() {
                return this.$store.state.canvas.controls
            },
            x() {
                return this.$store.state.canvas.xSnap
            },
            y() {
                return this.$store.state.canvas.ySnap
            }
        },
        watch: {
            guidesList(value) {
                if (!value.length) {
                    this.$store.commit('canvas/set', { gridName: null })
                }
            }
        },
        methods: {
            onDown(event)
            {
                if (isTouch && event instanceof TouchEvent) {
                    const touches = event.targetTouches

                    if (touches.length >= 2) {
                        event.stopPropagation()
                        event.preventDefault()

                        currentPoint = midPoint(touches[0], touches[1])
                        touchDown = true
                    }
                }
            },
            onMove(event)
            {
                if (isTouch && event instanceof TouchEvent) {
                    const touches = event.targetTouches

                    if (touchDown) {
                        event.stopPropagation()
                        event.preventDefault()

                        const newPoint = touches.length >= 2
                            ? midPoint(touches[0], touches[1])
                            : new fabric.Point(
                                touches[0].clientX,
                                touches[0].clientY
                            )

                        const { x, y } = newPoint.subtract(currentPoint)

                        currentPoint = newPoint

                        this.track = new fabric.Point(
                            this.track.x + x,
                            this.track.y + y
                        )
                    }
                }
            },
            onUp(event)
            {
                if (isTouch && event instanceof TouchEvent) {
                    touchDown = !!event.targetTouches.length
                }
            },
            clearGuidesList()
            {
                this.guidesList = []
            },
            openDialog()
            {
                this.$store.commit('canvas/toggleOpenDialog')
            },
            saveDialog()
            {
                this.$store.commit('canvas/toggleSaveDialog')
            },
            snapDialog()
            {
                this.$store.commit('canvas/toggleSnapDialog')
            },
            toggleGuides()
            {
                this.$store.commit('canvas/toggleGuides')
            },
            toggleGrid()
            {
                this.$store.commit('canvas/toggleGrid')
            },
            toggleInfo()
            {
                this.$store.commit('canvas/toggleInfo')
            },
            updateGuide({ id, percent, pixel })
            {
                this.$store.commit('canvas/updateGuide', { id, percent, pixel })
            }
        },
        beforeDestroy()
        {
            this.bindings.unbind(this.offmap)
        },
        async beforeMount()
        {
            fabric || (fabric = await Fabric.instance)
        },
        async mounted()
        {
            this.offmap = this.bindings.bind([
                { keys: 'ctrl+alt+d', handler: this.clearGuidesList },
                { keys: 'ctrl+alt+g', handler: this.toggleGuides },
             // { keys: 'ctrl+alt+i', handler: this.toggleInfo },
                { keys: 'ctrl+alt+l', handler: this.toggleGrid },
                { keys: 'ctrl+alt+c', handler: this.snapDialog },
                { keys: 'ctrl+alt+m', handler: this.saveDialog },
                { keys: 'ctrl+alt+o', handler: this.openDialog }
            ])

            try {

                this.gridList = await this.$ls.get('image-editor-grids', [])

                if (this.gridList.length) {
                    this.$store.commit('canvas/initGrid')
                }

            } catch (e) {
            }
        }
    }
</script>

<style scoped>
    .rg-overlay {
        position: absolute;
    }
</style>
