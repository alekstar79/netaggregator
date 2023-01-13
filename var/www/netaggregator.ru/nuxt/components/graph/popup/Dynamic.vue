<template>
    <graph-drag
        hash="dynamic-dialog"
        class="drag-dynamic"
        @close="$emit('tool:cancel')"
        :title="$t('graph.dynamic')"
        :close="true"
        :snap="snap"
    >
        <div v-if="dynamic.app" class="dynamic-settings">
            <v-flex class="dynamic__type pt-1">
                <v-flex class="dynamic__type-select">
                    <v-select v-model="current"
                        :label="$t('graph.dynamic_animation')"
                        :color="color"
                        :items="list"
                        return-object
                        hide-details
                        outlined
                        dense
                        :menu-props="{
                            contentClass: 'dynamic-types-menu',
                            maxWidth: 200
                        }"
                    >
                        <template #item="{ item, on }">
                            <v-list-item v-on="on" class="ellipsisfont" :class="item.value">
                                {{ item.text }}
                            </v-list-item>
                        </template>
                    </v-select>
                </v-flex>
            </v-flex>

            <v-flex v-if="isParticles" class="dynamic__particles--subset toggler pt-3">
                <v-layout justify-center>
                    <input type="checkbox" id="particles_subset" v-model="particleTheme">
                    <label for="particles_subset">FABRIC</label>
                </v-layout>
            </v-flex>

            <v-flex v-if="isRainbow" class="dynamic__rainbow--subset toggler pt-3">
                <v-layout justify-center>
                    <input type="checkbox" id="rainbow_subset" v-model="rainbowTheme">
                    <label for="rainbow_subset">OCTOPUS</label>
                </v-layout>
            </v-flex>

            <v-flex v-if="isSparkling || isNeon" class="dynamic__sparkling--textarea pt-3">
                <v-textarea v-model="text" :label="$t('graph.text')" :color="color" rows="1" dense outlined hide-details />
            </v-flex>

            <v-flex v-if="isSparkling || isNeon" class="text__fonts-select pt-3">
                <v-select v-model="fontFamily"
                    :label="$t('graph.font')"
                    :color="color"
                    :items="fonts"
                    item-text="family"
                    return-object
                    hide-details
                    outlined
                    dense
                    :menu-props="{
                        contentClass: 'text-fonts-menu',
                        maxWidth: 200
                    }"
                >
                    <template #item="{ item, on }">
                        <v-list-item v-on="on" class="ellipsisfont" :class="item.value">
                            {{ item.family }}
                        </v-list-item>
                    </template>
                </v-select>
            </v-flex>

            <v-flex v-if="isNeon" class="dynamic__particles--background pt-3">
                <helper-fieldset class="pt-1" dense>
                    <template #label>{{ $t(`graph.background`) }}</template>

                    <template #content>
                        <v-menu v-model="bgPicker"
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    @click="bgPicker = !bgPicker"
                                    :color="neonBgBtn"
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
                                    v-model="neonBg"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('neonBg')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="!isMesh && !isGradient && !isNeon" class="dynamic__particles--background pt-3">
                <helper-fieldset class="pt-1" dense>
                    <template #label>{{ $t(`graph.background`) }}</template>

                    <template #content>
                        <v-menu v-model="bgPicker"
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    @click="bgPicker = !bgPicker"
                                    :color="hexBgBtn"
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
                                    v-model="hexBg"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('hexBg')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isSparkling || isNeon || isParticles" class="dynamic__particles--color pt-3">
                <helper-fieldset class="pt-1" dense>
                    <template #label>{{ $t(`graph.color`) }}</template>

                    <template #content>
                        <v-menu v-model="colorPicker"
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    @click="colorPicker = !colorPicker"
                                    :color="hexColorBtn"
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
                                    v-model="hexColor"
                                    @update:color="changeColor"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('hexColor')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isGradient" class="gradient__range-slider pt-4">
                <helper-fieldset class="gradient-range" dense>
                    <template #label>{{ $t('graph.range') }}</template>

                    <template #content>
                        <vue-slider v-model="gradientRadius" v-bind="gradientRange" :enable-cross="false" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isGradient" class="gradient__count-slider pt-4">
                <helper-fieldset class="gradients-count" dense>
                    <template #label>{{ $t('graph.count') }}</template>

                    <template #content>
                        <vue-slider v-model="gradientCount" v-bind="gradientsSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isBalloons" class="balls__range-slider pt-4">
                <helper-fieldset class="balloons-range" dense>
                    <template #label>{{ $t('graph.range') }}</template>

                    <template #content>
                        <vue-slider v-model="ballsRadius" v-bind="balloonsRange" :enable-cross="false" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isBalloons" class="balls__count-slider pt-4">
                <helper-fieldset class="balloons-count" dense>
                    <template #label>{{ $t('graph.count') }}</template>

                    <template #content>
                        <vue-slider v-model="ballsCount" v-bind="balloonsSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isBalloons" class="balls__blur-edge--toggler pt-4">
                <helper-fieldset class="bluring-edging" dense>
                    <template #content>
                        <v-checkbox
                            v-model="ballsBlurring"
                            :label="$t('graph.blurring')"
                            :ripple="false"
                            :color="color"
                            hide-details
                        />
                        <v-checkbox
                            v-model="ballsEdging"
                            :label="$t('graph.edging')"
                            :ripple="false"
                            :color="color"
                            hide-details
                        />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isSparkling || isNeon" class="text__size-slider pt-4">
                <helper-fieldset class="text-size" dense>
                    <template #label>{{ $t('graph.size') }}</template>

                    <template #content>
                        <vue-slider v-model="fontSize" v-bind="fontSizeSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isSparkling || isNeon" class="text__h-slider pt-4">
                <helper-fieldset class="text-max--width" dense>
                    <template #label>{{ $t('graph.width') }}</template>

                    <template #content>
                        <vue-slider v-model="horizontal" v-bind="vSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isSparkling || isNeon" class="text__v-slider pt-4">
                <helper-fieldset class="text-vertical" dense>
                    <template #label>{{ $t('graph.vertical') }}</template>

                    <template #content>
                        <vue-slider v-model="vertical" v-bind="vSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isSparkling || isNeon" class="text__align-toolbar pt-4">
                <helper-fieldset class="text-align" dense>
                    <template #label>{{ $t('graph.align') }}</template>

                    <template #content>
                        <v-layout class="btn-toolbar" justify-space-between>
                            <template v-for="d in align">
                                <v-btn class="toolbar-item"
                                    @click="textAlign = d"
                                    :ripple="false"
                                    :key="d"
                                    tile
                                    icon
                                >
                                    <v-icon :color="color" class="align-icon">
                                        {{ `mdi-format-align-${d}` }}
                                    </v-icon>
                                </v-btn>
                            </template>
                        </v-layout>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isParticles" class="particles__count--slider pt-4">
                <helper-fieldset :dense="true">
                    <template #label>{{ $t('graph.count') }}</template>

                    <template #content>
                        <vue-slider v-model="particlesCount" v-bind="particlesSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isMesh" class="mesh__steps--slider pt-4">
                <helper-fieldset :dense="true">
                    <template #label>{{ $t('graph.step') }}</template>

                    <template #content>
                        <vue-slider v-model="meshSteps" v-bind="meshSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isMystical" class="tentacles__count--slider pt-4">
                <helper-fieldset :dense="true">
                    <template #label>{{ $t('graph.count') }}</template>

                    <template #content>
                        <vue-slider v-model="tentaclesCount" v-bind="tentaclesSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isMystical" class="tentacles__radius--slider pt-4">
                <helper-fieldset :dense="true">
                    <template #label>{{ $t('graph.radius') }}</template>

                    <template #content>
                        <vue-slider v-model="tentaclesRadius" v-bind="tRadiusSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isNoisy" class="noisy__count--slider pt-4">
                <helper-fieldset :dense="true">
                    <template #label>{{ $t('graph.count') }}</template>

                    <template #content>
                        <vue-slider v-model="noisyCount" v-bind="nCountSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isNoisy" class="noisy__radius--slider pt-4">
                <helper-fieldset :dense="true">
                    <template #label>{{ $t('graph.radius') }}</template>

                    <template #content>
                        <vue-slider v-model="noisyRadius" v-bind="nRadiusSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isNoisy" class="noisy__noise--slider pt-4">
                <helper-fieldset :dense="true">
                    <template #label>{{ $t('graph.noise') }}</template>

                    <template #content>
                        <vue-slider v-model="noisyNoise" v-bind="nNoiseSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isNoisy" class="noisy__size--slider pt-4">
                <helper-fieldset :dense="true">
                    <template #label>{{ $t('graph.offset') }}</template>

                    <template #content>
                        <vue-slider v-model="noisySize" v-bind="nSizeSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex v-if="isRainbow && rainbowTheme" class="dynamic__octopus--slider pt-4">
                <helper-fieldset :dense="true">
                    <template #label>{{ $t('common.length') }}</template>

                    <template #content>
                        <vue-slider v-model="octopusLength" v-bind="octopusSlider" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="dynamic__apply--btn pt-2">
                <v-btn @click="apply" class="shadowless" :color="color" small block>
                    {{ $t('common.apply') }}
                </v-btn>
            </v-flex>
        </div>
    </graph-drag>
