<template>
    <v-dialog v-model="proxy" content-class="load-dialog" :fullscreen="mobile" :width="width" :hide-overlay="mobile">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" :color="barColor" height="20px" />

        <v-card v-show="editor"
            class="editor-panel"
            @wheel.prevent="wheel"
            @mouseleave="mouseLeave"
            @[downEvent]="mouseDown"
            @[moveEvent].prevent="mouseMove"
            @[endEvent]="mouseUp"
            elevation="0"
            ref="editor"
        >
            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="editor-panel__btn-wrapper" justify-start>
                    <v-btn @click="closeEditor" icon>
                        <v-icon dense>mdi-window-close</v-icon>
                    </v-btn>
                    <v-btn @click="receiveImage" icon>
                        <v-icon dense>mdi-check</v-icon>
                    </v-btn>
                    <v-btn @click="fit" :disabled="disabled" icon>
                        <v-icon dense>mdi-flip-to-front</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else-if="mobile">
                <v-tabs class="editor-panel__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab @click="closeEditor" :ripple="false">
                        <v-icon :color="color">mdi-window-close</v-icon>
                    </v-tab>
                    <v-tab @click="receiveImage" :ripple="false">
                        <v-icon :color="color">mdi-check</v-icon>
                    </v-tab>
                    <v-tab @click="fit" :disabled="disabled" :ripple="false">
                        <v-icon :color="color">mdi-flip-to-front</v-icon>
                    </v-tab>
                </v-tabs>
            </template>

            <v-card-text class="editor">
                <v-layout class="editor-canvas">
                    <canvas ref="canvas" :style="{ background }" />
                </v-layout>

                <v-layout v-if="!mobile" class="editor-toolbar">
                    <v-btn @click="fit" :disabled="disabled" :color="color" icon>
                        <v-icon dense>mdi-flip-to-front</v-icon>
                    </v-btn>
                </v-layout>

                <v-layout v-if="!mobile" class="editor-toolbar right">
                    <v-btn @click="receiveImage" :color="color" icon>
                        <v-icon dense>mdi-check</v-icon>
                    </v-btn>
                    <v-btn @click="closeEditor" :color="color" icon>
                        <v-icon dense>mdi-window-close</v-icon>
                    </v-btn>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-card v-show="!editor" class="images-panel" elevation="0" rounded="0">
            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="images-panel__btn-wrapper" justify-start>
                    <v-btn @click="apply()" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                    <v-btn @click="openFile" icon>
                        <v-icon>mdi-upload</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs class="images-panel__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab @click="apply()" :ripple="false">
                        <v-icon :color="color">mdi-window-close</v-icon>
                    </v-tab>
                    <v-tab @click="openFile" :disabled="!$store.state.app.vkapp && !user" :ripple="false">
                        <v-icon :color="color">mdi-upload</v-icon>
                    </v-tab>
                </v-tabs>
            </template>

            <div class="d-flex panel-list scroller" ref="panel">
                <v-layout v-if="authorized" class="panel-list__images" wrap>
                    <div v-for="(item, i) in list" class="flex panel-list__images--item xs6 sm4" :key="`ld-${i}-${item.id}`">
                        <v-card tile flat>
                            <v-img :src="item.images[item.images.length - 1].url"
                                @click="apply(item)"
                                aspect-ratio="1"
                                min-width="82px"
                            />
                        </v-card>
                    </div>
                </v-layout>
                <v-layout v-else class="empty-list" justify-center>
                    <div class="disabled--text">
                        <p>{{ $t('common.needed') }}</p>
                    </div>
                </v-layout>
            </div>
        </v-card>
    </v-dialog>
</template>

