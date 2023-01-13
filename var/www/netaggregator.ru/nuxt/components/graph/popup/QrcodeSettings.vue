<template>
    <graph-drag
        hash="qrcode-dialog"
        class="qrcode-settings"
        @close="$emit('tool:cancel')"
        :title="$t('graph.qrcode')"
        :close="true"
        :snap="snap"
    >
        <div v-if="qrcode" class="qrcode-popup">
            <v-flex class="qrcode__text--textarea pt-1">
                <v-textarea v-model="content" :label="$t('graph.content')" :color="color" rows="1" dense outlined hide-details />
            </v-flex>

            <v-flex class="qrcode__text--textarea pt-2">
                <v-textarea v-model="title" :label="$t('graph.title')" :color="color" rows="1" dense outlined hide-details />
            </v-flex>

            <v-flex class="qrcode__fonts-select pt-2">
                <v-select
                    v-model="current"
                    :color="color"
                    :label="$t('graph.font')"
                    :items="list"
                    item-text="family"
                    return-object
                    hide-details
                    outlined
                    dense
                    :menu-props="{
                        contentClass: 'qrcode-fonts-menu',
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

            <v-flex class="qrcode__color-picker pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.bgcolor') }}
                    </template>

                    <template #content>
                        <v-menu
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    :color="qrcode.title.backgroundColor"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    {{ bgRgba.a >= .01 ? '&nbsp;' : 'transparent' }}
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    v-model="bgRgba"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="qrcode__color-picker pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.color') }}
                    </template>

                    <template #content>
                        <v-menu
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    :color="qrcode.title.color"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    {{ colorRgba.a >= .01 ? '&nbsp;' : 'transparent' }}
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    v-model="colorRgba"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="qrcode__size-slider pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.size') }}
                    </template>

                    <template #content>
                        <vue-slider v-model="fontSize" v-bind="size" width="100%" />
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="qrcode__logo pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.logo') }}
                    </template>

                    <template #content>
                        <v-btn
                            @click="openFile"
                            color="rgba(0,0,0,0)"
                            :ripple="false"
                            elevation="0"
                            x-small
                            block
                        >
                            {{ $t(`common.${logo ? 'remove' : 'upload'}`) }}
                        </v-btn>
                    </template>
                </helper-fieldset>
            </v-flex>
        </div>
    </graph-drag>
</template>

<script>
    import { VColorPickerPatched as VColorPicker } from '~/utils/v-color-picker-patch'

    import { rgbaStringify } from '~/utils/common/rgba-stringify.mjs'
    import { rgbaParse } from '~/utils/common/rgba-parse.mjs'
    import { openFile } from '~/utils/common/open.mjs'

    import { fonts as list } from '~/assets/data/fonts.mjs'

    const options = {
        processStyle: { backgroundColor: '#5181b8' },
        useKeyboard: true,
        clickable: true,
        duration: .5,
        dotSize: 10,
        width: 'auto',
        interval: 1,
        height: 4
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
            color() {
                return this.$vuetify.theme.dark ? 'white' : this.$store.state.app.color
            },
            bgRgba: {
                get() {
                    return rgbaParse(this.qrcode.title.backgroundColor)
                },
                set(v) {
                    const { title } = this.qrcode

                    title.backgroundColor = rgbaStringify(v)

                    this.qrcode.set({ title })
                }
            },
            colorRgba: {
                get() {
                    return rgbaParse(this.qrcode.title.color)
                },
                set(v) {
                    const { title } = this.qrcode

                    title.color = rgbaStringify(v)

                    this.qrcode.set({ title })
                }
            },
            fontSize: {
                set(fontSize) {
                    const { title } = this.qrcode

                    title.fontSize = fontSize

                    this.qrcode.set({ title })
                },
                get() {
                    return this.qrcode.title.fontSize
                }
            },
            content: {
                set(text) {
                    this.qrcode.set({ text })
                },
                get() {
                    return this.qrcode.text
                }
            },
            title: {
                set(text) {
                    const { title } = this.qrcode

                    title.text = text

                    this.qrcode.set({ title })
                },
                get() {
                    return this.qrcode.title.text
                }
            },
            qrcode() {
                return this.$parent.canvas._objects.find(o => o.custom.unique === this.unique)
            },
            unique() {
                return this.$store.state.canvas.qrcode
            },
            logo() {
                return typeof this.qrcode.logo === 'string' &&
                    this.qrcode.logo !== ''
            }
        },
        watch: {
            current: 'apply',

            ctext(v) {
                v || (setTimeout(() => {
                    this.$emit('tool:cancel')
                }, 1e2))
            }
        },
        data: () => ({
            current: null,
            list,

            height: {
                ...options,
                interval: .1,
                max: 2,
                min: .1
            },
            size: {
                ...options,
                max: 92,
                min: 12
            }
        }),
        methods: {
            openFile()
            {
                if (!this.logo) {
                    openFile('image/*').then(this.load.bind(this))
                } else {
                    this.qrcode.set({ logo: '' })
                }
            },
            load(file)
            {
                if (file.type.includes('image')) {
                    const r = new FileReader()

                    r.onload = () => {
                        this.qrcode.set({ logo: r.result })
                    }

                    r.readAsDataURL(file)
                }
            },
            apply({ family })
            {
                const { title } = this.qrcode

                title.fontFamily = family

                this.qrcode.set({ title })
            }
        },
        beforeDestroy()
        {
            this.$store.commit('canvas/set', { qrcode: null })
        },
        beforeMount()
        {
            this.current = list.find(f => f.family === this.qrcode.title.fontFamily)
        }
    }
</script>

<!--suppress CssUnknownProperty -->
<style lang="scss" scoped>
    @import 'assets/css/classes.css';

    .fill-color-menu .color-dialog__body {
        ::v-deep .v-color-picker {
            .v-color-picker__canvas {
                max-width: 210px;
            }
            .v-color-picker__controls {
                padding: 16px 10px;

                .v-color-picker__input span {
                    display: none;
                }
            }
        }
    }
    .qrcode-settings {
        max-width: 210px;

        .qrcode__text--textarea {
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
        .qrcode-popup {
            .btn-toolbar .toolbar-item {
                max-height: 22px;
                width: 40px;

                border-radius: 0;

                &:hover::before {
                    background-color: currentColor;
                    opacity: .2;
                }
                &.theme--dark[disabled] .drawer-icon {
                    color: #fff !important
                }
            }
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
