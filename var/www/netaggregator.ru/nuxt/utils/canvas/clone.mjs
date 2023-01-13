// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    const { createCanvas } = await import('../common/canvas.mjs'),
        { createImage } = await import('../common/image.mjs')

    function clear(context)
    {
        ['process','pattern','origin','clone','blank','start','dump','src','id']
            .forEach(p => { context[p] = null })
    }

    function clone({ canvas, src, dump })
    {
        const c = document.createElement('canvas'),
            dst = c.getContext('2d'),
            z = canvas.getZoom(),

            { height: dH, width: dW, left: dL, top: dT } = dump,
            { height: cH, width: cW } = canvas

        return new Promise(resolve => {
            c.height = Math.floor(cH / z)
            c.width = Math.floor(cW / z)

            dst.drawImage(src, 0, 0, dW, dH, dL, dT, dW, dH)

            resolve(dst)
        })
    }

    // noinspection DuplicatedCode
    const Clone = fabric.util.createClass(fabric.BaseBrush, {
        type: 'CloneBrush',

        process: false,
        context: null,
        pattern: null,

        origin: null,

        clone: null,
        blank: null,
        start: null,

        dump: null,
        src: null,
        id: null,

        initialize(canvas)
        {
            canvas.on('before:render', () => this.blank && this._restoreTopContext())

            this.canvas = canvas
            this._points = []
        },

        onMouseDown(pointer, { e })
        {
            if (e.shiftKey || !this.canvas._isMainEvent(e)) return

            if (e.ctrlKey) {
                return this._addStartPoint(pointer)
            }
            if (!this._prepareForDrawing(pointer)) {
                return this.context.$bus.$emit('snack', {
                    content: 'Выберете опорную точку',
                    color: 'warning'
                })
            }

            this._captureDrawingPath(pointer)
            this._render()
        },

        onMouseMove(pointer, options)
        {
            if (!this.canvas._isMainEvent(options.e)) return

            if (this._captureDrawingPath(pointer)) {
                this._restoreTopContext()
                this._render()
            }
        },

        onMouseUp(options)
        {
            if (this.process && this.canvas._isMainEvent(options.e)) {
                this.process = false
                this.toBlank()
            }
        },

        _shift(point)
        {
            const canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),

                p = point.subtract(this.start),
                clone = this.clone.canvas

            canvas.height = clone.height
            canvas.width = clone.width

            ctx.drawImage(clone, p.x, p.y)

            return canvas
        },

        _setPattern(point, ctx)
        {
            ctx || (ctx = this.canvas.contextTop)

            this.pattern = ctx.createPattern(this._shift(point), 'no-repeat')
        },

        _setBrushStyles(ctx)
        {
            ctx || (ctx = this.canvas.contextTop)

            ctx.strokeStyle = this.pattern
            ctx.miterLimit = this.strokeMiterLimit
            ctx.lineJoin = this.strokeLineJoin
            ctx.lineCap = this.strokeLineCap
            ctx.lineWidth = this.width
        },

        _prepareForDrawing({ x, y })
        {
            if (!this.start) return false

            const p = new fabric.Point(x, y)

            this._points = []

            this._setPattern(p)
            this._addPoint(p)

            this.canvas.contextTop.moveTo(x, y)
            this.process = true

            return true
        },

        _addStartPoint({ x, y })
        {
            if (this.origin.containsPoint({ x, y }, null, true)) {
                this.start = new fabric.Point(x, y)
            }
        },

        _addPoint(point)
        {
            const p = this._points

            if (p.length > 1 && point.eq(p[p.length - 1])) {
                return false
            }

            this._points.push(point)

            return true
        },

        /**
         * @param {Object} pointer Actual mouse position related to the canvas.
         */
        _captureDrawingPath(pointer)
        {
            if (this.process) {
                return this._addPoint(new fabric.Point(pointer.x, pointer.y))
            }

            return false
        },

        _drawSegment(ctx, p1, p2)
        {
            const p = p1.midPointFrom(p2)

            ctx.quadraticCurveTo(p1.x, p1.y, p.x, p.y)

            return p
        },

        /**
         * Draw a smooth path on the topCanvas using quadraticCurveTo
         */
        _render(ctx)
        {
            if (!this._points.length) return

            ctx || (ctx = this.canvas.contextTop)

            let p1 = this._points[0],
                p2 = this._points[1],
                len,
                i

            if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
                const width = this.width / 1000

                p1 = new fabric.Point(p1.x, p1.y)
                p2 = new fabric.Point(p2.x, p2.y)

                p1.x -= width
                p2.x += width
            }

            ctx.save()

            this._setBrushStyles(ctx)

            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)

            for (i = 1, len = this._points.length; i < len; i++) {
                this._drawSegment(ctx, p1, p2)

                p1 = this._points[i]
                p2 = this._points[i + 1]
            }

            ctx.lineTo(p1.x, p1.y)
            ctx.stroke()

            ctx.closePath()
            ctx.restore()
        },

        _restoreTopContext()
        {
            this.drawImage(this.canvas.contextTop)
            this.drawBlank(this.canvas.contextTop)
        },

        drawImage(ctx)
        {
            const { src, dump: { left, top }, canvas: cv } = this,
                { width, height, viewportTransform: v } = cv

            ctx.clearRect(0, 0, width, height)
            ctx.setTransform(v[0], v[1], v[2], v[3], v[4], v[5])
            ctx.drawImage(src, left, top)
        },

        toBlank()
        {
            this._render(this.blank.getContext('2d'))
        },

        drawBlank(ctx)
        {
            ctx.drawImage(this.blank, 0, 0)
        },

        newBlank()
        {
            this.blank = createCanvas(this.canvas)
        },

        async setTargetObject(obj)
        {
            const img = obj.type !== 'image' ? await createImage(obj) : obj

            this.dump = img.getBoundingRect(true)
            this.src = img.toCanvasElement()
            this.id = this.getId(obj)

            this.origin = img

            clone(this).then(c => {
                this.clone = c

                this.drawImage(this.canvas.contextTop)
                this.newBlank()

                this.canvas.remove(obj)
                this.canvas.renderAll()
            })
        },

        setContext(context)
        {
            this.context = context
        },

        finalize()
        {
            this.context.$emit('drawingtool:end')
            this._points = []
            clear(this)
        },

        getId(obj)
        {
            return this.canvas.getObjects().findIndex(o => o === obj)
        },

        apply()
        {
            return new Promise(resolve => {
                let origin = { ...this.origin.toObject(), visible: true },
                    flat = { ...origin, scaleX: 1, scaleY: 1, angle: 0 },

                    { width: oW, height: oH, angle, scaleX: sX, scaleY: sY } = origin,
                    { width: dw, height: dh, left: dl, top: dt } = this.dump,

                    RAD = Math.PI / 180,

                    zw = dw / sX,
                    zh = dh / sY,
                    dx = -zw / 2,
                    dy = -zh / 2,

                    cvs,
                    ctx

                fabric.Image.fromObject(flat, img => {
                    cvs = img.toCanvasElement()
                    ctx = cvs.getContext('2d')

                    ctx.save()
                    ctx.translate(oW / 2, oH / 2)
                    ctx.rotate(-angle * RAD)
                    // ctx.globalCompositeOperation = 'source-atop'
                    ctx.drawImage(this.blank, dl, dt, dw, dh, dx, dy, zw, zh)
                    ctx.restore()

                    origin.src = cvs.toDataURL('image/png', 1.0)
                    fabric.Image.fromObject(origin, resolve)
                })
            })
        },

        perform(apply, callback)
        {
            const insert = o => this.canvas.insertAt(o, this.id)

            if (typeof callback !== 'function') {
                callback = () => {}
            }

            (apply ? this.apply() : Promise.resolve(this.origin))
                .then(obj => {
                    obj && insert(obj)

                    callback()
                })
                .catch(() => {
                    callback()

                    this.context.$bus.$emit('snack', {
                        content: 'graph.unexpected_error',
                        color: 'error'
                    })
                })
                .finally(() => {
                    this.canvas.trigger('canvas:distort', {})
                    this.canvas.renderAll()
                    this.finalize()
                })
        }
    })

    fabric.cloneTool = function(context) {
        const instance = new Clone(context.canvas)

        instance.setContext(context)

        return instance
    }

    return fabric
}
