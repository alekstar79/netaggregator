<template>
    <div class="image-editor" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <lazy-helper-dynamic-logo :src="logos" :delay="1e4" :glitch="glitch" fill="#cfcfcf" height="150px" width="150px" />

        <client-only>
            <lazy-graph-hover-zone position="top" :size="size.top" @hover="onHover" />
            <lazy-graph-top-toolbar v-if="ready" :menu="menu" :visible="visible.top" @change="onChange" ref="menu" />

            <div class="editzone" @click.self="discardActive" ref="container">
                <lazy-core-context
                    v-if="!mobile"
                    v-model="context"
                    :buttons="buttons"
                    @hover="contextOnHover"
                    @toggle="contextOnChange"
                    data-id="canvas-context-menu"
                    ref="context"
                />

                <lazy-graph-rulers-guides v-show="origin" @context="context = $event" :key="edit_zone_reset">
                    <canvas ref="canvas" />
                    <lazy-graph-upper-cover :components="components" :content="content" :evented="evented" ref="cover" />
                </lazy-graph-rulers-guides>
            </div>

            <lazy-graph-hover-zone position="left" :size="size.left" @hover="onHover" />
            <lazy-graph-left-toolbar v-if="ready" :tools="leftbar" :visible="visible.left" @change="onChange" @hide="onHover" />

            <lazy-graph-hover-zone position="right" :size="size.right" @hover="onHover" />
            <lazy-graph-right-toolbar
                v-if="ready"
                :tools="rightbar"
                :visible="visible.right"
                @image="setSearchImage"
                @create="setCanvas"
                @change="onChange"
                @hide="onHover"
                @upload="load"
            />

            <lazy-graph-hover-zone position="bottom" :size="size.bottom" @hover="onHover" />
            <lazy-graph-sticker-list
                v-if="ready"
                :visible="visible.bottom"
                @change="onChange"
                @hide="onHover"
                @choose="add"
                ref="sticker"
            />
        </client-only>

        <lazy-graph-zoom-range v-if="zoomrange && scaled" />

        <helper-intro-btn
            v-if="!mobile && !introViewed"
            @viewed="introViewed = $event"
            @show:intro="startIntro"
        />

        <template v-for="tool in tools">
            <component
                @change="drawingMode = $event"
                @tool:cancel="toolInset(tool, $event)"
                @tool:apply="toolApply"
                :key="tool"
                :is="tool"
                :snap="10"
            />
        </template>

        <v-dialog v-model="video"
            content-class="graph-dialog video"
            :max-width="mobile ? '100%' : '540px'"
            :fullscreen="mobile"
            persistent
        >
            <lazy-graph-video-open
                :videostream="videostream"
                @close="video = false"
                @open="imgResolver"
            />
        </v-dialog>

        <v-dialog v-model="openurl" content-class="graph-dialog openurl" :max-width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <lazy-graph-url-open :flag="openurl" @close="openurl = false" @open="imgResolver" />
        </v-dialog>

        <v-dialog v-model="opencovers" content-class="graph-dialog opencovers" :max-width="mobile ? '100%' : '700px'" :fullscreen="mobile">
            <lazy-graph-covers-select @close="opencovers = false" />
        </v-dialog>

        <v-dialog v-model="dataurl" content-class="graph-dialog dataurl" :max-width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <lazy-graph-data-url @close="dataurl = false" :b64data="b64data" :b64fake="b64fake" />
        </v-dialog>

        <v-dialog v-model="rembg" content-class="graph-dialog" :max-width="maxWidth" :fullscreen="mobile">
            <lazy-graph-remove-bg @maxWidth="setMaxWidth" @loading="loading = $event" @close="rembg = false" :image="rembgsource" />
        </v-dialog>

        <v-dialog v-model="clipboard" transition="dialog-top-transition" content-class="graph-dialog clipboard" max-width="350px" :fullscreen="mobile">
            <v-card class="covers-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
                <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

                <v-toolbar v-if="!mobile" :color="color" flat dark>
                    <v-toolbar-title>CHOOSE CLIPBOARD</v-toolbar-title>
                </v-toolbar>

                <v-list>
                    <v-subheader v-if="mobile">CHOOSE CLIPBOARD</v-subheader>
                    <template v-for="(item, i) in clipdata">
                        <v-list-item @click="item.apply" :key="i">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ $t(`graph.${item.type}`) }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-list>
            </v-card>
        </v-dialog>

        <v-overlay :value="loading" opacity="0.5" z-index="999" color="rgba(75,75,75,.8)">
            <v-progress-circular indeterminate size="64" :color="color" />
        </v-overlay>

        <lazy-graph-paste-image @paste="pasteImage">
            <template #default />
        </lazy-graph-paste-image>
    </div>
