import { debounce } from '../../utils/common/debounce.mjs'
import { running } from '../../utils/callbacks.mjs'

let shift = { keyCode: 16, diff: null },
    { hypot, floor, round } = Math,

    zoomMin = .25,
    zoomMax = 2,

    fabric

export const sub = (base, point) => new fabric.Point(0, 0).add(base).subtract(point)
export const add = (base, point) => new fabric.Point(0, 0).add(base).add(point)
export const middle = o => new fabric.Point(o.width / 2, o.height / 2)
export const to2decimal = n => round(n * 100) / 100

Array.prototype.bypass = function(exclude, callback, key = 'event') {
    (exclude.length ? this.filter(i => exclude.includes(i[key])) : this)
        .forEach(item => callback(item))
}

export function onCanvas({ target: { tagName, classList } })
{
    return tagName === 'CANVAS' ? classList.contains('upper-canvas') : false
}

export function calc({ height, width, scale })
{
    return { height: height / scale, width: width / scale }
}

export function zoom({ height, width }, scale)
{
    return { height: height * scale, width: width * scale, scale }
}

export function less100(origin, client, reduce = 0)
{
    const scale = fabric.util.findScaleToFit(origin, client)

    return zoom(origin, to2decimal(scale - reduce))
}

export function centered(client, scaled)
{
    return sub(middle(client), middle(scaled))
}

