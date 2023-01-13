<template>
    <lazy-graph-drag
        hash="manager"
        class="drag-manager"
        @close="$emit('tool:cancel')"
        :title="$t('graph.layers')"
        :close="true"
        :snap="snap"
        scrollable
    >
        <template v-if="layers.length">
            <slick-list :value="layers"
                @sort-start="setActive"
                @sort-end="changeList"
                @input="correction"
                helperClass="layers-info"
                appendTo=".layers-info"
                class="layers-info"
                lockToContainerEdges
                lockOffset="20%"
                lockAxis="y"
            >
                <slick-item v-for="(item, index) in layers" :disabled="item.type === 'promo-link'" :index="index" :key="index">
                    <pass v-if="item.type !== 'curved-controls'" :includes="selection(index)">
                        <template slot-scope="{ includes }">
                            <lazy-helper-fieldset
                                :class="{ [`${color}--text`]: includes, 'pt-2': index > 0 }"
                                :borderColor="includes ? hex : ''"
                                dense
                            >
                                <template #content>
                                    <div class="layer-title">
                                        {{ item.custom.name }}
                                    </div>

                                    <div class="controls">
                                        <template v-if="item.type !== 'promo-link'">
                                            <v-menu transition="slide-x-transition"
                                                :close-on-content-click="false"
                                                :max-width="210"
                                                :min-width="210"
                                                bottom
                                                left
                                            >
                                                <template #activator="{ on }">
                                                    <v-icon
                                                        :class="{ [`${color}--text`]: includes }"
                                                        :disabled="item.disallow"
                                                        v-on="on"
                                                        dense
                                                    >
                                                        {{ item | icon }}
                                                    </v-icon>
                                                </template>

                                                <v-list dense>
                                                    <v-list-item v-for="(a, i) in callbacks(item)"
                                                        @click.stop="a.onClick({ index, item })"
                                                        :key="i"
                                                    >
                                                        <v-list-item-title>
                                                            {{ a.title }}
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                        </template>
                                        <template v-else>
                                            <v-icon
                                                :class="{ [`${color}--text`]: includes }"
                                                :disabled="item.disallow"
                                                @click="purshase"
                                                dense
                                            >
                                                {{ item | icon }}
                                            </v-icon>
                                        </template>
                                    </div>
                                </template>
                            </lazy-helper-fieldset>
                        </template>
                    </pass>
                </slick-item>
            </slick-list>
        </template>
        <template v-else>
            <div class="layers-info">
                <lazy-helper-fieldset dense>
                    <template #content>
                        <div class="layer-empty">
                            -- {{ $t('graph.empty') | lowercase }} --
                        </div>
                    </template>
                </lazy-helper-fieldset>
            </div>
        </template>

        <v-dialog v-model="dialog" :width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <lazy-graph-rename-dialogue :name="name" @close="dialog = false" @apply="applyName" />
        </v-dialog>

        <v-dialog v-model="tariff" :width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <lazy-graph-tariff-dialogue @close="tariff = false" />
        </v-dialog>
    </lazy-graph-drag>
</template>