</template>

<script>
    import { VColorPickerPatched as VColorPicker } from '~/utils/v-color-picker-patch'
    import { rgbaStringify } from '~/utils/common/rgba-stringify.mjs'
    import { rgbaParse } from '~/utils/common/rgba-parse.mjs'
    import { debounce } from '~/utils/common/debounce.mjs'
    import { rclamp } from '~/utils/common/clamp.mjs'
    import { nextFrame } from '~/utils/callbacks.mjs'
    import { isObject } from 'lodash/lang'

    import { fonts } from '~/assets/data/fonts.mjs'

    const entities = 'particles,gradient,geometry,balloons,rainbow,sparkling,mystical,neon,noisy,mesh'.split(','),

        list = [
            { value: 'neon',   text: 'Neon',   background: 'rgba(0,0,0,1)', color: '#3CC8FF' }, // #000000

            { value: 'gradient',  text: 'Gradient',  background: '#000000', color: '#FFFFFF' }, // #000000
            { value: 'geometry',  text: 'Geometry',  background: '#05022F', color: '#FFFFFF' }, // #05022F
            { value: 'balloons',  text: 'Balloons',  background: '#2B2B2B', color: '#FFFFFF' }, // #2B2B2B
            { value: 'particles', text: 'Particles', background: '#006DBC', color: '#FFFFFF' }, // #006DBC
            { value: 'rainbow',   text: 'Rainbow',   background: '#2B2B2B', color: '#FFFFFF' }, // #2B2B2B
            { value: 'sparkling', text: 'Sparkling', background: '#08174C', color: '#FFFFFF' }, // #08174C
            { value: 'mystical',  text: 'Mystical',  background: '#000000', color: '#FFFFFF' }, // #000000
            { value: 'mesh',      text: 'Mesh',      background: '#000000', color: '#FFFFFF' }, // #000000
            { value: 'noisy',     text: 'Noisy',     background: '#110119', color: '#FFFFFF' }  // #110119
        ],

        options = (options = {}) => ({
            processStyle: { backgroundColor: '#5181b8' },
            useKeyboard: true,
            clickable: true,
            silent: true,
            width: 'auto',
            dotSize: 10,
            interval: 1,
            duration: .5,
            height: 4,
            ...options
        }),

        dump = {}

    /**
    * @see https://css-tricks.com/converting-color-spaces-in-javascript
    */
    function RGBAToHexA(color)
    {
        if (typeof color === 'string') return color.toUpperCase()

        let { r, g, b, a } = color

        a = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase()

        r = (+r).toString(16).padStart(2, '0').toUpperCase()
        g = (+g).toString(16).padStart(2, '0').toUpperCase()
        b = (+b).toString(16).padStart(2, '0').toUpperCase()

        return `#${r}${g}${b}${a}`
    }

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
            dynamic() {
                return this.$parent?.canvas._objects.find(o => o.type === 'dynamic-background') || {}
            },
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            current: {
                get() {
                    const { type } = this.dynamic.app || { type: this.list[0].value }

                    return {
                        text: `${type[0].toUpperCase()}${type.slice(1)}`,
                        value: type
                    }
                },
                set(v) {
                    this.choose(v)
                }
            },
            particleTheme: {
                set(v) {
                    this.dynamic.setExtra({ subset: v ? 'fabric' : 'cosmo' }).then(this.reloadProps)
                },
                get() {
                    return this.dynamic.app.particles.subset === 'fabric'
                }
            },
            rainbowTheme: {
                set(v) {
                    this.dynamic.setExtra({ subset: v ? 'octopus' : 'rain' }).then(this.reloadProps)
                },
                get() {
                    return this.dynamic.app.rainbow.subset === 'octopus'
                }
            },
            octopusLength: {
                get() {
                    const { min, max } = this.octopusSlider,
                        p = this.animationProp('p', 22)

                    return rclamp(p, min, max)
                },
                set(octopusLength) {
                    this.dynamic.setExtra({ octopusLength })
                }
            },
            particlesCount: {
                get() {
                    const { min, max } = this.particlesSlider,
                        nop = this.animationProp('nop', 100)

                    return rclamp(nop, min, max)
                },
                set(nop) {
                    this.dynamic.setExtra({ nop })
                }
            },
            tentaclesCount: {
                get() {
                    const tCount = this.animationProp('tCount', 25),
                        { min, max } = this.tentaclesSlider

                    return rclamp(tCount, min, max)
                },
                set(tCount) {
                    this.dynamic.setExtra({ tCount })
                }
            },
            tentaclesRadius: {
                get() {
                    const radius = this.animationProp('radius', 50),
                        { min, max } = this.tRadiusSlider

                    return rclamp(radius, min, max)
                },
                set(radius) {
                    this.dynamic.setExtra({ radius })
                }
            },
            noisyCount: {
                get() {
                    const count = this.animationProp('circlesNum', 40),
                        { min, max } = this.nCountSlider

                    return rclamp(count, min, max)
                },
                set(circlesNum) {
                    this.dynamic.setExtra({ circlesNum })
                }
            },
            noisyRadius: {
                get() {
                    const radius = this.animationProp('radius', 300),
                        { min, max } = this.nRadiusSlider

                    return rclamp(radius, min, max)
                },
                set(radius) {
                    this.dynamic.setExtra({ radius })
                }
            },
            noisyNoise: {
                get() {
                    const noise = this.animationProp('noise', 40),
                        { min, max } = this.nNoiseSlider

                    return rclamp(noise, min, max)
                },
                set(noise) {
                    this.dynamic.setExtra({ noise })
                }
            },
            noisySize: {
                get() {
                    const noise = this.animationProp('size', 300),
                        { min, max } = this.nSizeSlider

                    return rclamp(noise, min, max)
                },
                set(size) {
                    this.dynamic.setExtra({ size })
                }
            },
            meshSteps: {
                get() {
                    const step = this.animationProp('step', .1),
                        { min, max } = this.meshSlider

                    return step > max ? max : step < min ? min : step
                },
                set(step) {
                    this.dynamic.setExtra({ step })
                }
            },
            fontFamily: {
                get() {
                    const { fontFamily = 'Casper-Bold' } = this.animationProp('options')

                    return fonts.find(f => f.family === fontFamily)
                },
                set({ family: fontFamily }) {
                    this.dynamic.setExtra({ options: { fontFamily } })
                }
            },
            fontSize: {
                get() {
                    const { fontSize = 96 } = this.animationProp('options'),
                        { min, max } = this.fontSizeSlider

                    return rclamp(fontSize, min, max)
                },
                set(fontSize) {
                    this.dynamic.setExtra({ options: { fontSize } })
                }
            },
            textAlign: {
                get() {
                    return this.animationProp('options').align || 'center'
                },
                set(align) {
                    this.dynamic.setExtra({ options: { align } })
                }
            },
            text: {
                get() {
                    return this.animationProp('options').message || ''
                },
                set(message) {
                    this.dynamic.setExtra({ options: { message } })
                }
            },
            gradientRadius: {
                get() {
                    const { minRadius = 100, maxRadius = 900 } = this.animationProp()

                    return [minRadius, maxRadius]
                },
                set([minRadius, maxRadius]) {
                    this.dynamic.setExtra({ minRadius, maxRadius })
                }
            },
            gradientCount: {
                get() {
                    return this.animationProp('circlesNum', 20)
                },
                set(circlesNum) {
                    this.dynamic.setExtra({ circlesNum })
                }
            },
            ballsRadius: {
                get() {
                    const { minRadius = 10, maxRadius = 35 } = this.animationProp()

                    return [minRadius, maxRadius]
                },
                set([minRadius, maxRadius]) {
                    this.dynamic.setExtra({ minRadius, maxRadius })
                }
            },
            ballsCount: {
                get() {
                    return this.animationProp('numParticles', 75)
                },
                set(numParticles) {
                    this.dynamic.setExtra({ numParticles })
                }
            },
            ballsBlurring: {
                get() {
                    return 'blurry' in this.dynamic.app.animation
                        ? this.dynamic.app.animation.blurry
                        : true
                },
                set(blurry) {
                    this.dynamic.setExtra({ blurry })
                }
            },
            ballsEdging: {
                get() {
                    return 'border' in this.dynamic.app.animation
                        ? this.dynamic.app.animation.border
                        : false
                },
                set(border) {
                    this.dynamic.setExtra({ border })
                }
            },
            horizontal: {
                get() {
                    const { horizontal: h } = this.animationProp('options', .9),
                        { min, max } = this.vSlider

                    return h > max ? max : h < min ? min : h
                },
                set(horizontal) {
                    this.dynamic.setExtra({ options: { horizontal } })
                }
            },
            vertical: {
                get() {
                    const { vertical: v } = this.animationProp('options', .4),
                        { min, max } = this.vSlider

                    return v > max ? max : v < min ? min : v
                },
                set(vertical) {
                    this.dynamic.setExtra({ options: { vertical } })
                }
            },
            neonBg: {
                get() {
                    return rgbaParse(this.animationProp('background', rgbaParse(this.palette.background)))
                },
                set(background) {
                    background = rgbaStringify(background)

                    this.dynamic.setExtra({ background })
                    this.neonBgBtn = background
                }
            },
            hexBg: {
                get() {
                    return this.animationProp('background', this.palette.background)
                },
                set(background) {
                    background = isObject(background) ? background.hex : background

                    this.dynamic.setExtra({ background })
                    this.hexBgBtn = background
                }
            },
            hexColor: {
                get() {
                    return this.animationProp('color', this.palette.color)
                },
                set(color) {
                    color = isObject(color) ? color.hex : color

                    this.dynamic.setExtra({ color })
                    this.hexColorBtn = color
                }
            },
            palette()
            {
                return this.list.find(a => a.value === this.current.value)
            },

            ...entities.reduce((c, k) => ({
                ...c,

                [`is${k[0].toUpperCase()}${k.slice(1)}`]() {
                    return this.dynamic.app && !this.switching && this.current.value === k
                }

            }), {})
        },
        data: () => ({
            align: ['left', 'center', 'right'],

            nSizeSlider: options({ interval:  50, max: 600, min: 100 }),
            meshSlider:  options({ interval: .01, min: .07, max: .5  }),
            vSlider:     options({ interval: .1,  max: 1,   min: 0   }),

            octopusSlider:   options({ max: 36,  min: 8   }),
            particlesSlider: options({ max: 200, min: 50  }),
            tentaclesSlider: options({ max: 75,  min: 7   }),
            tRadiusSlider:   options({ max: 150, min: 20  }),
            nCountSlider:    options({ max: 70,  min: 10  }),
            nRadiusSlider:   options({ max: 600, min: 100 }),
            nNoiseSlider:    options({ max: 120, min: 20  }),
            fontSizeSlider:  options({ max: 136, min: 16  }),
            balloonsRange:   options({ max: 100, min: 0   }),
            gradientRange:   options({ max: 900, min: 100 }),
            gradientsSlider: options({ max: 50,  min: 10  }),
            balloonsSlider:  options({ max: 100, min: 10  }),

            neonBgBtn: 'rgba(0,0,0,0)',
            hexColorBtn: '#000',
            hexBgBtn: '#000',

            switching: false,
            colorPicker: false,
            bgPicker: false,

            fonts,
            list
        }),
        watch: {
            'dynamic.applied': 'cancel',
            'dynamic.app': 'cancel',

            colorPicker: 'reloadProps',
            bgPicker: 'reloadProps'
        },
        methods: {
            copy(prop)
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(RGBAToHexA(this[prop])))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            cancel: debounce(function(v)
            {
                switch (typeof v) {
                    case 'boolean':
                        v && setTimeout(() => this.$emit('tool:cancel'), 300)
                        break
                    case 'undefined':
                    case 'object':
                        v || setTimeout(() => this.$emit('tool:cancel'))
                        break
                }

            }, 50),
            reloadProps()
            {
                nextFrame(() => {
                    const { background, color } = this.palette,
                        bg = this.animationProp('background', background),
                        cl = this.animationProp('color', color)

                    this.particlesCount = this.animationProp('nop', 100)
                    this.hexColorBtn = this.hexColor = cl

                    if (this.current.value === 'neon') {
                        this.neonBg = rgbaParse(bg)
                        this.neonBgBtn = bg

                    } else {
                        this.hexBgBtn = this.hexBg = bg
                    }

                    this.$forceUpdate()
                })
            },
            animationProp(name = null, _default = {})
            {
                const k = name ? `${this.current.value}_${name}` : this.current.value

                try {

                    dump[k] = name
                        ? this.dynamic.app.animation[name]
                        : this.dynamic.app.animation

                } catch (e) {
                }

                return dump[k] || _default
            },
            choose(type)
            {
                this.colorPicker = this.bgPicker = false
                this.switching = true

                return this.dynamic.choose(type).then(() => {
                    this.switching = false
                    this.reloadProps()

                    /* switch (type.value) {
                        case 'particles':
                        case 'sparkling':
                        case 'noisy':
                        case 'neon':
                            // do somethink
                            break
                        case 'balloons':
                        case 'geometry':
                        case 'mystical':
                        case 'rainbow':
                            // do somethink
                            break
                        case 'gradient':
                        case 'mesh':
                            break
                    } */

                }).catch(e => {
                    this.$bus.$emit('snack', {
                        content: e.message,
                        color: 'error'
                    })
                })
            },
            apply()
            {
                this.dynamic.apply()
            }
        }
    }
