// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    const { createCanvas } = await import('../common/canvas.mjs'),
        { createImage } = await import('../common/image.mjs'),
        PI2 = 2 * Math.PI

    function clear(context)
    {
        ['origin','blank','dump','src','id'].forEach(p => { context[p] = null })
    }

    // noinspection DuplicatedCode
    const Eraser = fabric.util.createClass(fabric.BaseBrush, {
        type: 'EraserBrush',
        context: null,

        alpha: 20,
        soft: 0,

        origin: null,
        blank: null,
        dump: null,
        src: null,
        id: null,

        initialize(canvas)
        {
            canvas.on('before:render', () => this.blank && this._restoreTopContext())

            this.canvas = canvas
            this._points = []
        },

        alphaSoftApproximate()
        {
            let a = this.alpha / 255,
                w = this.width / 2,
                s = this.soft,

                k = 1 + s / 2,

                a0 = s > 0 ? a * s : a,
                a1 = a

            return { a0, a1, w, k }
        },

        dot(ctx, { x, y }, alphaSoftApproximate)
        {
            const { a0, a1, w, k } = alphaSoftApproximate,
                g = ctx.createRadialGradient(x, y, 1, x, y, w * a1)

            g.addColorStop(0.0, `rgba(255,255,255,${a0})`)
            g.addColorStop(1.0, `rgba(255,255,255,${a1})`)

            ctx.fillStyle = g

            ctx.beginPath()
            ctx.arc(x, y, w * k, 0, PI2)
            ctx.closePath()
            ctx.fill()
        },

        _render(ctx)
        {
            let as = this.alphaSoftApproximate(),
                operation = 'source-over',

                p1 = this._points[0],
                p2 = this._points[1],

                l = as.w / as.k,
                a,
                d

            if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
                const width = as.w / 1000

                p1.x -= width
                p2.x += width
            }
            if (!ctx) {
                ctx = this.canvas.contextTop
                operation = 'destination-out'
            }

            ctx.save()
            ctx.globalCompositeOperation = operation

            for (let i = 1; i < this._points.length; i++) {
                d = p1.distanceFrom(p2)

                if (d > l) {
                    a = []

                    for (let x = Math.ceil(d / l); x > 0; --x) {
                        a.push(p1.lerp(p2, 1 / x))
                    }

                    this._points.splice(i, 0, ...a)
                    p2 = a[0]
                }

                this.dot(ctx, p1.midPointFrom(p2), as)

                p1 = this._points[i]
                p2 = this._points[i + 1]
            }

            ctx.restore()
        },

        _addPoint(point)
        {
            const points = this._points || []

            if (points.length > 1 && point.eq(points[points.length - 1])) {
                return false
            }

            this._points.push(point)

            return true
        },

        _prepareForDrawing(ctx, { x, y })
        {
            const p = new fabric.Point(x, y)

            this._points = []
            this._addPoint(p)

            ctx.moveTo(p.x, p.y)
        },

        _captureDrawingPath({ x, y })
        {
            return this._addPoint(new fabric.Point(x, y))
        },

        _restoreTopContext()
        {
            this.drawImage(this.canvas.contextTop)
            this.drawBlank(this.canvas.contextTop)
        },

        onMouseDown(pointer, { e })
        {
            if (!this.canvas._isMainEvent(e)) return

            const ctx = this.canvas.contextTop

            this._prepareForDrawing(ctx, pointer)
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
            if (!this.canvas._isMainEvent(e)) return true

            this.toBlank()

            return false
        },

        toBlank()
        {
            this._render(this.blank.getContext('2d'))
        },

        drawBlank(ctx)
        {
            ctx.save()
            ctx.globalCompositeOperation = 'destination-out'
            ctx.drawImage(this.blank, 0, 0)
            ctx.restore()
        },

        drawImage(ctx)
        {
            const { src, dump: { left, top }, canvas: cv } = this,
                { width, height, viewportTransform: v } = cv

            ctx.clearRect(0, 0, width, height)
            ctx.setTransform(v[0], v[1], v[2], v[3], v[4], v[5])
            ctx.drawImage(src, left, top)
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
                    ctx.globalCompositeOperation = 'destination-out'
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
                    this.canvas.requestRenderAll()
                    this.finalize()
                })
        }
    })

    fabric.eraserTool = function(context) {
        const instance = new Eraser(context.canvas)

        instance.setContext(context)

        return instance
    }

    return fabric
}