<script>
    import { SlickList, SlickItem } from 'vue-slicksort'
    import theme from '~/plugins/theme'

    import isArray from 'lodash/isArray'
    import uniq from 'lodash/uniq'

    const naming = (type, idx) => type === 'promo-link' ? 'promo' : `${type} ${idx + 1}`,
        notCrop = o => o && !o.prevent && o.type !== 'cropzone'

    /**
    * @see http://qaru.site/questions/16993228/how-to-define-variable-in-vue-template
    * @see https://github.com/kutlugsahin/vue-smooth-dnd
    * @see https://github.com/Jexordexan/vue-slicksort
    */
    export default {
        components: {
            SlickList,
            SlickItem,

            Pass: {
                render() {
                    return this.$scopedSlots.default(this.$attrs)
                }
            }
        },
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        filters: {
            icon(v) {
                switch (true) {
                    case v.type === 'promo-link':
                        return 'mdi-trash-can-outline'
                    case v.visible:
                        return 'mdi-eye-outline'

                    default:
                        return 'mdi-eye-off-outline'
                }
            },
            lowercase(v) {
                return v.toLowerCase()
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'white' : this.$store.state.app.color
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            canvas() {
                return this.$parent.canvas || {}
            },
            active() {
                return this.$parent.active || []
            },
            hex() {
                return theme[this.color]
            }
        },
        watch: {
            'canvas._objects': 'listBuilder'
        },
        data() {
            return {
                dialog: false,
                tariff: false,

                canvasListen: false,
                activeIndex: null,
                name: null,

                layers: [],
                dump: [],

                actions: [
                    { title: 'Show/Hide', onClick: this.edit.bind(this)     },
                    { title: 'Copy',      onClick: this.copy.bind(this)     },
                    { title: 'Remove',    onClick: this.remove.bind(this)   },
                    { title: 'Rename',    onClick: this.rename.bind(this)   },
                    { title: 'Deselect',  onClick: this.deselect.bind(this) }
                ]
            }
        },
        methods: {
            correction()
            {
                const { /* cover = 0, */ designer = 0 } = this.$store.state.app.subscribe || {}

                if (/* cover */ designer < (Date.now() / 1000) &&
                    this.layers.findIndex(o => o.type === 'promo-link') < this.layers.length - 1) {
                    this.canvas.forcePromo({ caller: this, method: 'listBuilder' })
                }
            },
            listBuilder(objects)
            {
                (objects && isArray(objects)) || (objects = this.canvas._objects || [])

                this.layers = objects.filter(notCrop).map((o, idx) => {
                    o.custom || o.setUnique()

                    o.custom.name || (o.custom.name = naming(o.type, idx))
                    this.$set(this.dump, idx, { visible: o.visible })

                    return o
                })

                this.correction()

                if (!this.canvasListen) {
                    this.onListen()
                }
            },
            onListen()
            {
                if (typeof this.canvas.on === 'function') {
                    this.canvas.off('canvas:shaken', this.listBuilder)
                    this.canvas.on('canvas:shaken', this.listBuilder)
                    this.canvasListen = true
                }
            },
            callbacks(item)
            {
                let actions = this.actions.slice(),
                    title = 'Settings'

                switch (item.type) {
                    case 'dynamic-background':
                        actions = actions.filter(a => !['Copy','Deselect','Rename'].includes(a.title))
                        break
                    case 'image':
                        return actions
                    case 'promo-link':
                        return []
                    case 'svg-shape':
                        title = 'Palette'
                        break
                    case 'frame':
                        title = 'Select'
                        break
                }

                return actions.concat([{
                    onClick: this.settings.bind(this, item),
                    title
                }])
            },
            selection(index)
            {
                let { designer = 0 } = this.$store.state.app.subscribe || {}, // .cover
                    active = this.active.slice()

                if (!designer || designer < (Date.now() / 1000 | 0)) {
                    active = active.filter((_, i) => i !== this.layers.length - 1)
                }

                return active.includes(index)
            },
            applyName({ name })
            {
                this.dialog = false
                this.canvas._objects[this.activeIndex].customName(name)
                this.activeIndex = null
                this.name = null
            },
            setActive({ event, index, target })
            {
                target || (target = this.layers[index])

                const { type, custom: { unique } } = target

                if (type !== 'promo-link' && type !== 'curved-controls') {
                    let active = [].concat(this.$parent.active.slice())

                    index = this.canvas._objects.findIndex(o => o.custom.unique === unique)

                    if (event.ctrlKey) {
                        active.push(index)
                    } else {
                        active = [index]
                    }

                    this.$parent.active = uniq(active)
                    this.$parent.restoreActiveObjects()
                }
            },
            changeList({ event, oldIndex, newIndex: index })
            {
                const target = this.canvas._objects[oldIndex]

                if (!target || target.type === 'promo-link') {
                    return
                }

                this.canvas.swap(oldIndex, index)
                this.canvas.requestRenderAll()

                this.setActive({ event, index, target })
            },
            rename({ index })
            {
                if (!this.canvas._objects[index]) return

                this.name = this.canvas._objects[index].custom.name
                this.activeIndex = index
                this.dialog = true
            },
            remove({ index, item: object })
            {
                if (!this.canvas._objects[index]) return

                object || (object = this.canvas._objects[index])

                if (object.type === 'dynamic-background') {
                    object.release()
                }

                this.canvas.remove(object)
                this.canvas.requestRenderAll()
            },
            edit({ index, item: object })
            {
                const visible = !object.visible

                this.$set(this.dump, index, { visible })

                object.set({ visible })

                this.canvas.requestRenderAll()
            },
            copy({ index })
            {
                const copier = this.$parent.copier

                copier.copy(
                    () => copier.paste(index + 1).then(copier.clear.bind(copier)),
                    this.canvas._objects[index]
                )
            },
            deselect({ index })
            {
                this.$parent.deselect(index)
            },
            settings(target)
            {
                this.$parent.discardActive(() => {
                    this.$parent.toActive(target)

                    switch (true) {
                        case target.type === 'dynamic-background':
                            target.stopFix = true
                            this.$parent.toolInset('graph-popup-dynamic')
                            break
                        case target.type === 'curved-text':
                            target.stopFix = true
                            this.$parent.popupCurved(target)
                            break
                        case target.type === 'svg-shape':
                            target.stopFix = true
                            this.$parent.colorize(target)
                            break
                        case target.type === 'qr-code':
                            target.stopFix = true
                            this.$parent.popupQRCode(target)
                            break
                        case target.type === 'c-text':
                            target.stopFix = true
                            this.$parent.popupText(target)
                            break
                        case target.type === 'merge':
                            target.stopFix = true
                            this.$parent.popupMerge(target)
                            break
                        case target.type === 'frame':
                            target.stopFix = true
                            this.$parent.composite(target)
                            break
                        case /widget/.test(target.type):
                            target.stopFix = true
                            this.$parent.popupWidget(target)
                            break
                        case target.type === 'triangle':
                        case target.type === 'ellipse':
                        case target.type === 'line':
                        case target.type === 'rect':
                            target.stopFix = true
                            this.$parent.popupShape(target)
                            break
                    }
                })
            },
            purshase()
            {
                this.tariff = true
            }
        },
        beforeDestroy()
        {
            if (typeof this.canvas.off === 'function') {
                this.canvas.off('canvas:shaken', this.listBuilder)
                this.canvasListen = false
            }
        },
        beforeMount()
        {
            this.listBuilder(this.canvas._objects)
        }
    }
</script>

<style lang="scss" scoped>
    .drag-manager {
        max-width: 210px;

        .layers-info {
            cursor: pointer;
            width: 100%;

            ::v-deep .custom.v-text-field > .v-input__control > .v-input__slot {
                min-height: unset;
                max-height: 30px;

                user-select: none;
                cursor: pointer;

                fieldset {
                    padding: 0 8px;
                    top: 0;
                }
                .v-select__slot {
                    min-height: unset;
                    width: 100%;

                    .v-select__selections {
                        display: flex;
                        flex: 1 1;

                        justify-content: space-between;
                        align-items: center;
                        padding: 4px 0;

                        .layer-empty {
                            font-style: italic
                        }
                        .layer-title {
                            max-width: 140px;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            overflow: hidden;
                        }
                        .controls .v-icon {
                            cursor: pointer;
                            height: 20px;
                            width: 20px;
                            margin: 2px;

                            &:hover::after {
                                background-color: currentColor;
                                opacity: .3;
                            }
                            .v-icon {
                                font-size: 18px !important;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