</script>

<!--suppress CssUnknownProperty-->
<style lang="scss" scoped>
    @import "assets/css/classes.css";

    .fill-color-menu .color-dialog__body {
        ::v-deep .v-color-picker {
            background-color: transparent;

            .v-color-picker__canvas {
                max-width: 210px;
            }
            .v-color-picker__controls {
                padding: 15px 10px 7px;

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
            bottom: 6px;
            right: 9px;

            height: 29px;
            min-width: unset;
            padding: 0 5px;
        }
    }
    .drag-dynamic {
        max-width: 210px;

        .dynamic-settings {
            .dynamic__sparkling--textarea {
                ::v-deep .v-textarea > .v-input__control > .v-input__slot {
                    textarea {
                        overflow: hidden !important;
                        -ms-overflow-style: none;
                        scrollbar-width: none;

                        &::-webkit-scrollbar {
                            height: 0;
                            width: 0;
                        }
                    }
                }
            }
            .balls__blur-edge--toggler .bluring-edging {
                ::v-deep .v-input {
                    margin: 0;

                    .v-input__control .v-input__slot {
                        align-items: center;

                        label {
                            top: unset;
                        }
                    }
                }
            }
            .text__align-toolbar {
                cursor: pointer;

                ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                    max-height: 30px;
                    user-select: none;
                    cursor: pointer;

                    fieldset {
                        padding: 0 8px;
                    }
                    .v-select__slot {
                        min-height: unset;

                        .v-select__selections {
                            justify-content: space-between;
                        }
                        label {
                            top: 4px;
                        }
                    }
                }
            }
        }
        .toggler {
            font-size: 10px;
        }
        #particles_subset,
        #rainbow_subset {
            display: none;
        }
        [for="particles_subset"],
        [for="rainbow_subset"] {
            position: relative;
            display: block;
            padding: 15px;
            width: 130px;

            border-radius: 16px;
            line-height: 3px;
            cursor: pointer;
            color: #31b3ff;

            text-shadow: 1px 1px 0 rgba(255,255,255,.15);
            background: rgb(71, 71, 71);
            box-shadow:
                0 1px 3px rgba(100,100,100,.2),
                inset 0 0 0 5px rgb(60,60,60),
                inset 0 6px 6px rgba(0,0,0,.5),
                inset 0 -6px 1px rgba(255,255,255,.2);
        }
        [for="particles_subset"]:before,
        [for="rainbow_subset"]:before {
            position: absolute;
            right: 15px;

            color: #31b3ff;
        }
        [for="particles_subset"]:before {
            content: 'COSMO';
        }
        [for="rainbow_subset"]:before {
            content: 'RAIN';
        }
        [for="particles_subset"]:after,
        [for="rainbow_subset"]:after {
            position: absolute;
            left: 5px;
            top: 5px;

            display: flex;
            justify-content: center;
            height: 22px;
            width: 60px;

            border-radius: 10px;
            background: #ccc linear-gradient(#fcfff4 0%, #dfe5d7 40%, #b3bead 100%);
            color: rgb(71, 71, 71);

            line-height: 23px;
            font-weight: 700;
            font-size: 9px;

            transition: .5s;
        }
        [for="particles_subset"]:after,
        [for="rainbow_subset"]:after {
            content: '';
        }
        #particles_subset:checked ~ [for="particles_subset"],
        #rainbow_subset:checked ~ [for="rainbow_subset"] {
            &:after {
                left: 63px;
            }
        }
        button {
            margin: 0;
        }
    }
    .dynamic-types-menu .v-list,
    .text-fonts-menu .v-list {
        display: flex;
        flex-direction: column;

        .v-list-item {
            padding: 10px 12px;
        }
    }
    .ellipsisfont {
        display: block;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 210px;
    }
</style>
