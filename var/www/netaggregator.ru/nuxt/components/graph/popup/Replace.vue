<template>
    <graph-drag
        hash="replace"
        class="drag-replace"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.replace_color')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="replace-pane">
            <v-flex @click="colorToggle('target')" class="target-color pt-2">
                <helper-fieldset dense>
                    <template #label>
                        <v-badge :value="switcher === 'target'" :color="color" inline dot>
                            {{ $t('graph.target_color') }}
                        </v-badge>
                    </template>

                    <template #content>
                        <v-menu
                            v-model="target"
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    @click="colorToggle('target')"
                                    :color="hexTarget"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    &nbsp;
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    :value="picker.target"
                                    @update:color="changeTarget"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('target')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex @click="colorToggle('replacement')" class="substitute-color pt-3">
                <helper-fieldset dense>
                    <template #label>
                        <v-badge :value="switcher === 'replacement'" :color="color" inline dot>
                            {{ $t('graph.substitute_color') }}
                        </v-badge>
                    </template>

                    <template #content>
                        <v-menu
                            v-model="replacement"
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    @click="colorToggle('replacement')"
                                    :color="hexReplacement"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    &nbsp;
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    :value="picker.replacement"
                                    @update:color="changeReplacement"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('replacement')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="power pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.power') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="current.power" v-bind="options" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>
            <v-flex class="alpha pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.alpha') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="current.alpha" v-bind="options" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>
        </div>
    </graph-drag>
</template>

<script>
    import { VColorPickerPatched as VColorPicker } from '~/utils/v-color-picker-patch'
    import { lock, rgbToHex, unlock } from '~/utils/canvas'

    export default {
        components: {
            VueSlider: () => import(/* webpackChunkName: "slider" */ 'vue-slider-component'),
            VColorPicker
        },
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'white' : this.$store.state.app.color
            },
            hexReplacement() {
                return this.temp.replacement || this.current.replacement
            },
            hexTarget() {
                return this.temp.target || this.current.target
            },
            canvas() {
                return this.$parent.canvas
            }
        },
        data: () => ({
            currentCursor: 'crosshair',
            defaultCursor: null,

            switcher: 'target',

            changeColor: false,
            canceleled: false,
            lock: true,

            replacement: false,
            target: false,
            active: null,

            temp: {
                target: null,
                replacement: null
            },
            picker: {
                target: '#ffffff',
                replacement: '#000000'
            },
            current: {
                target: '#ffffff',
                replacement: '#000000',
                alpha: 255,
                power: 20
            },
            options: {
                dotSize: 10,
                interval: 1,
                duration: .5,
                width: 'auto',
                height: 4,
                processStyle: { backgroundColor: '#5181b8' },
                useKeyboard: true,
                clickable: true,
                max: 255,
                min: 0
            }
        }),
        watch: {
            '$parent.onCanvas'(v) {
                v || this.tempReset()
            },
            current: {
                handler: 'onChange',
                deep: true
            }
        },
        methods: {
            copy(prop)
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(this.picker[prop]))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            onMouseDown({ pointer, e })
            {
                if (e.shiftKey) return

                this.canvas.defaultCursor = this.currentCursor
                this.testColor(pointer).then(c => {
                    this.changeColor = this.lock

                    this.current[this.switcher] = c
                    this.temp[this.switcher] = c
                })
            },
            onMouseMove({ pointer, e })
            {
                if (e.shiftKey) return

                this.canvas.defaultCursor = this.currentCursor
                this.testColor(pointer).then(c => {
                    this.changeColor = false
                    this.temp[this.switcher] = c
                })
            },
            onMouseUp()
            {
                this.canvas.defaultCursor = this.currentCursor
            },
            testColor({ x, y })
            {
                // x *= this.canvas.viewportTransform[0]
                // y *= this.canvas.viewportTransform[3]

                x |= 0
                y |= 0

                return new Promise(resolve => {
                    const img = this.canvas.contextContainer.getImageData(x, y, 1, 1)
                    resolve(rgbToHex(img.data[0], img.data[1], img.data[2]))
                })
            },
            tempReset()
            {
                Object.keys(this.temp).forEach(c => { this.temp[c] = null })
            },
            colorToggle(color)
            {
                this.switcher = color
            },
            changeTarget({ hex })
            {
                this.changeColor = this.lock

                this.current.target = hex
                this.picker.target = hex
            },
            changeReplacement({ hex })
            {
                this.changeColor = this.lock

                this.current.replacement = hex
                this.picker.replacement = hex
            },
            onChange(options)
            {
                if (!this.changeColor) return

                this.changeColor = false
                this.lock = false

                this.$parent
                    .colorReplace(options, this.active)
                    .then(() => {
                        lock(this.canvas)
                        this.lock = true
                    })
            },
            make(doit, emit = true)
            {
                if (this.canceled) return

                this.canceled = true
                this.canvas.defaultCursor = this.defaultCursor
                this.canvas.selection = true

                doit || this.$parent.restoreCanvas()
                emit && this.$emit('tool:cancel')

                this.$parent.lockEventsSet = false
                this.$parent.restoreEvents([])

                doit && this.canvas.trigger('programmatic')

                this.canvas.off({
                    'mouse:down': this.onMouseDown,
                    'mouse:move': this.onMouseMove,
                    'mouse:up': this.onMouseUp
                })

                unlock(this.canvas)
            }
        },
        beforeDestroy()
        {
            this.make(false, false)
        },
        mounted()
        {
            this.active = this.$parent.getActives()

            this.onChange(this.current)

            this.defaultCursor = this.canvas.defaultCursor
            this.canvas.defaultCursor = this.currentCursor
            this.canvas.selection = false

            this.$parent.leaveEvents([])
            this.$parent.lockEventsSet = true

            this.canvas.on({
                'mouse:down': this.onMouseDown,
                'mouse:move': this.onMouseMove,
                'mouse:up': this.onMouseUp
            })

            lock(this.canvas)
        }
    }
</script>

<style lang="scss" scoped>
    .fill-color-menu .color-dialog__body {
        ::v-deep .v-color-picker {
            .v-color-picker__canvas {
                max-width: 210px;
            }
            .v-color-picker__controls {
                padding: 15px 10px 7px; // 16px 10px

                .v-color-picker__edit {
                    margin-top: 20px;

                    .v-color-picker__input {
                        input {
                            text-align: left;
                            padding-left: 10px;
                            margin-right: 30px;
                            margin-bottom: 0;
                        }
                        span {
                            display: none;
                        }
                    }
                }
            }
        }
        .v-btn.color-copy {
            position: absolute;
            bottom: 7px;
            right: 9px;

            height: 29px;
            min-width: unset;
            padding: 0 5px;
        }
    }
    .drag-replace {
        max-width: 210px;

        .replace-pane {
            display: flex;
            flex-direction: column;

            ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                cursor: pointer;
            }
            ::v-deep .flex {
                &.substitute-color {
                    cursor: pointer;
                }
                &.target-color {
                    cursor: pointer;
                }
            }
        }
    }
</style>
