import { Brush, Widgets, queueMicrotask, upscale, getAdjustData, getDecreaseData, doCorrections, colorToAlpha, colorZoom, replaceColor } from '../../utils/canvas/index.mjs'
import { initCenteringGuidelines, initAligningGuidelines } from '../../utils/canvas/guidelines.mjs'
import { loadFont } from '../../utils/canvas/fonts/loader.mjs'

import { kebabToCamel, mapping } from '../../utils/common/profiles.mjs'
import { distort, toBlob } from '../../utils/canvas/distort.mjs'
import { openFile } from '../../utils/common/open.mjs'
import { rclamp } from '../../utils/common/clamp.mjs'

import { decode, encode } from '../../utils/ubjson.mjs'

import { ObjectId } from 'bson'

export const options = { preserveObjectStacking: true, selectionKey: 'ctrlKey' }
export const object = ['object:added','object:removed','object:modified','programmatic']
export const widgets = ['profile','time','calendar','feed','info','weather','currency','countdown','rss','json','traffic']
    .map(w => `widget-${w}`)

export const mongoId = () => new ObjectId(null).toHexString()
export const noop = () => {}

let stackStop = false
// let binding = {}

export default {
    data: () => ({
        leaveEventsSet: undefined,
        lockEventsSet: false,
        composing: false,

        incertToCanvas: null,
        fixedCursor: null,
        coverQuery: null,

        hash: null,
        tmpl: null,

        makeActions: [],
        freezydump: []
    }),
    watch: {
        fixedCursor: 'trackDefaultCursor',

        leaveEventsSet(v) {
            this.canvas.trigger('draw:state', { state: !!v })
        }
    },
    methods: {
        async init()
        {
            if (!this.$refs.canvas) return

            await this.$nextTick()

            if (!this.canvas) {
                // fabric.Canvas.prototype.renderAll = this.curryingRender(fabric.Canvas.prototype.renderAll)
                this.canvas = new this.fabric.Canvas(this.$refs.canvas, options)
                initCenteringGuidelines(this.canvas)
                initAligningGuidelines(this.canvas)

            } else {
                this.canvas.reload(this.$refs.canvas, options)
            }

            this.canvas.clear()
            this.scaling(this.scaled)
            this.$bus.$emit('canvas:reload')

            this.trackerEventsOff()
            this.trackerEventsOn()
        },
        async canvasFinalize()
        {
            this.canvas && this.canvas.finalize(!(this.$store.state.app.subscribe || {}).designer > (Date.now() / 1000 | 0)) //.cover
        },
        trackDefaultCursor()
        {
            this.unwatch && this.unwatch()

            if (!this.fixedCursor) return

            this.canvas.on('mouse:move', this.keepCursor)

            this.unwatch = () => {
                this.canvas.off('mouse:move', this.keepCursor)
                this.unwatch = null
            }
        },
        keepCursor()
        {
            this.canvas.defaultCursor = this.fixedCursor
        },
        async stack(method = 'update')
        {
            if (!this.canvas || this.leaveEventsSet) return

            if (method !== 'dispose' && stackStop) return

            stackStop = true

            switch (method) {
                case 'update':
                    await this.quickSave(method)
                    await this.canvas?.manager.updateStack()
                    break

                case 'dispose':
                    this.$store.commit('canvas/disposeStack')
                    await this.canvas?.manager.clearStack()
                    break

                case 'clear':
                    await this.canvas?.manager.clearStack()

                    if (!this.presentation) {
                        await this.quickSave(method)
                    }
            }

            stackStop = false
        },
        async stateHandler(/* action, */{ target /*, e */ })
        {
            const type = (target || {}).type || 'd7bfhukugtdrbtvdropmhgd7c'

            if (this.canvas.stackManagerStop || /curved-controls/.test(type)) return

            this.stack().catch(() => {})
        },
        /* curryingRender(render)
        {
            return function() {
                render.call(this)
            }
        }, */
        /* curryingState(action, e)
        {
            if (action === 'bind') {
                binding[e] || (binding[e] = this.stateHandler.bind(this, e))
            }

            return binding[e]
        }, */
        leaveEvents(events = [])
        {
            if (this.lockEventsSet) return

            this.leaveEventsSet = events

            this.unbindStateHandler(object.filter(o => !events.includes(o)))
        },
        restoreEvents(events)
        {
            events || (events = this.leaveEventsSet)

            if (this.lockEventsSet) return

            if (events !== undefined) {
                this.bindStateHandler(object.filter(o => !events.includes(o)))
            }

            this.leaveEventsSet = undefined
        },
        unbindStateHandler(events)
        {
            // this.canvas && (events || object).forEach(e => this.canvas.off(e, this.curryingState('unbind', e)))
            this.canvas && (events || object).forEach(e => this.canvas.off(e, this.stateHandler))
        },
        bindStateHandler(events)
        {
            // this.canvas && (events || object).forEach(e => this.canvas.on(e, this.curryingState('bind', e)))
            this.canvas && (events || object).forEach(e => this.canvas.on(e, this.stateHandler))
        },
        undo()
        {
            this.canvas.manager.undo(this.quickSave.bind(this, 'undo'))
        },
        redo()
        {
            this.canvas.manager.redo(this.quickSave.bind(this, 'redo'))
        },
        async loadJson(json)
        {
            try {

                const f = (json.objects || []).filter(o => o.fontFamily).map(o => loadFont(o))
                await (f.length ? Promise.all(f) : Promise.resolve())

                this.leaveEvents([])

                await new Promise(resolve => {
                    this.canvas.loadFromJSON(json, () => {
                        this.distort({ reload: true })
                        setTimeout(resolve)
                    })
                })

                this.setMode(this.freedraw)
                this.restoreEvents([])
                await this.stack()

            } catch (e) {
            }
        },
        setBackgroundColor(color)
        {
            this.canvas.setBackgroundColor(color, this.setRenderBound())

            return this
        },
        setBackgroundImage(url, options)
        {
            this.canvas.setBackgroundImage(
                url, this.setRenderBound(),
                {
                    crossOrigin: 'anonymous',
                    originX: 'left',
                    originY: 'top',
                    ...options
                }
            )

            return this
        },
        setRenderBound(cb)
        {
            if (typeof cb !== 'function') {
                cb = this.canvas ? this.canvas.requestRenderAllBound : noop
            }

            return cb
        },
        toggleMode()
        {
            this.canvas.set({ selection: !(this.freedraw = !this.freedraw) })
        },
        setMode(freedraw)
        {
            this.canvas.set({ selection: !(this.freedraw = freedraw) })
        },
        getId(obj)
        {
            return this.canvas.getObjects().findIndex(o => o === obj)
        },
        setActive(object, callback)
        {
            if (!this.canvas || object.type === 'promo-link') return this

            callback = this.setRenderBound(callback)
            this.canvas.setActiveObject(object)

            callback()

            return this
        },
        discardActive(callback)
        {
            if (!this.canvas) return this

            callback = this.setRenderBound(callback)

            this.canvas.discardActiveObject()
            this.active = []

            callback()

            return this
        },
        deselect(index, callback)
        {
            if (!this.canvas) return this

            callback = this.setRenderBound(callback)

            const active = this.active.filter(idx => idx !== index)

            this.discardActive()
            this.active = active

            this.restoreActiveObjects()

            callback()

            return this
        },
        deleteSelected(callback)
        {
            if (!this.canvas || !this.active.length) return this

            callback = this.setRenderBound(callback)

            const active = this.active.map(id => this.canvas.item(id))
                .filter(o => !o.isEditing)
                .filter(Boolean)

            this.canvas.remove(...active)

            callback()

            return this
        },
        selectedObjects()
        {
            if (!this.canvas) return this

            let idx, objects = this.canvas.getObjects()

            this.active = []

            this.canvas.getActiveObjects().forEach(o => {
                if (o.type === 'promo-link') return

                if ((idx = objects.indexOf(o)) !== -1) {
                    this.active.push(idx)
                }
            })

            return this
        },
        setSelection(objects)
        {
            if (!this.canvas || !objects.length) return this

            objects = objects.filter(o => o.type !== 'promo-link')

            this.canvas.setActiveObject(
                new this.fabric.ActiveSelection(objects, {
                    canvas: this.canvas
                })
            )

            return this
        },
        activeSelection(group)
        {
            if (!this.canvas) return this

            if (!group.canvas) {
                group.set({ canvas: this.canvas })
            }

            group.toActiveSelection()

            return this
        },
        selectAll(callback, exclude = [])
        {
            if (!this.canvas) return this

            callback = this.setRenderBound(callback)
            exclude = [...exclude, 'promo-link']

            this.canvas.discardActiveObject()
            this.active = []

            this.setSelection(
                this.canvas.getObjects()
                    .filter(o => !exclude.includes(o.type))
            )

            this.canvas.getActiveObjects()
                .forEach((_, idx) => {
                    this.active.push(idx)
                })

            callback()

            return this
        },
        toActive(object)
        {
            if (!this.canvas) return this

            return ['group','activeSelection'].includes(object.type)
                ? this.activeSelection(object)
                : this.setActive(object)
        },
        restoreActiveObjects(callback)
        {
            if (!this.canvas) return this

            callback = this.setRenderBound(callback)

            const active = this.active.map(id => this.canvas.item(id))
                .filter(o => o && o.type !== 'promo-link')

            this.canvas.discardActiveObject()

            switch (true) {
                case active.length > 1:
                    this.setSelection(active)
                    break
                case active.length > 0:
                    this.toActive(active[0])
                    break
            }

            callback()

            return this
        },
        scaling(properties) // todo: Проверить цепочку на факт усечения на Samsung A51 (android) [devise-pixel-ratio]
        {
            if (!this.canvas) return this

            const { height, width, scale } = properties || {}

            this.canvas.setZoom(scale).setDimensions({ height, width })

            if (this.canvas.backgroundImage) {
                this.canvas.backgroundImage.height = height
                this.canvas.backgroundImage.width = width
            }
            if (this.brush) {
                this.brush.setScale({ scale })
            }

            return this

        },
        rescaleMask(target, mask)
        {
            let targetCenterX, targetCenterY, maskOverlapX, maskOverlapY

            mask.originX = 'left'
            mask.originY = 'top'

            mask.scaleX = 1 / target.scaleX
            mask.scaleY = 1 / target.scaleY

            targetCenterY = target.height * target.scaleY / 2
            targetCenterX = target.width * target.scaleX / 2
            maskOverlapX = mask.left - target.left
            maskOverlapY = mask.top - target.top

            mask.left = (maskOverlapX - targetCenterX) / target.scaleX
            mask.top = (maskOverlapY - targetCenterY) / target.scaleY
            mask.objectCaching = false

            mask.setCoords()

            return mask
        },
        translatePoint(obj, oX = 'center', oY = 'center')
        {
            return obj.translateToGivenOrigin(
                { x: obj.left, y: obj.top },
                obj.originX,
                obj.originY,
                oX,
                oY
            )
        },
        setLeftTopPosition(obj)
        {
            const p = obj.translateToOriginPoint({ x: obj.left, y: obj.top }, 'left', 'top')

            obj.set({ originX: 'left', originY: 'top', left: p.x, top: p.y }).setCoords()
        },
        releaseClip({ path, object })
        {
            this.canvas.remove(path)

            if (!object || object.type !== 'image') {
                this.lockEventsSet = false
                this.restoreEvents([])
                return
            }
            if (object.originX === 'center' || object.originY === 'center') {
                this.setLeftTopPosition(object)
            }

            object.setCoords()

            const mask = this.rescaleMask(object, path),
                translate = this.translatePoint(object),
                centerPoint = object.getCenterPoint(),
                origin = object.toObject(),
                id = this.getId(object)

            object.transformLeft = translate.x - centerPoint.x
            object.transformTop = translate.y - centerPoint.y
            object.originalScaleX = object.scaleX
            object.originalScaleY = object.scaleY
            object.originalAngle = object.angle
            object.clipMask = mask

            object.set('clipTo', function() {
                const ctx = arguments[0]

                ctx.save()
                ctx.rotate(-this.originalAngle * Math.PI / 180)
                ctx.translate(
                    this.transformLeft / this.originalScaleX,
                    this.transformTop / this.originalScaleY
                )

                this.clipMask.render(ctx)

                ctx.restore()
            })

            const afterrender = () => {
                this.canvas.off('after:render', afterrender)

                const cnv = object.toCanvasElement({ withoutTransform: true }),
                    flat = { ...origin, scaleX: 1, scaleY: 1, angle: 0 },
                    { width: oW, height: oH } = origin

                this.fabric.Image.fromObject(flat, tmp => {
                    const cvs = tmp.toCanvasElement(),
                        ctx = cvs.getContext('2d')

                    ctx.clearRect(0, 0, oW, oH)
                    ctx.drawImage(cnv, 0, 0)

                    origin.src = cvs.toDataURL()
                    this.fabric.Image.fromObject(origin, img => {
                        this.canvas.insertAt(img, id)
                        this.canvas.remove(object)

                        this.lockEventsSet = false
                        this.restoreEvents([])

                        this.canvas.trigger('programmatic')
                    })
                })
            }

            this.canvas.on('after:render', afterrender)
            this.canvas.renderAll()
        },
        modeToggle(mode, active, apply = false)
        {
            const { id } = this.fabric.toolbox.find(t => t.brush === mode)

            if (!this.canvas) return

            if (!this.canvas.isDrawingMode && active) {
                this.leaveEvents([])
                this.lockEventsSet = true

                this[id].setTargetObject(active)
                this.brush.mode = mode
                this.brush.on = true

            } else {
                this[id].perform(apply, () => {
                    this.lockEventsSet = false
                    this.brush.on = false

                    if (this.leaveEventsSet) {
                        this.restoreEvents([])
                    }
                    if (apply) {
                        this.canvas.trigger('programmatic')
                    }
                })
            }
        },
        eraseModeToggle(active, apply = false)
        {
            this.modeToggle(Brush.ERASE, active, apply)
        },
        desaturateModeToggle(active, apply = false)
        {
            this.modeToggle(Brush.DESATURATE, active, apply)
        },
        sharpenModeToggle(active, apply = false)
        {
            this.modeToggle(Brush.SHARPEN, active, apply)
        },
        cloneModeToggle(active, apply = false)
        {
            this.modeToggle(Brush.CLONE, active, apply)
        },
        bulgeModeToggle(active, apply = false)
        {
            this.modeToggle(Brush.BULGE, active, apply)
        },
        blurModeToggle(active, apply = false)
        {
            this.modeToggle(Brush.BLUR, active, apply)
        },
        magicModeToggle(active, apply = false)
        {
            this.modeToggle(Brush.MAGIC, active, apply)
        },
        fillModeToggle(active, apply = false)
        {
            this.modeToggle(Brush.FILL, active, apply)
        },
        async filterApply({ payload: filter })
        {
            await this.$nextTick()

            let active = this.canvas.getActiveObjects(),
                cmp = f => f.type !== filter.type,
                exclude = false

            if (active.length) {
                active.forEach(a => {
                    if (typeof a.applyFilters !== 'function') {
                        exclude = true
                        return
                    }

                    a.filters || (a.filters = [])
                    a.filters = a.filters.filter(cmp)
                    a.filters.push(filter)
                    a.applyFilters()
                })

                this.canvas.requestRenderAll()
                    .trigger('programmatic')
            }
            if (exclude) {
                this.$bus.$emit('snack', {
                    content: 'graph.applied_to_images',
                    color: 'warning'
                })
            }
        },
        removeById(id)
        {
            this.canvas.getObjects().some(o => {
                if (o.id === id) {
                    this.canvas.remove(o)
                    return true
                }

                return false
            })
        },
        getActives()
        {
            let active = this.canvas.getActiveObjects()

            if (!active.length) {
                active = this.canvas.getObjects()
            }

            this.freezydump = []

            active.forEach(a => {
                this.canvas._objects.find((o, id) => {
                    if (a !== o) return false

                    this.canvas._objects[id].id = id
                    a.id = id

                    this.freezydump.push(a)

                    return true
                })
            })

            return active
        },
        toNewCanvas()
        {
            const zoom = this.canvas.getZoom()

            this.incertToCanvas = {
                objects: this.canvas.getActiveObjects(),
                height: this.canvas.height / zoom,
                width: this.canvas.width / zoom
            }

            this.$bus.$emit('open:new-dialog')
        },
        restoreCanvas()
        {
            if (!this.freezydump.length) return

            let needRestore = false

            if (!this.lockEventsSet) {
                this.leaveEvents([])
                needRestore = true
            }

            this.freezydump.forEach(o => {
                this.removeById(o.id)
                this.canvas.insertAt(o, o.id)
            })

            this.freezydump = []

            if (needRestore) {
                this.restoreEvents([])
            }
        },
        swap(active, fn, params)
        {
            return new Promise(resolve => {
                let obj = active.toObject(['id']),
                    flat = { ...obj, scaleX: 1, scaleY: 1, angle: 0 },
                    cvs,
                    ctx

                this.fabric.Image.fromObject(flat, img => {
                    cvs = img.toCanvasElement()
                    ctx = cvs.getContext('2d')

                    let data = fn(ctx, params)

                    ctx.clearRect(0, 0, cvs.width, cvs.height)
                    ctx.putImageData(data, 0, 0)

                    obj.src = cvs.toDataURL()

                    this.fabric.Image.fromObject(obj, img => {
                        this.removeById(active.id)
                        this.canvas.insertAt(img, active.id)
                        resolve()
                    })
                })
            })
        },
        make(fn, params, objects, apply = false)
        {
            if (this.makeActions.length) return Promise.resolve()

            objects || (objects = this.getActives())

            this.makeActions.push(Promise.resolve())

            let needRestore = false

            if (!this.lockEventsSet) {
                this.leaveEvents([])
                needRestore = true
            }

            try {

                objects.forEach(active => {
                    if (!/widget|promo/.test(active.type)) {
                        this.makeActions.push(this.swap(active, fn, params))
                    }
                })

            } catch (e) {
            }

            return Promise.all(this.makeActions)
                .catch(e => { this.snack(e.message, 'error') })
                .finally(() => {
                    this.makeActions = []

                    if (needRestore) {
                        this.restoreEvents([])
                    }
                    if (apply) {
                        this.canvas.trigger('programmatic')
                    }
                })
        },
        colorCorrection(options, objects)
        {
            return this.make(doCorrections, options, objects)
        },
        autoAdjust(objects)
        {
            return this.make(getAdjustData, {}, objects, true)
        },
        decreaseColor(options, objects)
        {
            return this.make(getDecreaseData, options, objects)
        },
        colorToAlpha(options, objects)
        {
            return this.make(colorToAlpha, options, objects)
        },
        colorZoom(options, objects)
        {
            return this.make(colorZoom, options, objects)
        },
        colorReplace(options, objects)
        {
            return this.make(replaceColor, options, objects)
        },
        rotate()
        {
            this.setRotate(45).canvas.trigger('programmatic')
        },
        vFlip()
        {
            this.toggleMirror('flipY').canvas.trigger('programmatic')
        },
        hFlip()
        {
            this.toggleMirror('flipX').canvas.trigger('programmatic')
        },
        toSvg()
        {
            return this.canvas ? this.canvas.toSVG() : null
        },
        suppressWidgetsAndDynamic(obj)
        {
            obj || (obj = this.canvas.getActiveObject())

            if (!obj || /widget|dynamic-background/.test(obj.type)) return false
            if (!obj._objects) return obj

            const exclude = widgets.concat(['dynamic-background']),
                fn = o => !exclude.includes(o.type),
                objects = obj._objects.filter(fn)

            this.canvas.discardActiveObject()
            this.setSelection(objects)
            this.selectedObjects()

            return this.canvas.getActiveObject()
        },
        setRotate(deg)
        {
            if (!this.canvas) return this

            if (!this.active.length) {
                this.selectAll(null, widgets.concat('dynamic-background'))
            }

            const obj = this.suppressWidgetsAndDynamic()

            if (!obj) return this

            obj.rotate(obj.angle + deg)
            this.canvas.requestRenderAll()

            return this
        },
        toggleMirror(flip = 'flipX')
        {
            if (!this.canvas) return this

            if (!this.active.length) {
                this.selectAll(null, widgets.concat(['dynamic-background']))
            }

            const obj = this.suppressWidgetsAndDynamic()

            if (!obj) return this

            obj.toggle(flip)
            this.canvas.requestRenderAll()

            return this
        },
        decreaseLayer(obj)
        {
            if (!this.canvas) return this

            obj || (obj = this.canvas.getActiveObject())

            if (obj) {
                obj.sendBackwards()
            }

            this.canvas.requestRenderAll()

            return this
        },
        increaseLayer(obj)
        {
            if (!this.canvas) return this

            obj || (obj = this.canvas.getActiveObject())

            if (obj) {
                obj.bringForward()
            }

            this.canvas.requestRenderAll()

            return this
        },
        removeAllObjects()
        {
            if (!this.canvas) return this

            this.canvas.remove(...this.canvas._objects)
            this.canvas.clear()

            return this
        },
        clear()
        {
            if (!this.object) return false

            const { width: cw, height: ch } = this.canvas,
                { width: ow, height: oh } = this.object,

                zoom = this.canvas.getZoom(),
                dx = Math.hypot(cw, ch)

            if (Math.hypot(ow, oh) < .01 * dx / zoom) {
                this.canvas.remove(this.object)
                return true
            }

            return false
        },
        contextOnHover({ icon: action })
        {
            if (action === 'print') {
                this.printer.prepare(this)
            }
        },
        async contextOnChange({ icon: action })
        {
            try {

                switch (action) {
                    case 'new':
                        this.$bus.$emit('open:new-dialog')
                        break
                    case 'open':
                        await this.openFile()
                        break
                    case 'link':
                        this.openurl = true
                        break
                    case 'webcam':
                        await this.videoOpen()
                        break
                    case 'calc':
                        this.toolInset('helper-flipper')
                        break
                    case 'pixabay':
                        this.$bus.$emit('open:search-dialog')
                        break
                    case 'quick_save':
                        await this.saveAsUBJson()
                        break
                    case 'save':
                        this.save({})
                        break
                    case 'fit_window':
                        await this.fitToWindow(this.origin)
                        break
                    case 'layers':
                        this.toolInset('graph-popup-manager')
                        break
                    case 'info':
                        this.toolInset('graph-popup-info')
                        break
                    case 'print':
                        this.printer.print(this)
                        break
                }

            } catch (e) {
                this.snack({ content: e.message, raw: true })
            }
        },
        installableProfileList(data)
        {
            const profiles = data.objects.filter(o => o.type === 'widget-profile')
                .map(o => mapping(kebabToCamel(o)))
                .filter(Boolean)

            const list = this.coverQuery === '/cover/install'
                ? profiles.filter(p => /user/.test(p))
                : []

            return { profiles, list }
        },
        detectUserProfiles(data)
        {
            const { profiles, list } = this.installableProfileList(data)

            return list.length
                ? this.$store.dispatch('app/getUsers', {
                    user_ids: list.reduce((acc, p) => `${acc}${p.replace(/user:(\d+)$/, '$1')},`, '').slice(0, -1)
                })
                    .then(users => ({ users, uids: users.map(u => u.id) }))
                    .then(({ users, uids }) => ({ users, profiles: [
                        ...list.filter(p => uids.includes(+p.replace(/user:/, ''))),
                        ...profiles.filter(p => !/user/.test(p))
                    ]}))
                    .then(({ users, profiles }) => ({
                        count: profiles.length,
                        profiles,
                        data: {
                            ...data,
                            objects: data.objects.filter(o => {
                                if (o.type === 'widget-profile' && /user/.test(o.profile)) {
                                    o.user = o.userId ? users.find(u => u.id === o.userId) : null
                                    return !!o.user
                                }

                                return true
                            })
                        }
                    }))
                : Promise.resolve({
                    count: profiles.length,
                    profiles,
                    data
                })
        },
        prepare(json, blob)
        {
            return new Promise(((resolve, reject) => {
                let timetrack = ['widget-countdown','widget-rss','widget-feed','widget-time'],
                    raw = json.objects.filter(o => o.type.startsWith('widget')),
                    state = { blob, json, widgets: raw.map(o => o.type) },
                    _json,
                    rss,
                    wc,
                    wt

                if (!['/cover/install','/template/save'].includes(this.coverQuery)) {
                    return reject(new Error('Internal error'))
                }
                if (this.coverQuery === '/cover/install') {
                    state.weather = raw.find(o => o.type === 'widget-weather')?.city

                    if ((rss = raw.find(o => o.type === 'widget-rss'))?.channel) {
                        state.rss = { channel: rss.channel, item: rss.item || 'random' /* last */ }
                    }
                    if ((wc = raw.find(o => o.type === 'widget-currency'))) {
                        state.currency = { curr: wc.curr, rate: wc.rate, short: wc.short }
                    }
                    if ((wt = raw.find(o => o.type === 'widget-traffic'))) {
                        state.traffic = { code: wt.code.geoid, city: wt.code.title }
                    }
                    if ((_json = raw.find(o => o.type === 'widget-json'))) {
                        state._json = { sid: _json.sid, text: '' }
                    }
                    if ((raw.find(o => o.type === 'widget-info'))) {
                        state.info = true
                    }

                    state.time = !!json.objects.find(o => timetrack.includes(o.type))
                    state.name = this.$store.state.cover.name || Date.now()
                    state.conn = this.$store.state.cover.connections || []
                    state.hash = this.hash || mongoId()
                } else {
                    state.hash = this.tmpl
                }

                resolve(state)
            }))
        },
        createRequest({ blob, json, conn, widgets, _json, ...options })
        {
            let type, fd

            return this.detectUserProfiles(json)
                .then(({ data, profiles, count }) => {
                    type = 'application/octet-stream'

                    if (_json) options.json = _json

                    fd = new FormData()
                    fd.append('template', blob)
                    fd.append('struct', new Blob([encode({ ...data, ...this.scaled })], { type }))
                    fd.append('json',  JSON.stringify({ ...data, ...this.scaled }))
                    fd.append('state', JSON.stringify({
                        widgets: widgets.filter(w => !!(w !== 'widget-profile' || 0 < count--)),
                        connections: conn,
                        background: true,
                        ...options,
                        profiles
                    }))

                    return fd
                })
        },
        startProcess(query)
        {
            this.coverQuery = query

            queueMicrotask(() => { try {
                this.canvas.cloneWithoutData(blank => {
                    blank.setDimensions(this.origin).setZoom(1)

                    const resolver = this.$BROWSER.IS_SAFARI ? distort : () => Promise.resolve(),
                        json = this.extractData(o => o.type !== 'dynamic-background')

                    blank.loadFromJSON(json, () => {
                        blank.adjustObjects()

                        resolver(blank)
                            .then(() => blank.toCanvasElement())
                            .then(toBlob)

                            .then(blob => this.prepare(json, blob))
                            .then(this.createRequest)
                            .then(this.makeRequest)
                            .then(this.responseHandler)
                            .catch(this.errorHandler)
                    })
                })
            } catch (e) {
                this.errorHandler(e)
            }})
        },
        makeRequest(fd)
        {
            return this.$axios.post(this.coverQuery, fd)
        },
        extractData(cb = () => true)
        {
            const data = this.canvas.toDatalessJSON()

            data.objects = data.objects.filter(cb)

            return data
        },
        isStorageAccessPermitted()
        {
            if (!this.$store.state.app.user) {
                this.snack('common.needed', 'error')
                return false
            }
            if (!this.cover) {
                this.snack('graph.vk_only', 'error')
                return false
            }

            return true
        },
        templateSave()
        {
            if (this.isStorageAccessPermitted()) {
                this.startProcess('/template/save')
            }
        },
        coverInstall()
        {
            if (this.isStorageAccessPermitted()) {
                this.startProcess('/cover/install')
            }
        },
        responseHandler({ status, data: { install, save, error } })
        {
            const action = this.coverQuery === '/cover/install' ? 'installed' : 'saved'

            switch (true) {
                case status !== 200:
                    return this.snack('common.network_error', 'error')

                case !install && !save:
                    return this.snack({
                        content: error || 'Internall error',
                        color: 'error',
                        raw: true
                    })
            }

            this.snack(`common.${action}`, 'success')
        },
        errorHandler({ message: content })
        {
            this.snack({ content, color: 'error', raw: true })
        },
        calcVideoSize()
        {
            const rel = { 1920: 1080, 1280: 720, 800: 600, 640: 480, 320: 240 },
                sizes = Object.keys(rel).map(Number).reverse(),
                ratio = v => v / (v <= 800 ? 4 / 3 : 16 / 9),
                width = this.$screen.width,

                w = sizes.find(w => w <= width),
                h = Math.min(ratio(w), rel[w])

            return {
                height: rclamp(h, 480, 600),
                width: rclamp(w, 640, 800)
            }
        },
        videoOpen()
        {
            if (this.mobile) {
                return openFile('image/*', false, true).then(this.load.bind(this))
            }

            const { width, height } = this.calcVideoSize(),
                constraints = { video: { facingMode: 'user', height, width }, audio: false }

            // Promise.all(this.$state.models)
            return Promise.resolve().then(() => {
                navigator.mediaDevices.getUserMedia(constraints)
                    .then(this.videoSuccess.bind(this, { width, height }))
                    .catch(this.videoError)
            })
        },
        videoSuccess({ width, height }, stream)
        {
            this.videostream = stream
            this.video = true
        },
        videoError(error)
        {
            this.$bus.$emit('snack', {
                content: 'Cold not load User Media data: ' + error.toString(),
                color: 'error',
                raw: true
            })
        },
        resolver(options)
        {
            return this.canvas ? Promise.resolve() : this.setCanvas(options)
        },
        async openSvg(file)
        {
            let open = false, url = URL.createObjectURL(file)

            try {

                open = await this.loadSvg(url, true)

                URL.revokeObjectURL(url)

                return true

            } catch (e) {
            }

            return open
        },
        loadSvg(src, scale = false)
        {
            return new Promise(resolve => {
                this.fabric.loadSVGFromURL(src, (objects, options) => {
                    if (!objects) return resolve(false)

                    let height, width, svg = new this.fabric.SvgShape(objects, options)

                    if (scale) {
                        ({ height, width } = upscale(svg, this.canvas))

                    } else {
                        height = rclamp(svg.height, 300, Infinity)
                        width  = rclamp(svg.width, 300, Infinity)
                    }

                    this.resolver({ width, height })
                        .then(() => this.canvas.insertTo(svg))
                        .then(resolve)
                })
            })
        },
        loadImage(src, onerror, adjust = false)
        {
            if (typeof onerror !== 'function') {
                onerror = () => {}
            }

            return new Promise(resolve => {
                const img = new Image()

                img.crossOrigin = 'anonymous'
                img.onerror = onerror

                img.onload = () => {
                    this.resolver(img)
                        .then(() => this.createImage({ src }, adjust))
                        .then(resolve)
                }

                img.src = src
            })
        },
        loadFrame(url, onerror)
        {
            if (typeof onerror !== 'function') {
                onerror = () => {}
            }

            return new Promise(resolve => {
                this.fabric.Frame.fromURL(url, img => img
                    ? this.resolver(img).then(() => this.canvas.insertTo(img)).then(resolve)
                    : resolve()
                )
            })
        },
        openFile()
        {
            return openFile('image/*').then(this.load.bind(this))
        },
        openJson()
        {
            this.openUBJson()
        },
        openUBJson()
        {
            const onerror = () => this.snack('graph.parsing_error', 'error')

            openFile('application/octet-stream').then(file => {
                const r = new FileReader()

                r.onerror = onerror
                r.onload = () => { try {
                    this.startEdit(
                        file.type === 'application/json'
                            ? JSON.parse(r.result.toString())
                            : decode(/** @type {ArrayBuffer} */ r.result)
                    )

                } catch (e) {
                    onerror()
                } }

                file.type === 'application/json'
                    ? r.readAsText(file)
                    : r.readAsArrayBuffer(file)

            }).catch(onerror)
        },
        coverDetect()
        {
            this.cover = this.fabric.util.coverDetect(this.origin)
        },
        flash()
        {
            const cover = this.$refs.cover.$el

            cover.classList.add('flash')

            setTimeout(() => {
                cover.classList.remove('flash')
            }, 2000)
        },
        async insertWidget(wid /* wid = 1 2 3 4 5 6 7 8 9 10 */)
        {
            let w, raw = false, msg = 'graph.vk_only'

            try {

                if (this.canvas && this.cover) {
                    w = widgets[--wid]

                    if (typeof w !== 'undefined') {
                        this.canvas.insertTo(await Widgets.get(w))
                    }

                    return
                }

            } catch (e) {
                msg = e.message
                raw = true
            }

            this.snack({ content: msg, raw })
        },
        popupRemBg(img)
        {
            img.removeBg()

            this.rembgsource = img
            this.rembg = true
        },
        popupWidget({ custom: { unique } })
        {
            this.$store.commit('canvas/set', { widget: unique })

            this.toolInset('graph-popup-widget')
        },
        popupCurved({ custom: { unique } })
        {
            this.$store.commit('canvas/set', { ctext: unique })

            this.toolInset('graph-popup-curved-settings')
        },
        popupText({ custom: { unique } })
        {
            this.$store.commit('canvas/set', { text: unique })

            this.toolInset('graph-popup-text', true)
            this.toolInset('graph-popup-text-settings')
        },
        popupShape({ custom: { unique } })
        {
            this.$store.commit('canvas/set', { shape: unique })

            this.toolInset('graph-popup-draw', true)
            this.toolInset('graph-popup-draw-settings')
        },
        popupQRCode({ custom: { unique } })
        {
            this.$store.commit('canvas/set', { qrcode: unique })

            this.toolInset('graph-popup-qrcode-settings')
        },
        popupMerge({ custom: { unique } })
        {
            this.$store.commit('canvas/set', { merge: unique })

            this.toolInset('graph-popup-merge-settings')
        },
        async composite(frame)
        {
            let images = this.canvas._objects.filter(o => o.type === 'image'),
                self = this

            if (!images.length) {
                return this.snack('graph.missing_images', 'warning')
            }

            try {

                this.canvas.selection = false

                this.trackerEventsOff([], false)
                await this.disableTools()
                frame.cornersOff()
                this.setActive(frame)

                async function restore() {
                    self.canvas.off({ 'mouse:down': mousedown })
                    self.trackerEventsOn([], false)
                    self.canvas.selection = true
                    await self.enableTools()
                    frame.cornersOn()
                }

                async function apply(target, toggle = false) {
                    if (target) {
                        frame.imageInsert(target).then(restore)
                    } else if (toggle) {
                        await restore()
                    }
                }

                async function mousedown({ target, e }) {
                    self.restoreActiveObjects()

                    if (!target) return

                    try {

                        let corner
                        switch (target.type) {
                            case 'frame':
                                if ((corner = self.findCorner({ target, e }))) {
                                    await apply(null, corner === 'tr')
                                }
                                break
                            case 'image':
                                await apply(target)
                                break
                        }

                    } catch (e) {
                        this.snack({ content: e.message, raw: true })
                    }
                }

                this.canvas.on({ 'mouse:down': mousedown })

            } catch (e) {
                this.snack({ content: e.message, raw: true })
            }
        },
        colorize({ custom: { unique } })
        {
            this.$store.commit('canvas/set', { path: unique })

            this.toolInset('graph-popup-path-color')
        },
        async add({ src, adjust = false })
        {
            let widget, frame, shape

            switch (true) {
                case !!(widget = src.match(/widget(\d+)/)):
                    await this.insertWidget(parseInt(widget[1]))
                    break

                case !!(frame = src.match(/frame(\d+)/)):
                    await this.loadFrame(frame.input)
                    break

                case !!(shape = src.match(/shape(\d+)/)):
                    await this.loadSvg(shape.input)
                    break

                default:
                    await this.imgResolver({
                        adjust,
                        src
                    })
            }
        },
        _adjustOptions(options)
        {
            options.originX || (options.originX = 'left')
            options.originY || (options.originY = 'top')

            options.left || (options.left = 0)
            options.top  || (options.top = 0)
        },
        _adjustSizes(img, options)
        {
            let { width, height } = this.origin,

                scaleY = height / img.height,
                scaleX = width / img.width

            options.originX = 'center'
            options.originY = 'center'

            switch (true) {
                case scaleY > scaleX:
                    scaleX = +scaleY
                    break
                case scaleY < scaleX:
                    scaleY = +scaleX
                    break
            }

            options.left = width / 2
            options.top = height / 2

            options.scaleX = scaleX
            options.scaleY = scaleY
        },
        _fromImage(options, adjust, callback)
        {
            this._adjustOptions(options)

            const img = new this.fabric.Image(options.img, options)

            delete options.img

            if ('src' in options) {
                delete options.src
            }
            if (adjust) {
                this._adjustSizes(img, options)
                img.set(options)
            }

            this.canvas.insertTo(img)

            callback && callback(img)
        },
        _fromSrc(options, adjust, callback)
        {
            this._adjustOptions(options)

            this.fabric.Image.fromURL(options.src, img => {
                delete options.src

                if ('img' in options) {
                    delete options.img
                }
                if (adjust) {
                    this._adjustSizes(img, options)
                    img.set(options)
                }

                this.canvas.insertTo(img)

                callback && callback(img)

            }, { crossOrigin: 'anonymous', ...options })
        },
        createImage(options, adjust, callback)
        {
            switch (true) {
                case 'img' in options:
                    this._fromImage(options, adjust, callback)
                    break
                case 'src' in options:
                    this._fromSrc(options, adjust, callback)
                    break
            }

            return this
        }
    }
}