</template>

<script>
    // https://exceptionnotfound.net/drawing-with-fabricjs-and-typescript-part-1-intro-and-setup
    // https://coderlessons.com/articles/veb-razrabotka-articles/fabric-js-prodvinutyi
    // https://developer.mozilla.org/ru/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    // https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Code_snippets/Canvas

    // yarn add face-api.js
    // import { nets } from 'face-api.js'

    import { Fabric, Clip, Crop, Copier, Brush, Printer, drawers, calcQuality, rightbar, leftbar, menu, queueMicrotask /*, compress */ } from '~/utils/canvas/index.mjs'
    import { readFile as read } from '~/utils/common/read-file.mjs'
    import { clearNodes } from '~/utils/common/clear-nodes.mjs'
    import { dataURLMime } from '~/utils/common/url-mime.mjs'
    import { isObject } from '~/utils/common/is-object.mjs'
    import { rndstring } from '~/utils/common/symbols.mjs'
    import { distort } from '~/utils/canvas/distort.mjs'
    import { Bindings } from '~/utils/keybind.mjs'
    import { encode } from '~/utils/ubjson.mjs'

    import { busEvents, draggableEvents, empty, drop, logo } from '~/assets/data/canvas-assets.mjs'
    import { tracker, core, crop, intro } from '~/mixins/canvas/index.mjs'
    import { login } from '~/mixins/common'

    import saveAs from 'file-saver'

    const // description = 'Дизайнер - это онлайн-редактор изображений, использующий HTML5 Canvas. Редактируйте, настраивайте свои изображения, добавляйте эффекты онлайн в своем браузере, ничего не устанавливая.',
        description = 'Графический дизайн ВКонтакте от Netagregator. Сделать дизайн группы ВК онлайн. Все инструменты для сообществ в одном месте!',
        title = 'Дизайн группы ВК | Дизайн ВК онлайн'

    export default {
        layout: 'graph',

        mixins: [tracker, core, crop, login, intro],

        head() {
            return {
                title: this.$t('common.designer'),
                meta: [
                    { name: 'description',         hid: 'description',         content: description },
                    { name: 'og:description',      hid: 'og:description',      content: description },
                    { name: 'og:url',              hid: 'og:url',              content: 'https://netaggregator.ru/designer' },
                    { name: 'twitter:card',        hid: 'twitter:card',        content: 'summary_large_image' },
                    { name: 'twitter:title',       hid: 'twitter:title',       content: title },
                    { name: 'twitter:description', hid: 'twitter:description', content: description },
                    { name: 'twitter:image',       hid: 'twitter:image',       content: 'https://netaggregator.ru/icon.png' }
                ]
            }
        },
        jsonld()
        {
            return {
                '@context': 'https://schema.org/',
                '@type': 'WebSite',
                name: 'Дизайнер',
                url: 'https://netaggregator.ru/designer',
                image: 'https://netaggregator.ru/icon.png',
                sameAs: ['http://vk.com/netaggregator'],
                description
            }
        },
        data() {
            const { fixed } = this.$store.state.canvas

            return {
                file: { format: 'png', qtOutput: 1, quality: .6, name: '', size: 0 },
                visible: { bottom: fixed, right: false, left: false, top: fixed },
                size: { bottom: '90%', right: '90vh', left: '90vh', top: '50%' },
                maxWidth: this.mobile ? '100%' : '700px',

                printer: Printer.init(),
                bindings: Bindings.instance,
                busHandlers: new WeakMap(),
                edit_zone_reset: false,

                buttons: [
                    { icon: 'quick_save' },
                    { icon: 'save'       },
                    { icon: 'fit_window' },
                    { icon: 'layers'     },
                    { icon: 'info'       },
                    { icon: 'print'      }
                ],

                introViewed: true,
                opencovers: false,
                clipboard: false,
                zoomrange: false,
                loading: false,
                evented: false,
                dataurl: false,
                openurl: false,
                onover: false,
                glitch: false,
                cover: false,
                video: false,
                ready: false,
                saved: false,
                rembg: false,

                videostream: null,
                rembgsource: null,
                b64data: null,
                b64fake: null,
                context: null,
                fabric: null,
                canvas: null,
                eraser: null,
                drawer: null,
                copier: null,
                brush: null,
                crop: null,
                clip: null,
                tid: null,

                components: [],
                clipdata: [],
                content: [],
                drawers: [],
                models: [],
                tools: [],

                rightbar: [],
                leftbar: [],
                menu: []
            }
        },
        computed: {
            localeDateString() {
                return !!(this.$BROWSER || {}).LOCALE_DATE_STRING_SUPPORTED
            },
            dragAndDropCapable() {
                return !!(this.$BROWSER || {}).DRAG_AND_DROP_CAPABLE
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            logos()
            {
                const logos = [logo]

                if (this.dragAndDropCapable && !this.mobile) {
                    logos.push(drop)
                }

                return logos
            },
            drawingMode: {
                get() {
                    return this.drawer.drawingMode
                },
                set(i) {
                    this.drawer = this.drawers[i]
                }
            }
        },
        watch: {
            '$store.state.canvas.controls': 'snapGuidesHandler',
            '$store.state.canvas.index': 'restoreActiveObjects',
            '$store.state.app.window': 'setClientRect',
            '$store.state.app': 'stateTools',
            '$store.state.canvas.drawerOptions': {
                deep: true,
                handler(v) {
                    this.brush && this.brush.setOptions(v)
                }
            },
            presentation(v) {
                document.documentElement.classList[v ? 'add' : 'remove']('presentation', 'fixed')
                this.$store.commit('app/set', { presentation: v })
            },
            openurl(v) {
                v ? this.bindings.untrack() : this.bindings.track()
            },
            dataurl(v) {
                v ? this.bindings.untrack() : this.bindings.track()
            },
            video(v) {
                v || (this.videostream = null)
            },
            context(v) {
                v || this.printer.clear()
            },
            scaled(v) {
                v && this.scaling(v)
            },
            ready() {
                this.$bus.$emit('loading:finish')
            },

            canvas: 'stateTools'
        },
        methods: {
            snack(message, state = 'success')
            {
                let content = message, color = state, raw = false

                if (isObject(message) && 'content' in message) {
                    ({ content, color = state, raw } = message)
                }

                this.$bus.$emit('snack', {
                    content,
                    color,
                    raw
                })
            },
            setMaxWidth(width)
            {
                this.maxWidth = this.mobile ? '100%' : width || '700px'
            },
            async checkIntoOverview()
            {
                try {

                    this.introViewed = await this.$ls.get('designer:intro', false)

                } catch (e) {
                }
            },
            onHover({ position, state })
            {
                this.visible[position] = state
            },
            onChange({ position, size })
            {
                this.size[position] = size
            },
            async stateTools()
            {
                await this.$nextTick()

                this.rightbar.concat(this.leftbar).forEach(t => { t.reload() })
                this.menu.forEach(b => { b.reload() })

                this.menu = this.menu.map(block => ({
                    ...block,
                    items: block.items.filter(t => !(t.exclude && this.mobile))
                }))
            },
            getTools(tools)
            {
                return this.$nextTick().then(() => this.rightbar.concat(this.leftbar).filter(t => !tools.includes(t.id)))
            },
            async enableTools(tools = [])
            {
                try {

                    for (const t of await this.getTools(tools)) {
                        t.lock = false
                    }

                    await this.stateTools()

                } catch (e) {
                }
            },
            async disableTools(tools = [])
            {
                try {

                    for (const t of await this.getTools(tools)) {
                        t.lock = true
                    }

                    await this.stateTools()

                } catch (e) {
                }
            },
            snapGuidesHandler({ snap, save, open, grid })
            {
                if (!this.canvas) return

                const tool = 'graph-popup-snap-guides',
                    inset = this.tools.includes(tool),
                    show = this.canvas.showGrid,
                    on = snap || save || open

                if ((grid && !show) || (!grid && show)) {
                    this.canvas.toggleGrid()
                }

                switch (true) {
                    case !on && inset:
                        this.tools = this.tools.filter(t => t !== tool)
                        break
                    case on && !inset:
                        this.tools.push(tool)
                        break
                }

                this.stateTools()
            },
            isDynamicTool()
            {
                return this.canvas._objects.some(o => o && o.type === 'dynamic-background')
            },
            async setClientRect()
            {
                if (!this.fabric || typeof this.$refs.container === 'undefined') return

                await this.setClient()

                ;['height','width','left','top'].forEach(p => {
                    this.$refs.container.style[p] = this.client[p] + 'px'
                })
            },
            setEvents()
            {
                this.$off('drawingtool:history', this.stateTools)
                this.$on('drawingtool:history', this.stateTools)
            },
            async setTools()
            {
                await this.$nextTick()

                this.fabric.toolbox.forEach(({ id, init }) => this[id] = init(this))

                this.canvas.showGrid = false
                this.canvas.createGrid()

                if (!this.drawers.length) {
                    this.drawers = drawers.map((D, i) => new D(i))
                }
                if (!this.drawer) {
                    this.drawer = this.drawers[0]
                }

                this.brush.toolsInit(this)
                this.canvas.render.start()
            },
            postInit()
            {
                this.zoomrange = this.mobile

                if (this.canvas && this.incertToCanvas) {
                    const zoom = this.canvas.getZoom()

                    const { height: oh, width: ow } = this.incertToCanvas,
                        { height: nh, width: nw } = this.canvas,

                        rh = nh / zoom,
                        rw = nw / zoom,

                        kx = rw / ow,
                        ky = rh / oh

                    this.incertToCanvas.objects.forEach(o => {
                        o.set({ top: o.top * ky })

                        if (o.top < 0) {
                            o.set({ top: 0 })
                        }

                        o.set({ left: o.left * kx })

                        if (o.left < 0) {
                            o.set({ left: 0 })
                        }

                        this.canvas.insertTo(o)
                    })
                }

                this.incertToCanvas = null

                this.$emit('force:hide')
            },
            async setCanvas(options /* { width, height, scale, bg } */)
            {
                try {

                    await this.discharge(1)
                    await this.beforeInit()

                    await this.createContext(options)
                    await this.setClientRect()

                    await this.onInit()
                    await this.init()

                    await this.setTools()

                    this.bindStateHandler()
                    await this.stack('clear')

                    this.coverDetect()
                    this.setEvents()
                    this.postInit()

                    return true

                } catch ({ message }) {
                    this.snack({ content: message, color: 'error', raw: true })
                }
            },
            imgResolver({ src, adjust = false })
            {
                this.closeModals()

                if (!src) return Promise.resolve()

                const onerror = () => this.snack('graph.not_loaded', 'warning'),
                    resolver = response => Promise.resolve(response),

                    resolve = /^https?:\/\//.test(src)
                        ? this.$axios.$get('/corsoutwit', { params: { src }, responseType: 'blob' })
                        : resolver({})

                return resolve.then(response => {
                    let type, blob, ret = { target: { result: src }  }

                    if (response instanceof Blob) {
                        blob = response

                        if (blob.type) {
                            this.file.format = blob.type.replace('image/', '')
                        }
                        if (blob.size) {
                            this.file.size = blob.size
                        }
                    }

                    return (blob ? read(blob) : resolver(ret))
                        .then(async ({ target: { result: src } }) => {
                            if ((type = dataURLMime(src).type)) {
                                this.file.format = type.replace('image/', '')
                            }

                            await (/\.svg$/.test(src)
                                ? this.loadSvg(src, true)
                                : this.loadImage(src, onerror, adjust)
                            )

                            this.$bus.$emit('image:loaded')
                        })

                }).catch(onerror)
            },
            setSearchImage({ largeImageURL: src })
            {
                return this.imgResolver({ src })
            },
            pasteImage({ sources = [] /* writeClipboardContent */ })
            {
                const errorHandler = e => this.snack({ content: e.message, color: 'error', raw: true }),
                    proccesHandler = p => p.then(src => this.loadImage(src, errorHandler))

                switch (true) {
                    case !!sources.length && !this.copier.empty:
                        this.clipdata = [{
                            type: 'sys_clipboard',
                            /* clear: () => writeClipboardContent('').then(() => {
                                this.clipdata = this.clipdata.filter(c => c.type !== 'sys_clipboard')
                            }), */
                            apply: () => Promise.all(sources.map(proccesHandler)).then(() => {
                                this.canvas.trigger('programmatic')
                                this.clipboard = false
                            })
                        },{
                            type: 'app_clipboard',
                            /* clear: () => this.copier.clear().then(() => {
                                this.clipdata = this.clipdata.filter(c => c.type !== 'app_clipboard')
                            }), */
                            apply: () => this.copier.paste().then(() => {
                                this.canvas.trigger('programmatic')
                                this.clipboard = false
                            })
                                .catch(errorHandler)
                        }]

                        this.clipboard = true
                        break

                    case !this.copier.empty:
                        this.copier.paste().then(() => {
                            this.canvas.trigger('programmatic')
                        })
                            .catch(errorHandler)

                        break

                    case !!sources.length:
                        Promise.all(sources.map(proccesHandler)).then(() => {
                            this.canvas.trigger('programmatic')
                        })
                }
            },
            async readFile(file, callback)
            {
                try {

                    callback((await read(file))?.target.result)

                    return true

                } catch (e) {
                    this.snack('graph.upload_error', 'error')
                }

                return false
            },
            async load(file)
            {
                let format, name, body, res = false

                if (!file.type.match('image/.*')) {
                    this.snack.error.format()
                    return res
                }
                if (file.type.match('image/hei(f|c)')) {
                    name = file.name.replace(/\.hei[fc]/, '.png')
                    format = 'png'

                    body = new FormData()

                    body.set('file', file)

                    this.loading = true

                    try {

                        file = {}
                        file = await fetch('/node/heic', { method: 'POST', body })
                        file = await file.blob()

                    } catch (e) {
                        this.snack.error.load()
                    }
                }
                if (format || file.type) {
                    this.file.format = format || file.type.replace('image/', '')
                    this.file.quality = calcQuality(file.size)
                    this.file.name = name || file.name
                    this.file.size = file.size
                }

                // let minWidth = 10, minHeight = 10

                /* if (!/svg/.test(this.file.format)) {
                    return compress(file, { minWidth, minHeight, quality: this.file.quality })
                        .then(file => this.readFile(file, src => this.imgResolver({ src })))
                        .catch(this.snack.error.compress)
                } */

                if (this.file.format) {
                    try {

                        await (
                            !/svg/.test(this.file.format)
                                ? this.readFile(file, src => this.imgResolver({ src }))
                                : this.openSvg(file)
                        )

                        res = true

                    } catch (e) {
                        this.snack.error.read()
                    }
                }

                this.loading = false

                return res
            },
            async startEdit(json)
            {
                try {

                    if (json && await this.setCanvas(json)) {
                        await this.loadJson(json)
                    }

                } catch (e) {
                    this.snack({ content: e.message, color: 'error', raw: true })
                }
            },
            async quickLoad()
            {
                await this.startEdit(await this.$ls.get('image-editor-save', null))
            },
            quickSave(method)
            {
                return new Promise(resolve => {
                    if (!this.canvas || this.tid || method === 'clear') return resolve()

                    this.tid = setImmediate(async () => {
                        try {

                            this.canvas.forEachObject(o => o.ungrouped && o._modify({ suppress: true }))

                            if (!this.canvas._objects.find(o => o.ungrouped)) {
                                await this.$ls.set('image-editor-save', { ...this.canvas.toDatalessJSON(), ...this.scaled })
                                this.saved = true
                            }

                        } catch (e) {
                        }

                        await this.$nextTick()

                        this.tid = null
                        resolve()
                    })
                })
            },
            toDataURL({ format = 'png', quality = 1, widgets = true, blob = false } = {})
            {
                quality || (quality = this.file.qtOutput)
                format  || (format = this.file.format)

                return new Promise((resolve, reject) => {
                    queueMicrotask(() => {
                        try {

                            if (!this.canvas) return resolve(blob ? this.$refs.canvas : empty)

                            this.canvas.clone(blank => {
                                const transform = () => blob ? blank.toCanvasElement() : blank.toDataURL({ format, quality }),
                                    resolver = this.$BROWSER.IS_SAFARI ? distort : () => Promise.resolve()

                                blank.setDimensions(this.origin).setZoom(1)
                                blank.adjustObjects()

                                if (!widgets) {
                                    blank._objects = blank._objects.filter(o => !o.type.includes('widget'))
                                }
                                if (/jpe?g/.test(format)) {
                                    blank.backgroundColor = '#fff'
                                }

                                resolver(blank).then(transform).then(resolve)
                            })

                        } catch (e) {
                            reject(e)
                        }
                    })
                })
            },
            async save({ format = 'png', quality = 1, widgets = true } = {})
            {
                quality || (quality = this.file.qtOutput)
                format  || (format = this.file.format)

                try {

                    const cnv = await this.toDataURL({ format, quality, widgets, blob: true }),
                        save = blob => saveAs(blob, rndstring() + '.' + format)

                    cnv.toBlob(save, `image/${format}`, quality)

                } catch (e) {
                    this.snack({ content: e.message, color: 'error', raw: true })
                }
            },
            async saveAsDataURL()
            {
                try {

                    const data = await this.toDataURL()

                    this.b64fake = data.length / 2 > 300000
                        ? data.slice(0, 150000) + data.slice(data.length - 150000)
                        : data.slice()

                    this.b64data = data
                    this.dataurl = true

                } catch (e) {
                    this.snack('graph.converting_error', 'error')
                }
            },
            async saveAsJson()
            {
                try {

                    await this.$nextTick()

                    saveAs(new Blob(
                        [JSON.stringify({ ...this.canvas.toDatalessJSON(), ...this.scaled })],
                        { type: 'application/json;charset=utf-8' }
                    ), rndstring() + '.json')

                } catch (e) {
                    this.snack('graph.converting_error', 'error')
                }
            },
            async saveAsUBJson()
            {
                try {

                    await this.$nextTick()

                    saveAs(new Blob(
                        [encode({ ...this.canvas.toDatalessJSON(), ...this.scaled })],
                        { type: 'application/octet-stream' }
                    ), rndstring() + '.wxg')

                } catch (e) {
                    this.snack('graph.converting_error', 'error')
                }
            },
            toolInset(tool, remove = false)
            {
                if (remove || this.tools.includes(tool)) {
                    this.tools = this.tools.filter(t => t !== tool)
                } else {
                    this.tools.push(tool)
                }

                this.enableTools()
            },
            async toolApply({ tool, payload })
            {
                await this.$nextTick()

                let applied, finalize, brush

                switch (tool) {
                    case 'pencil':
                        brush = this.canvas.freeDrawingBrush
                        finalize = brush && ('finalize' in brush)
                        applied = brush && ('apply' in brush)

                        if (brush && payload.on) {
                            switch (true) {
                                case finalize:
                                    brush.finalize()
                                    break
                                case applied:
                                    brush.apply(false)
                                    break
                            }
                        }

                        Object.keys(payload).forEach(k => {
                            if (k === 'apply') {
                                applied && brush.apply(payload[k])
                            } else {
                                this.brush[k] = payload[k]
                            }
                        })
                        break
                    case 'draw':
                        this.$store.commit('canvas/setDrawerOption', { img: payload })
                        break
                    case 'filter':
                        await this.filterApply({ payload })
                        break
                    case 'clipto':
                        this.releaseClip(payload)
                        break
                }
            },
            async checkRunState()
            {
                const { app: { presentation }, cover } = this.$store.state

                this.closeModals()

                switch (true) {
                    case !!presentation:
                        await this.startIntro({ presentation })
                        break
                    case !!cover.edit:
                        await this.startEdit(cover.edit)
                        this.hash = cover.hash
                        this.tmpl = cover.tmpl
                        break
                    case !!cover.image:
                        await this.imgResolver(cover.image)
                        this.hash = null
                        break
                }
            },
            async dropHandler({ dataTransfer })
            {
                this.onover = false

                for (let i = 0; i < dataTransfer.files.length; i++) {
                    if (await this.load(dataTransfer.files[i])) break
                }
            },
            dragleaveHandler()
            {
                this.onover = false
            },
            dragenterHandler()
            {
                this.onover = true
            },
            eventBusOn()
            {
                Object.entries(busEvents).forEach(([e, h]) => {
                    if (this.busHandlers.has(this[h])) return

                    this.busHandlers.set(this[h], e)
                    this.$bus.$on(e, this[h])
                })
            },
            eventBusOff()
            {
                Object.entries(busEvents).forEach(([e, h]) => {
                    this.busHandlers.delete(this[h])
                    this.$bus.$off(e, this[h])
                })
            },
            forceUpdate()
            {
                this.edit_zone_reset = !this.edit_zone_reset

                this.$forceUpdate()

                clearNodes('[class*="canvas-text-renderer"]')
                clearNodes()
            },
            closeModals()
            {
                this.opencovers = false
                this.dataurl = false
                this.openurl = false
                this.video = false
            },
            drop()
            {
                this.$store.commit('cover/set', { edit: null, image: null, hash: null, tmpl: null })

                const tools = { rightbar: [], leftbar: [], menu: [], copier: null, brush: null, hash: null, tmpl: null }

                Object.keys(tools).forEach(p => { this[p] = tools[p] })
            },
            async discharge(action)
            {
                await this.$nextTick()

                ;['components','content','active','tools','drawers'].forEach(p => this[p] = [])

                this.$off('drawingtool:history', this.stateTools)

                this.bindings.unbind(this.offmap)
                this.canvas?.render?.stop()

                this.unbindStateHandler()
                this.unbindMoveTracker()
                this.trackerEventsOff()
                this.removeAllObjects()

                await this.stack('dispose')

                if (this.cropzone) {
                    this.cropReset()
                }
                switch (true) {
                    case /* reload */!!(action & 1):
                        if (!this.mobile) {
                            this.tools = ['graph-popup-manager','graph-popup-info']
                        }
                        break
                    case /* exit */!!(action & 2):
                        this.eventBusOff()
                        this.drop()
                        break
                    case /* close */!!(action & 4):
                        break
                }

                this.freedraw = false
                this.cursorMode = 1
                this.canvas = null

                this.forceUpdate()
            },
            async beforeInit()
            {
                this.copier = new Copier(this)

                this.rightbar = rightbar(this)
                this.leftbar = leftbar(this)
                this.menu = menu(this)

                this.$store.dispatch('app/settingsLoad')

                this.glitch = false // await this.$ls.get('image-editor-glitch', !this.mobile)
                this.saved = !!await this.$ls.get('image-editor-save', false)

                this.brush = new Brush(this)
                this.crop = new Crop(this)
                this.clip = new Clip(this)
            },
            async onInit()
            {
                await this.$nextTick()

                this.initializeShortCutEvents()
                this.bindMoveTracker()
                this.eventBusOn()

                /* if (!this.$state.models.length) {
                    this.loadModels()
                } */
            }
            /* loadModels()
            {
                this.$state.models = models.map(m => nets[m].loadFromUri('/models'))
            } */
        },
        beforeMount()
        {
            const snack = this.snack = this.snack.bind(this)

            this.snack.error = {
                compress: () => snack({ content: 'Compress image error', color: 'error', raw: true }),
                format:   () => snack({ content: 'Invalid image format', color: 'error', raw: true }),
                read:     () => snack({ content: 'Read image error',     color: 'error', raw: true }),
                load:     () => snack({ content: 'Load image error',     color: 'error', raw: true })
            }

            this.beforeInit()
        },
        mounted()
        {
            Fabric.resolve().then(f => {
                f.Canvas.prototype.localeDateString = this.localeDateString
                f.Canvas.prototype.$t = this.$t.bind(this)

                this.passFabricInstanceToTrack(f)

                this.fabric = f
            })
                .then(this.onInit)
                .then(this.checkRunState)
                .then(this.checkIntoOverview)
                .then(() => this.dragAndDropCapable && draggableEvents.forEach(evt => {
                    this.$refs.container.addEventListener(evt, e => {
                        e.stopPropagation()
                        e.preventDefault()

                        if (this[`${evt}Handler`]) {
                            this[`${evt}Handler`](e)
                        }

                    }, false)
                }))
                .catch(e => {
                    this.snack({ content: e.message, color: 'error', raw: true })
                })
                .finally(() => {
                    this.ready = true
                })
        },
        async asyncData({ store })
        {
            await store.dispatch('cover/templatesLoad')
        },
        beforeDestroy()
        {
            this.discharge(2)
        }
    }
</script>

<style lang="scss" scoped>
    @import 'assets/css/classes.css';

    .image-editor {
        display: block;
        position: relative;
        height: 100vh;
        width: 100vw;
        padding: 0;
        margin: 0;

        background-color: $basic-bg-color;
        overflow: hidden;

        .editzone {
            position: fixed;
            overflow: hidden;

            ::v-deep .canvas-container {
                box-shadow: 0 2px 4px rgba(50,50,50,.3);
            }
        }
        ::v-deep .tool-wrapper {
            position: absolute;
            top: 50%;

            display: flex;
            padding: .3em;
            border-radius: 5px;
            transform: translateY(-50%);

            box-shadow:
                0 2px 4px -1px rgba(0,0,0,.2),
                0 4px 5px 0 rgba(0,0,0,.14),
                0 1px 10px 0 rgba(0,0,0,.12);

            .v-btn.v-btn--icon.toolbar-item {
                background-color: rgba(50,50,50,.1);
                border-radius: 0;
                height: 40px;
                margin: 2px;

                &:hover {
                    background-color: rgba(256,256,256,.3);
                }
                .v-btn__content .v-icon {
                    color: #f3f3f3;
                }
            }
        }
        &.theme--dark {
            background-color: #242424 !important;

            .editzone {
                ::v-deep .canvas-container {
                    box-shadow: 0 2px 4px rgba(0,0,0,.3);
                }
            }
        }
    }
    ::v-deep .v-dialog.graph-dialog {
        &.opencovers {
            height: 100%;
        }
        &.video {
            width: unset;
        }
    }
    @media all and (max-width: 375px) {
        ::v-deep .v-dialog.graph-dialog {
            max-height: 100vh !important;
            margin: 0 !important;
            height: 100%;
            width: 100%;
        }
    }
</style>
