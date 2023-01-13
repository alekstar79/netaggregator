<template>
    <v-card class="remove-bg-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="remove-bg-dialog__btn-wrapper" justify-start>
                <v-btn @click="$emit('close')" :disabled="loading" icon>
                    <v-icon :disabled="loading">mdi-window-close</v-icon>
                </v-btn>
                <v-btn @click="removeBg" :disabled="loading" text>
                    <v-icon :disabled="loading">mdi-eraser</v-icon>
                </v-btn>
                <v-btn @click="apply" :disabled="loading" icon>
                    <v-icon :disabled="loading">mdi-check</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs :color="color" class="remove-bg-dialog__tabs-header" height="60px" hide-slider grow>
                <v-tab @click="$emit('close')" :ripple="false" :disabled="loading">
                    <v-icon :disabled="loading" :color="color">
                        mdi-window-close
                    </v-icon>
                </v-tab>
                <v-tab @click="removeBg" :ripple="false" :disabled="loading">
                    <v-icon :disabled="loading" :color="color">
                        mdi-eraser
                    </v-icon>
                </v-tab>
                <v-tab @click="apply" :ripple="false" :disabled="loading">
                    <v-icon :disabled="loading" :color="color">
                        mdi-check
                    </v-icon>
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="remove-bg-dialog__card-pane">
            <v-layout class="pane">
                <div :style="{ background: `url(${$vuetify.theme.dark ? bg2 : bg1}) repeat` }"
                    class="image-comparison mt-3"
                    ref="block"
                >
                    <img :src="after" :key="force" class="image-comparison__image after" alt="" ref="after">
                    <img :src="before" class="image-comparison__image before" alt="" ref="before">

                    <div class="image-comparison__wrapper" ref="wrapper">
                        <div class="image-comparison__slider handle" ref="slider">
                            <span class="handle__left-arrow" />
                            <span class="handle__right-arrow" />
                        </div>
                    </div>
                </div>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import { rndstring } from '~/utils/common/symbols.mjs'
    import { rclamp } from '~/utils/common/clamp.mjs'
    import { delay } from '~/utils/common/delay.mjs'

    import { bg1, bg2 } from '~/assets/data/canvas-icons'

    const empty = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
        bounding = () => ({ height: 600, width: 652, left: 326 })

    function coords(e)
    {
        return {
            x: typeof e.pageX !== 'undefined' ? e.pageX : e.touches[0].pageX,
            y: typeof e.pageY !== 'undefined' ? e.pageY : e.touches[0].pageY
        }
    }

    export default {
        props: {
            image: Object
        },
        computed: {
            eventsDetermine() {
                return this.mobile
                    ? { start: 'touchstart', move: 'touchmove', end: 'touchend' }
                    : { start: 'mousedown',  move: 'mousemove', end: 'mouseup' }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            image: 'sourceToggle',

            '$store.state.app.window'() {
                this.deferred()
            },

            loading(v) {
                this.$emit('loading', v)
            }
        },
        data: () => ({
            force: rndstring(),
            rect: bounding(),

            clientHeight: 0,
            clientWidth: 0,

            loading: false,
            timeout: null,
            worker: null,

            before: empty,
            after: empty,

            bg1,
            bg2
        }),
        methods: {
            mouseDown(e)
            {
                if (this.down) return

                let rect = this.$refs.wrapper.getBoundingClientRect(),
                    { move, end } = this.eventsDetermine,

                    self = this,

                    offset

                function moveAt({ x }) {
                    offset = rclamp(x - rect.left, 0, rect.width)

                    self.$refs.after.style.clip = `rect(0, ${rect.width}px, ${rect.height}px, 0)`
                    self.$refs.before.style.clip = `rect(0, ${offset}px, ${rect.height}px, 0)`
                    self.$refs.slider.style.left = offset + 'px'
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
                }

                document.addEventListener(move, mousemove)
                document.addEventListener(end, mouseup)

                e.stopPropagation()
                e.preventDefault()

                moveAt(coords(e))

                self.down = true
            },
            async calculation()
            {
                let rect, height, width, left

                do {

                    await new Promise(resolve => setTimeout(resolve, 30))

                    if ((rect = this.$refs.before?.getBoundingClientRect())) {
                        height = this.heightRecalculation(rect)
                        width = this.widthRecalculation(rect)
                        left = rect.left

                        this.rect = { height, width, left }
                    }

                } while (!width || !height)

                return height
            },
            heightRecalculation({ height }, maxHeight = 600)
            {
                let { height: iH, width: iW } = this.image,
                    cW = this.$refs.before.clientWidth,
                    mH

                if ((mH = iH * cW / iW) > maxHeight) {
                    mH = maxHeight
                }

                mH || (mH = height)

                return mH | 0
            },
            widthRecalculation({ width }, maxWidth = 652)
            {
                let { height: iH, width: iW } = this.image,
                    cH = this.$refs.before.clientHeight,
                    mW

                if ((mW = iW * cH / iH) > maxWidth) {
                    mW = maxWidth
                }

                mW || (mW = width)

                return mW | 0
            },
            sliderInit()
            {
                const { width, height } = this.rect

                if (!width || !height) return throw new Error('sizes error')

                this.$emit('maxWidth', `${width + 48}px`)
                this.setMinHeight(height)

                this.$refs.wrapper.style.height = `${height}px`
                this.$refs.wrapper.style.width = `${width}px`

                if (this.after === empty) return

                this.$refs.before.style.clip = `rect(0, ${width / 2}px, ${height}px, 0)`
                this.$refs.slider.style.setProperty('--slider-height', `${(height / 2) - 22}px`)
                this.$refs.slider.style.left = `${width / 2}px`
                this.$refs.slider.style.display = 'block'
            },
            imageOnChange()
            {
                this.$refs.slider.style.display = 'none'
                this.$refs.before.style.clip = 'unset'

                this.$emit('maxWidth')
                this.setMinHeight(600)
            },
            deferred(ms = 0, delay = 100)
            {
                this.timeout && clearTimeout(this.timeout)

                this.timeout = setTimeout(
                    this.perform.bind(this, delay),
                    ms
                )
            },
            async perform(ms)
            {
                try {

                    this.imageOnChange()

                    await delay(ms)

                    this.setMinHeight(await this.calculation())

                    this.sliderInit()
                    this.reRender()

                } catch (e) {
                }
            },
            async removeBg()
            {
                this.loading = !this.image.wbg

                switch (await this.image.loading())
                {
                    case 'block':
                        this.setAfter(this.image)
                        this.deferred(0, 0)
                        break
                    case 'none':
                        break
                }

                this.loading = false
            },
            setMinHeight(h)
            {
                if (this.$refs.block) {
                    this.$refs.block.style.minHeight = `${!h || h > 600 ? 600 : h}px`
                }
            },
            sourceToggle()
            {
                this.setBefore(this.image).setAfter(this.image).deferred(99, 250)
            },
            setBefore({ src })
            {
                this.before = src || empty

                return this
            },
            setAfter({ wbg })
            {
                this.after = wbg || empty

                return this
            },
            reRender()
            {
                this.force = rndstring()

                this.$forceUpdate()
            },
            async apply()
            {
                try {

                    await this.image.apply()
                    await delay(100)

                } catch (e) {
                }

                this.$emit('close')
            }
        },
        beforeDestroy()
        {
            this.$refs.slider.removeEventListener(this.eventsDetermine.start, this.mouseDown)
        },
        async mounted()
        {
            await this.$nextTick()

            this.mouseDown = this.mouseDown.bind(this)

            this.$refs.slider.addEventListener(this.eventsDetermine.start, this.mouseDown)

            this.sourceToggle()
        }
    }
</script>

<style lang="scss" scoped>
    .remove-bg-dialog__card {
        .remove-bg-dialog__btn-wrapper {
            max-height: 60px;
            padding: 0 10px;

            ::v-deep .v-btn {
                cursor: pointer;
                margin: 0 5px;

                &:hover::before {
                    background-color: currentColor;
                }
            }
        }
        .remove-bg-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;
        }
        .remove-bg-dialog__card-pane {
            padding: 15px;

            .pane {
                position: relative;

                .image-comparison {
                    position: relative;
                    display: flex;

                    justify-content: center;

                    min-height: 600px;
                    height: auto;
                    width: 100%;
                }
                .image-comparison__wrapper,
                .image-comparison__image {
                    position: absolute;
                    top: 0;

                    display: block;
                    height: 100%;
                    width: 100%;
                }
                .image-comparison__slider {
                    position: absolute;
                    left: 50%;
                    top: 50%;

                    display: none;
                    height: 100%;
                    width: 2px;
                    padding: 0;

                    transform: translate(-50%, -50%);
                    cursor: col-resize;
                    outline: none;
                    border: none;
                }
                .handle {
                    --slider-height: 100%;

                    position: absolute;
                    left: 50%;
                    top: 50%;

                    height: 38px;
                    width: 38px;

                    box-shadow: 0 0 12px rgba(51,51,51,.5);
                    border: 3px solid white;
                    border-radius: 50%;

                    user-select: none;
                    cursor: pointer;
                    z-index: 40;
                }
                .handle::before,
                .handle::after {
                    content: ' ';
                    position: absolute;
                    display: block;

                    height: var(--slider-height);
                    width: 3px;

                    margin-left: -1.5px;
                    left: 50%;

                    background: white;
                    box-shadow: 0 0 12px rgba(51,51,51,.5);
                    z-index: 30;
                }
                .handle::before {
                    bottom: 50%;
                    margin-bottom: 22px;
                    box-shadow: 0 3px 0 white, 0 0 12px rgba(51,51,51,.5);
                }
                .handle::after {
                    top: 50%;
                    margin-top: 22px;
                    box-shadow: 0 -3px 0 white, 0 0 12px rgba(51,51,51,.5);
                }
                .handle__left-arrow,
                .handle__right-arrow {
                    position: absolute;
                    height: 0;
                    width: 0;

                    margin-top: -6px;
                    top: 50%;

                    border: 6px inset transparent;
                }
                .handle__left-arrow {
                    border-right: 6px solid white;
                    margin-left: -17px;
                    left: 50%;
                }
                .handle__right-arrow {
                    border-left: 6px solid white;
                    margin-right: -17px;
                    right: 50%;
                }
            }
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .remove-bg-dialog__card-pane {
                max-height: calc(100vh - 61px);
            }
        }
        &.theme--dark {
            .remove-bg-dialog__tabs-header {
                border-bottom: 1px solid rgba(140,140,140,.4);
            }
        }
    }
</style>