<script>
    import { empty510, empty480, empty150 } from '~/assets/data/widget'
    import { bg1, bg2 } from '~/assets/data/canvas-icons'

    import { debounce } from '~/utils/common/debounce.mjs'
    import { openFile } from '~/utils/common/open.mjs'

    import { common, editor, loader, error } from '~/mixins/widget'
    import { community } from '~/mixins/common'

    export default {
        mixins: [error, community, common, loader, editor],
        props: ['value','set'],

        model: {
            event: 'input',
            prop: 'value'
        },
        data: () => ({
            imgType: undefined,

            stopload: false,
            progress: false,
            editor: false,

            width: 400,
            total: 0,

            previous: [],
            list: []
        }),
        computed: {
            proxy: {
                get() {
                    return this.value
                },
                set() {
                    this.apply()
                }
            },
            color() {
                return this.$vuetify.theme.dark ? 'grey' : this.$store.state.app.color
            },
            barColor() {
                return this.$vuetify.theme.dark ? '#1e1e1e' : '#f5f5f5'
            },
            background() {
                return `url(${this.$vuetify.theme.dark ? bg2 : bg1}) repeat`
            },
            dimension() { // used in editor
                return this.sizes.find(s => s.type === this.imgType)
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            empty() {
                let url = this.user ? this.user.photo_100 : undefined,
                    usr = () => ({ id: '{uid}', images: [{ url }] }),
                    set = []

                switch (this.set.widget) {
                    case 'list':
                        set = [empty150, usr()]
                        break
                    case 'table':
                        set = [empty150, usr()]
                        break
                    case 'match':
                        set = [empty150]
                        break
                    case 'tiles':
                        set = [empty480]
                        break
                    case 'cover_list':
                        set = [empty510]
                }

                return set
            },
            downEvent() {
                return this.mobile ? 'touchstart' : 'mousedown'
            },
            moveEvent() {
                return this.mobile ? 'touchmove' : 'mousemove'
            },
            endEvent() {
                return this.mobile ? 'touchend' : 'mouseup'
            }
        },
        watch: {
            imgType: 'resetDialog',

            editor(v) {
                !v && (this.width = 400)
            },
            value(v) {
                if (!v) {
                    this.resetDialog()
                    this.$emit('input', false)
                } else {
                    this.start()
                }
            },
            stopload(v) {
                v && setTimeout(() => {
                    this.stopload = false
                }, 2e3)
            }
        },
        methods: {
            openFile()
            {
                openFile('image/*').then(this.openEditor)
            },
            openEditor(file)
            {
                this.editor = true
                this.upload(file)
            },
            closeEditor()
            {
                this.editor = false
            },
            resetDialog()
            {
                this.stopload = false
                this.progress = false

                this.total = 0
                this.list = []
            },
            receiveImage()
            {
                import(/* webpackChunkName: "blueimp" */ 'blueimp-canvas-to-blob')
                    .then(m => m.default || m)
                    .then(urlToBlob => this.getDataUrl().then(url => {
                        this.uploadFile(urlToBlob(url), this.imgType)
                        this.closeEditor()
                    }))
            },
            reload({ color: mark })
            {
                if (mark === 'success') {
                    this.loadImageList(true)
                }
            },
            transfer(list)
            {
                return {
                    offset: list.length ? list.length - this.empty.length : 0,
                    count: !list.length ? 9 - this.empty.length : 9
                }
            },
            loadImageList: debounce(function(reload = false)
            {
                if (!this.authorized || this.stopload) return

                const { offset: o, count: c } = reload
                    ? this.transfer(this.previous)
                    : this.transfer(this.list)

                if (!reload) {
                    this.previous = this.list
                }

                this.progress = true

                this.getImages(this.imgType, o, c)
                    .then(set => {
                        if (!set) return

                        this.stopload = !set.items.length

                        if (!this.list.length) {
                            set.items.unshift(...this.empty)
                        }
                        if (reload) {
                            set.items = set.items.filter(i => !this.list.includes(i))
                        }

                        this.list.push(...set.items)
                        this.update()

                        this.total = set.count
                        this.progress = false
                    })
            }, 100),
            start()
            {
                this.loadImageList()

                this.$bus.$off('snack', this.reload)
                this.$bus.$on('snack', this.reload)

                this.imgType = this.set.type

                this.initScroll()
            },
            apply(item)
            {
                this.$bus.$off('snack', this.reload)
                this.$emit('update', item)

                this.resetDialog()
            },
            initScroll()
            {
                if (this.smooth) return

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar(this.$refs.panel, {
                                callbacks: { onScroll: this.handleScroll }
                            })
                        })

                } else {
                    import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar.init(this.$refs.panel, {
                                continuousScrolling: false,
                                damping: 1
                            })

                            this.smooth.addListener(this.handleScroll)
                            this.smooth.updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                }
            },
            handleScroll({ offset, limit } = {})
            {
                if (!offset || !limit) {
                    ({ position: offset, max: limit } = this.smooth.scroll())
                }
                if (offset.y >= limit.y - 260) {
                    this.progress || this.loadImageList()
                }
            },
            update()
            {
                this.smooth && this.smooth.update()
            }
        }
    }
</script>

<style lang="scss" scoped>
    ::v-deep .load-dialog {
        &.v-dialog--fullscreen {
            min-height: 100%;
            height: 100%;

            .editor-panel .editor,
            .images-panel .panel-list {
                max-height: calc(100vh - 80px);
            }
        }
        .editor-panel__btn-wrapper,
        .images-panel__btn-wrapper {
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
        .editor-panel__tabs-header,
        .images-panel__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
            &.theme--dark {
                border-color: #8f8f8f;
            }
        }
        .panel-list {
            position: relative;
            align-items: flex-start;
            max-height: 345px;
            min-height: 345px;
            height: 100%;

            .scrollbar-track-y {
                background: none;
                width: 12px;

                .scrollbar-thumb-y {
                    margin-left: 5px;
                    width: 4px;
                }
            }
            .scroll-content,
            .os-viewport {
                width: 100%;
            }
            .panel-list__images {
                padding: 5px;

                .panel-list__images--item {
                    padding: 5px;
                    cursor: pointer;
                }
            }
            .layout.empty-list {
                width: 100%;
                padding: 50px 0;
                color: #9e9e9e;
            }
        }
        .images-panel.theme--dark {
            .panel-list .scrollbar-track-y {
                .scrollbar-thumb-y {
                    background-color: #7a7a7a;
                }
            }
        }
        .editor-panel .editor {
            position: relative;
            padding: 15px;

            .editor-toolbar {
                position: absolute;
                left: 20px;
                top: 20px;

                &.right {
                    left: unset;
                    right: 20px;
                }
                .v-btn {
                    cursor: pointer;

                    &:hover::before {
                        background-color: currentColor;
                        opacity: .5;
                    }
                    .v-icon {
                        font-size: 20px;
                    }
                }
            }
            .editor-canvas {
                margin: 0 auto;

                canvas {
                    display: block;
                    margin: 0 auto;
                    height: 100%;
                    width: 100%;
                }
            }
        }
    }
</style>