export default {
    data() {
        return {
            drawerOptions: this.$store.state.canvas.drawerOptions,

            emap: [
                { event: 'selection:cleared',   handler: this.cleared              },
                { event: 'object:selected',     handler: this.selected             },
                { event: 'mouse:over',          handler: this.mouseOver            },
                { event: 'mouse:down',          handler: this.mouseDown            },
                { event: 'mouse:move',          handler: this.mouseMove            },
                { event: 'mouse:out',           handler: this.mouseOut             },
                { event: 'mouse:up',            handler: this.mouseUp              },
                { event: 'restore:events',      handler: this.restoreEvents        },
                { event: 'stack:changed',       handler: this.restoreActiveObjects },
                { event: 'leave:events',        handler: this.leaveEvents          },
                { event: 'image:remove-bg',     handler: this.popupRemBg           },
                { event: 'widget:settings',     handler: this.popupWidget          },
                { event: 'curved:settings',     handler: this.popupCurved          },
                { event: 'drawingtool:history', handler: this.stateTools           },
                { event: 'frame:composite',     handler: this.composite            },
                { event: 'shape:settings',      handler: this.popupShape           },
                { event: 'ctext:settings',      handler: this.popupText            },
                { event: 'merge:settings',      handler: this.popupMerge           },
                { event: 'qrcode:settings',     handler: this.popupQRCode          },
                { event: 'path:colorize',       handler: this.colorize             },
                { event: 'canvas:distort',      handler: this.distort              },
                { event: 'canvas:snack',        handler: this.snack                },
                { event: 'canvas:flash',        handler: this.flash                }
            ],

            onCanvas: false,
            freedraw: false,
            isDown: false,
            corner: false,
            cursorMode: 1,
            object: null,
            global: null,
            active: [],
            offmap: []
        }
    },
    computed: {
        client: {
            set(client) {
                this.$store.commit('canvas/set', { client })
            },
            get() {
                return this.$store.state.canvas.client
            }
        },
        origin: {
            set(origin) {
                this.$store.commit('canvas/set', { origin })
            },
            get() {
                return this.$store.state.canvas.origin
            }
        },
        scaled: {
            set(scaled) {
                this.$store.commit('canvas/set', { scaled })
            },
            get() {
                return this.$store.state.canvas.scaled
            }
        },
        track: {
            set(track) {
                this.$store.commit('canvas/set', { track })
            },
            get() {
                return this.$store.state.canvas.track
            }
        },
        diagonal: {
            set(diagonal) {
                this.$store.commit('canvas/set', { diagonal })
            },
            get() {
                return this.$store.state.canvas.diagonal
            }
        },
        shiftKey: {
            set(shiftKey) {
                this.$store.commit('canvas/set', { shiftKey })
            },
            get() {
                return this.$store.state.canvas.shiftKey
            }
        },
        point: {
            set(point) {
                this.$store.commit('canvas/set', { point })
            },
            get() {
                return this.$store.state.canvas.point
            }
        },
        isDraw() {
            return this.freedraw && this.cursorMode === 0
        },
        isFree() {
            return !(this.isDown || this.active.length)
        }
    },
    methods: {
        set(payload)
        {
            this.$store.commit('canvas/set', payload)
        },
        async setClient()
        {
            await this.$nextTick()

            const height = window.innerHeight,
                width = window.innerWidth,
                client = {},
                dx = .95,
                dy = .91,

                h = client.height = floor(height * dy),
                w = client.width = floor(width * dx)

            client.left = floor((width - w) / 2)
            client.top = floor((height - h) / 2)

            this.diagonal = hypot(w, h)
            this.client = client
        },
        correction(point)
        {
            point.x += 20 // left ruler correction
            point.y += 15 // top ruler correction
        },
        async fitToWindow(origin)
        {
            await this.$nextTick()

            try {

                const scaled = less100(origin, this.client, .1),
                    track = centered(this.client, scaled)

                this.correction(track)
                this.set({ scaled, track })

            } catch (e) {
            }
        },
        async fitToOrigin(origin)
        {
            await this.$nextTick()

            try {

                const track = centered(this.client, origin),
                    scaled = zoom(origin, 1)

                this.correction(track)
                this.set({ scaled, track })

            } catch (e) {
            }
        },
        zoom(v)
        {
            const scaled = zoom(this.origin, this.scaled.scale + v)

            if ((v > 0 && this.increase(scaled)) || (v < 0 && this.decrease(scaled))) {
                const p = centered(this.client, scaled)

                this.correction(p)

                this.track = this.track.lerp(p, .1)
                this.scaled = scaled
            }
        },
        setOrigin(width, height)
        {
            const origin = { width, height }

            return this.setClient()
                .then(() => this.fitToWindow(origin))
                .then(() => this.set({ origin }))
        },
        setScaled(width, height, scale)
        {
            const scaled = { width, height, scale },
                origin = calc(scaled)

            return this.setClient()
                .then(() => this.fitToWindow(origin))
                .then(() => this.set({ origin }))
        },
        async createContext({ width, height, scale })
        {
            await (typeof scale === 'number' ? this.setScaled(width, height, scale) : this.setOrigin(width, height))
        },
        keyDownTrack({ which, code })
        {
            if (!which && !code) return

            if (which === shift.keyCode || code.startsWith('Shift')) {
                this.shiftKey = true

                if (!this.isDraw) {
                    this.canvas.defaultCursor = 'move'
                    this.canvas.selection = false
                }
            }
        },
        keyUpTrack({ repeat })
        {
            if (repeat || !this.canvas) return

            this.canvas.selection = !this.freedraw
            this.canvas.defaultCursor = this.freedraw ? 'crosshair' : 'default'
            this.shiftKey = false
        },
        preInsert()
        {
            this.canvas.hoverCursor = this.canvas.defaultCursor = 'crosshair'

            this.leaveEvents()

            switch (this.drawer.type) {
                case 'polyline':
                case 'triangle':
                case 'ellipse':
                case 'rect':
                case 'line':
                    this.drawerOptions = this.$store.state.canvas.drawerOptions
                    break
                case 'c-text':
                    this.drawerOptions = this.$store.state.canvas.textOptions
                    break

                /* case 'image':
                    break */
            }
        },
        postInsert(object)
        {
            object || (object = this.object)

            switch (object.type) {
                case 'c-text':
                    object.on('editing:entered', this.bindings.untrack)
                    object.on('editing:exited', this.bindings.track)
                    break
                case 'polyline':
                case 'triangle':
                case 'ellipse':
                case 'rect':
                case 'line':
                    break

                /* case 'image':
                    break */
            }
        },
        async mouseDown(options)
        {
            const { x, y } = this.canvas.getPointer(options.e)

            this.isDown = !this.cursorMode

            switch (true) {
                case this.isDraw && this.isDown:
                    this.preInsert()
                    this.object = await this.drawer.make({ x, y }, this.drawerOptions)
                    this.canvas.add(this.object)
                    this.canvas.renderAll()
                    this.postInsert()
                    break

                case this.shiftKey:
                    shift.diff = this.track.subtract(fabric.util.getPointer(options.e))

                    if (options.target) {
                        this.corner = this.findCorner(options)

                        if (!this.corner) {
                            options.target.lockMovementX = true
                            options.target.lockMovementY = true
                        }
                    }
            }
        },
        async mouseMove({ e })
        {
            try {

                const { x, y } = this.point = this.canvas.getPointer(e)

                switch (true) {
                    case this.isDraw && this.isDown:
                        this.canvas.hoverCursor = this.canvas.defaultCursor = 'crosshair'
                        await this.drawer.resize(this.object, { x, y }, this.shiftKey)
                        this.canvas.renderAll()
                        break

                    case !this.corner && !!shift.diff:
                        this.set({ track: add(fabric.util.getPointer(e), shift.diff) })
                        break
                }

            } catch (e) {
            }
        },
        async mouseUp(options)
        {
            this.isDown = this.corner = false

            shift.diff = null

            if (options.target) {
                options.target.lockMovementX = false
                options.target.lockMovementY = false
            }
            if (this.leaveEventsSet) {
                this.restoreEvents()
            }

            switch (this.cursorMode)
            {
                case 0: // Draw
                    if (this.isDraw && !this.clear()) {
                        await this.stack('update')
                    }
                    break
                case 1: // Select
                    break
            }

            this.selectedObjects()

            this.object = null
        },
        mouseOver({ target })
        {
            this.cursorMode = Number(!!target && !this.isDown)  // variative

            if (!target) return

            target.onHover = true

            if (this.isFree || target.type === 'curved-controls') {
                this.canvas.hoverCursor = this.canvas.defaultCursor = 'move'
                this.setActive(target)
            }
        },
        mouseOut({ target })
        {
            (target || {}).onHover = false

            this.canvas.defaultCursor = 'default'

            if (!this.active.length) {
                this.discardActive()
            }
        },
        selected()
        {
            this.isDraw || (this.cursorMode = 1) // select if not draw
        },
        cleared()
        {
            this.cursorMode = Number(!this.freedraw) // variative
        },
        increase({ width, height, scale })
        {
            return scale > 1.5 ? hypot(height, width) < this.diagonal * zoomMax : true
        },
        decrease({ width, height, scale })
        {
            return scale < .5 ? hypot(height, width) > this.diagonal * zoomMin : true
        },
        wheelTrack(e)
        {
            if (!this.origin || !this.scaled) return

            if (/upper-canvas|editzone|ruler|track/.test(e.target.className)) {
                const dy = e.deltaY || e.wheelDelta,
                    scale = this.scaled.scale + (dy > 0 ? +.01 : -.01),
                    scaled = zoom(this.origin, scale)

                if ((dy > 0 && this.increase(scaled)) || (dy < 0 && this.decrease(scaled))) {
                    this.track = this.track.lerp(sub(fabric.util.getPointer(e), middle(scaled)), .05)
                    this.scaled = scaled
                }

                e.preventDefault()
            }
        },
        findCorner({ target = false, e })
        {
            return target && target._findTargetCorner(this.canvas.getPointer(e, true))
        },
        moveTrack(e)
        {
            try {

                this.global = fabric.util.getPointer(e)
                this.onCanvas = onCanvas(e)

            } catch (e) {
            }
        },
        bindMoveTracker()
        {
            const opt = this.$BROWSER.PASSIVE_SUPPORTED ? { passive: true } : false

            document.addEventListener('mousemove', this.moveTrack, opt)
        },
        unbindMoveTracker()
        {
            const opt = this.$BROWSER.PASSIVE_SUPPORTED ? { passive: true } : false

            document.removeEventListener('mousemove', this.moveTrack, opt)
        },
        initializeShortCutEvents()
        {
            const copy = this.copier.copy.bind(this.copier),
                cut = this.copier.cut.bind(this.copier)

            this.offmap = this.bindings.bind([
                { keys: 'shift+f', handler: this.autoAdjust },
                { keys: 'Delete',  handler: this.deleteSelected },
                { keys: 'ctrl+a',  handler: this.selectAll },
                { keys: 'ctrl+z',  handler: this.undo },
                { keys: 'ctrl+y',  handler: this.redo },
                { keys: 'ctrl+c',  handler: copy },
                { keys: 'ctrl+x',  handler: cut  }
            ])

            this.bindings.track()
        },
        distort: debounce(function({ reload = false, resolve } = {})
        {
            if (typeof resolve !== 'function') resolve = () => {}

            if (!this.origin || !this.scaled || this.leaveEventsSet) return resolve()

            let { origin: o, scaled: { scale } } = this,
                perform = fn => running(fn),
                step = reload ? .03 : .01,
                max = scale + step,
                min = scale - step,
                mid = scale,

                increase = v => () => (this.scaled = zoom(o, this.scaled.scale + step)).scale >= v,
                decrease = v => () => (this.scaled = zoom(o, this.scaled.scale - step)).scale <= v,
                shudder = () => { this.canvas.trigger('canvas:shaken') },
                request = () => { this.canvas.requestRenderAll() },
                renewal = this.canvasFinalize.bind(this)

            Promise.resolve()
                .then(() => perform(increase(max)))
                .then(() => reload ? perform(decrease(min)) : perform(decrease(mid)))
                .then(() => reload ? perform(increase(mid)) : Promise.resolve())
                .then(renewal)//.then(this.$nextTick)
                .then(shudder)//.then(this.$nextTick)
                .then(request)
                .then(resolve)

        }, 7),
        keyEventsOff()
        {
            const opt = this.$BROWSER.PASSIVE_SUPPORTED ? { passive: false } : true

            document.removeEventListener('keydown', this.keyDownTrack, opt)
            document.removeEventListener('keyup', this.keyUpTrack, opt)
            document.removeEventListener('wheel', this.wheelTrack, opt)
        },
        keyEventsOn()
        {
            const opt = this.$BROWSER.PASSIVE_SUPPORTED ? { passive: false } : true

            document.addEventListener('keydown', this.keyDownTrack, opt)
            document.addEventListener('keyup', this.keyUpTrack, opt)
            document.addEventListener('wheel', this.wheelTrack, opt)
        },
        switcher(action, events = [])
        {
            this.emap.bypass(events, ({ event, handler }) => {
                this.canvas[action](event, handler)
            })
        },
        trackerEventsOff(events, keys = true)
        {
            keys && this.keyEventsOff()

            if (this.canvas) {
                this.switcher('off', events)
            }
        },
        trackerEventsOn(events, keys = true)
        {
            keys && this.keyEventsOn()

            if (this.canvas) {
                this.switcher('on', events)
            }
        },
        passFabricInstanceToTrack(instance)
        {
            fabric = instance
        }
    }
}
