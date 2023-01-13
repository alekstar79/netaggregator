<template>
    <div class="window-modal" v-bind="$attrs" @mousedown="dragSort" @contextmenu.prevent.stop="" :style="{ backgroundColor, zIndex }">
        <div class="window-modal__header" :class="themeClasses" ref="header">
            <h3>{{ title }}</h3>

            <div class="drag-dialog__header-controls">
                <v-btn v-if="apply" @click="$emit('apply')" icon>
                    <v-icon :color="iconColor">mdi-check</v-icon>
                </v-btn>
                <v-btn v-if="close" @click="$emit('close')" icon>
                    <v-icon :color="iconColor">mdi-close</v-icon>
                </v-btn>
            </div>
        </div>

        <div class="window-modal__content" :class="{ pin }">
            <template v-if="scrollable">
                <lazy-helper-scrollbar :style="{ maxHeight: '490px' }" @ready="onReady">
                    <slot />
                </lazy-helper-scrollbar>
            </template>
            <template v-else>
                <slot />
            </template>
        </div>
    </div>
</template>

<script>
    import { cancelIdleCallback, fulfill } from '~/utils/callbacks.mjs'
    import { rclamp } from '~/utils/common/clamp.mjs'

    import 'vue-slider-component/theme/default.css'

    /**
    * Problems of positioning fixed elements with transforms
    * @see https://askdev.ru/q/transform3d-ne-rabotaet-s-poziciey-fiksirovannye-deti-18389
    * @see http://meyerweb.com/eric/thoughts/2011/09/12/un-fixing-fixed-elements-with-css-transforms
    */
    export default {
        props: {
            title: {
                required: true,
                type: String
            },
            hash: {
                required: true,
                type: String
            },
            close: {
                type: Boolean,
                default: false
            },
            apply: {
                type: Boolean,
                default: false
            },
            iconColor: {
                type: String,
                default: '#fff'
            },
            scrollable: {
                type: Boolean,
                default: false
            },
            mode: {
                type: Number,
                default: 0
            },
            snap: {
                type: Number,
                default: 5
            }
        },
        data: () => ({
            isDown: false,
            smooth: null,

            offsetX: null,
            offsetY: null,

            left: null,
            top: null,

            taskHandle: 0,
            attempts: 10,

            pin: false
        }),
        computed: {
            backgroundColor() {
                return this.$vuetify.theme.dark ? 'rgb(66,66,66)' : 'rgb(237,237,237)'
            },
            themeClasses() {
                return {
                    [`theme--${this.$vuetify.theme.dark ? 'dark' : 'light'}`]: true,
                    [this.color]: true
                }
            },
            eventsDetermine() {
                return this.mobile
                    ? { start: 'touchstart', move: 'touchmove', end: 'touchend' }
                    : { start: 'mousedown',  move: 'mousemove', end: 'mouseup' }
            },
            draggable() {
                return this.$store.state.canvas.draggable
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            zIndex() {
                return this.draggable.findIndex(el => el === this._uid)
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            '$store.state.app.window': 'recalc',

            left(posX) {
                this.$el.style.left = posX + 'px'
            },
            top(posY) {
                this.$el.style.top = posY + 'px'
            }
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
            modeResolver(x, y)
            {
                return {
                    left: this.mode === 2 ? this.left : x,
                    top:  this.mode === 1 ? this.top  : y
                }
            },
            setCoords({ left, top })
            {
                const height = window.innerHeight - this.$el.clientHeight,
                    width = window.innerWidth - this.$el.clientWidth

                this.left = rclamp(left, 0, width)
                this.top = rclamp(top, 0, height)
            },
            calculateCoords(posX, posY)
            {
                this.setCoords(
                    this.modeResolver(
                        posX - (posX % this.snap),
                        posY - (posY % this.snap)
                    )
                )
            },
            recalc()
            {
                this.calculateCoords(this.$el.offsetLeft, this.$el.offsetTop)
            },
            toggleEvents()
            {
                const el = this.mobile ? this.$refs.header : document.documentElement,
                    { move, end } = this.eventsDetermine

                if (this.isDown) {
                    el.removeEventListener(move, this.mouseMove)
                    el.removeEventListener(end, this.mouseUp)
                } else {
                    el.addEventListener(move, this.mouseMove, this.mobile)
                    el.addEventListener(end, this.mouseUp, this.mobile)
                }

                this.isDown = !this.isDown
            },
            mouseUp()
            {
                this.toggleEvents()
                this.storePosition()
            },
            mouseMove(e)
            {
                const X = typeof e.pageX !== 'undefined' ? e.pageX : e.touches[0].pageX
                const Y = typeof e.pageY !== 'undefined' ? e.pageY : e.touches[0].pageY

                this.calculateCoords(X - this.offsetX, Y - this.offsetY)

                e.stopPropagation()
                e.preventDefault()
            },
            mouseDown(e)
            {
                const X = typeof e.pageX !== 'undefined' ? e.pageX : e.touches[0].pageX
                const Y = typeof e.pageY !== 'undefined' ? e.pageY : e.touches[0].pageY

                this.offsetX = X - this.$el.offsetLeft
                this.offsetY = Y - this.$el.offsetTop

                this.toggleEvents()
                this.dragSort()
            },
            async readPosition()
            {
                const position = await this.$ls.get('position', {}),
                    byDefault = { left: 300, top: 200 }

                return position[this.hash] || byDefault
            },
            async storePosition()
            {
                const position = await this.$ls.get('position', {})

                position[this.hash] = { left: this.left, top: this.top }

                this.$ls.set('position', position)
            },
            attachHandler()
            {
                if (this.taskHandle) cancelIdleCallback(this.taskHandle)

                const { start } = this.eventsDetermine

                this.taskHandle = fulfill(() => {
                    this.attempts--

                    if (this.$refs.header) {
                        this.$refs.header.addEventListener(start, this.mouseDown)
                        return true
                    }
                })
            },
            onReady({ vertical, horizontal })
            {
                this.pin = vertical || horizontal
            }
        },
        beforeDestroy()
        {
            const { start } = this.eventsDetermine

            this.$refs.header && this.$refs.header.removeEventListener(start, this.mouseDown)

            this.storePosition()
            this.dragRemove()
        },
        async mounted()
        {
            this.recalc()

            this.setCoords(await this.readPosition())
            this.$nextTick().then(this.attachHandler)

            this.dragPush()
        }
    }
</script>

<style lang="scss" scoped>
    .window-modal {
        display: flex;
        flex-direction: column;
        position: fixed;
        width: 100%;

        box-shadow: rgba(0,0,0,.5) 0 2pt 4pt;
        border-radius: 3px;

        .window-modal__header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 5px 7px;
            height: 40px;

            border-top-right-radius: 3px;
            border-top-left-radius: 3px;
            background-color: #585858;

            user-select: none;
            cursor: move;
            color: white;

            .drag-dialog__header-controls {
                display: flex;

                ::v-deep .v-btn {
                    height: 32px;
                    width: 32px;

                    &:hover::before {
                        background-color: currentColor;
                        opacity: .2;
                    }
                }
            }
            h3 {
                font-weight: 400 !important;
                font-size: 20px !important;
                margin: 0 !important;
                white-space: nowrap;
                letter-spacing: -0.15px;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            &.theme--dark.accent {
                background-color: #323232 !important;
            }
        }
        .window-modal__content {
            padding: 5px;
            overflow: hidden;

            &.pin {
                padding: 5px 3px 5px 5px;
            }
            ::v-deep .v-select__selections, .v-text-field input {
                line-height: 18px;
            }
            ::v-deep .v-select__slot .v-label,
            ::v-deep .v-text-field__slot .v-label {
                font-size: unset;
                color: #aaa !important;
            }
            ::v-deep .v-text-field__slot input {
                margin: 2px;
            }
            ::v-deep .v-select__slot,
            ::v-deep .v-select__slot .v-select__selections {
                width: 100%;

                .vue-slider {
                    width: 100%;
                }
            }
            ::v-deep .scrollbar__wrapper {
                max-width: 100%;
                height: 100%;

                background: transparent;

                .scrollbar__scrollbar-vertical {
                    cursor: pointer;
                    right: -1px;

                    .scrollbar {
                        border-radius: 2px;
                        cursor: pointer;
                        width: 4px;
                    }
                }
                .scrollbar__area {
                    padding: 0 8px 0 0;
                }
            }
        }
    }
</style>
