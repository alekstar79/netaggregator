// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    const { createCanvas } = await import('../common/canvas.mjs'),
        { createImage } = await import('../common/image.mjs')

    function clear(context)
    {
        ['pattern','origin','blank','dump','src','id'].forEach(p => { context[p] = null })
    }

    function desaturate({ canvas, src: a, dump })
    {
        const c = document.createElement('canvas'),
            dst = c.getContext('2d'),

            src = a.getContext('2d'),
            z = canvas.getZoom(),

            { height: dH, width: dW, left: dL, top: dT } = dump,
            { height: cH, width: cW } = canvas

        let srcImg, dstImg, max, min, avg, r, g, b

        return new Promise(resolve => {
            c.height = Math.floor(cH / z)
            c.width = Math.floor(cW / z)

            srcImg = src.getImageData(0, 0, dW, dH)
            dstImg = dst.createImageData(dW, dH)

            for (let i = 0; i < srcImg.data.length; i += 4) {
                r = srcImg.data[i]
                g = srcImg.data[i + 1]
                b = srcImg.data[i + 2]

                max = (r > g) ? (r > b) ? r : b : (g > b) ? g : b
                min = (r < g) ? (r < b) ? r : b : (g < b) ? g : b

                avg = ((max + min) / 2) + .5 | 0

                dstImg.data[i] = dstImg.data[i + 1] = dstImg.data[i + 2] = avg
                dstImg.data[i + 3] = srcImg.data[i + 3]
            }

            dst.putImageData(dstImg, dL, dT, 0, 0, dW, dH)

            resolve(dst)
        })
    }

    // noinspection DuplicatedCode
    const Desaturator = fabric.util.createClass(fabric.PencilBrush, {
        type: 'DesaturateBrush',

        context: null,

        origin: null,
        clone: null,
        blank: null,
        dump: null,
        src: null,
        id: null,

        process: false,
        pattern: null,

        initialize(canvas)
        {
            canvas.on('before:render', () => this.blank && this._restoreTopContext())

            this.canvas = canvas
            this._points = []
        },

        onMouseDown(pointer, { e })
        {
            if (e.shiftKey || !this.canvas._isMainEvent(e)) return

            this._prepareForDrawing(pointer)
            this._captureDrawingPath(pointer)

            this._restoreTopContext()
            this._render()
        },

        onMouseMove(pointer, { e })
        {
            if (!this.canvas._isMainEvent(e)) return

            if (this._captureDrawingPath(pointer) && this._points.length > 1) {
                this._restoreTopContext()
                this._render()
            }
        },

        onMouseUp({ e })
        {
            if (this.canvas._isMainEvent(e)) {
                this.process = false
                this.toBlank()
            }
        },

        _setPattern(ctx)
        {
            this.pattern = ctx.createPattern(ctx.canvas, 'no-repeat')
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

        /**
         * @param {Object} pointer Actual mouse position related to the canvas
         */
        _prepareForDrawing({ x, y })
        {
            const p = new fabric.Point(x, y)

            this._points = []
            this._addPoint(p)

            this.canvas.contextTop.moveTo(x, y)

            this.process = true
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
         * @param {Object} pointer Actual mouse position related to the canvas
         */
        _captureDrawingPath({ x, y })
        {
            if (this.process) {
                return this._addPoint(new fabric.Point(x, y))
            }

            return false
        },

        /**
         * Draw a smooth path on the topCanvas using quadraticCurveTo
         */
        _render(ctx)
        {
            if (!this._points.length) return

            ctx || (ctx = this.canvas.contextTop)

            let p1 = this._points[0],
                p2 = this._points[1]

            if (this._points.length === 2 && p1.eq(p2)) {
                const width = this.width / 1000

                p1.x -= width
                p2.x += width
            }

            ctx.save()

            this._setBrushStyles(ctx)

            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)

            for (let mid, i = 1; i < this._points.length; i++) {
                mid = p1.midPointFrom(p2)

                ctx.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y)

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

        drawBlank(ctx)
        {
            ctx.drawImage(this.blank, 0, 0)
        },

        toBlank()
        {
            this._render(this.blank.getContext('2d'))
        },

        newBlank()
        {
            this.blank = createCanvas(this.canvas)
        },

        async setTargetObject(obj)
        {
            const img = obj.type !== 'image'
                ? await createImage(obj)
                : obj

            this.dump = img.getBoundingRect(true)
            this.src = img.toCanvasElement()
            this.id = this.getId(obj)

            this.origin = img

            desaturate(this).then(this._setPattern.bind(this))

            this.drawImage(this.canvas.contextTop)
            this.newBlank()

            this.canvas.remove(obj)
            this.canvas.renderAll()
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

        recalcCoords()
        {
            let { width: W, height: H, angle } = this.origin.toObject(),
                { width: w, height: h, left: l, top: t } = this.dump

            angle *= Math.PI / 180

            this._points = this._points
                .map(p => p.subtract({ x: l + w / 2, y: t + h / 2 }))
                .map(p => new fabric.Point(
                    p.x * Math.cos(angle) + p.y * Math.sin(angle),
                    p.y * Math.cos(angle) - p.x * Math.sin(angle)
                ))
                .map(p => p.add({ x: W / 2, y: H / 2 }))
        },

        test()
        {
            const c = createCanvas(this.canvas),
                ctx = c.getContext('2d')

            this.recalcCoords()
            this.drawImage(ctx)

            this._render(ctx)

            window.open(c.toDataURL('image/png', 1.0), '_blank')
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
                    // this.test(origin, flat)
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
                    // obj || this.setParams(1)
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

    fabric.desaturateTool = function(context) {
        const instance = new Desaturator(context.canvas)

        instance.setContext(context)

        return instance
    }

    return fabric
}
