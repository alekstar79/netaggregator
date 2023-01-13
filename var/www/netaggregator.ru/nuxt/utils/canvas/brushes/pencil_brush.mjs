// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createBrush)

export function createBrush({ fabric })
{
    // noinspection DuplicatedCode
    fabric.PencilBrushMod = fabric.util.createClass(fabric.BaseBrush, {
        color: '#000000',
        width: 30,

        blank: null,

        _points: [],
        _min: null,
        _max: null,

        initialize(context)
        {
            if (!context.canvas) return

            this.canvas = context.canvas
            this.context = context

            context.canvas.on('before:render', () => {
                this._max && this._render()
            })

            this.newBlank()
        },

        extremum()
        {
            const point = this._points[this._points.length - 1],
                min = point.scalarSubtract(this.width / 2),
                max = point.scalarAdd(this.width / 2)

            this._min || (this._min = min)
            this._max || (this._max = max)

            this._min = this._min.min(min)
            this._max = this._max.max(max)
        },

        drawBlank()
        {
            const { width: cw, height: ch, contextTop: ctx } = this.canvas,
                { height: bh, width: bw, cnv } = this.blank

            ctx.clearRect(0, 0, cw, ch)
            ctx.drawImage(cnv, 0, 0, bw, bh, 0, 0, cw, ch)
        },

        toBlank()
        {
            const { width: cw, height: ch, contextTop } = this.canvas,
                { height: bh, width: bw, ctx } = this.blank

            contextTop.closePath()
            ctx.clearRect(0, 0, bw, bh)
            ctx.drawImage(contextTop.canvas, 0, 0, cw, ch, 0, 0, bw, bh)
        },

        newBlank()
        {
            let cnv = document.createElement('canvas'),
                ctx = cnv.getContext('2d'),
                z = this.canvas.getZoom(),
                w, h

            cnv.height = h = this.canvas.height / z
            cnv.width = w = this.canvas.width / z

            this.blank = {
                clear: () => ctx.clearRect(0, 0, w, h),
                height: h,
                width: w,
                cnv,
                ctx
            }
        },

        onMouseDown(pointer, options)
        {
            if (!this.canvas._isMainEvent(options.e)) return

            this._prepareForDrawing(pointer)
            this._captureDrawingPath(pointer)
            this._render(this.canvas.contextTop)
            this.extremum()
        },

        onMouseMove(pointer, options)
        {
            if (!this.canvas._isMainEvent(options.e)) return

            if (this._captureDrawingPath(pointer) && this._points.length > 1) {
                this.canvas.clearContext(this.canvas.contextTop)
                this._render(this.canvas.contextTop)
                this.extremum()
            }
        },

        onMouseUp(options)
        {
            if (!this.canvas._isMainEvent(options.e)) return true

            this.toBlank()

            return false
        },

        _prepareForDrawing(pointer)
        {
            const p = new fabric.Point(pointer.x, pointer.y)

            this._reset()
            this._addPoint(p)
            this.canvas.contextTop.moveTo(p.x, p.y)
        },

        _addPoint(point)
        {
            if (this._points.length > 1 && point.eq(this._points[this._points.length - 1])) {
                return false
            }

            this._points.push(point)

            return true
        },

        _reset()
        {
            this._setBrushStyles()
            this._points = []
        },

        _captureDrawingPath(pointer)
        {
            return this._addPoint(new fabric.Point(pointer.x, pointer.y))
        },

        _render(ctx)
        {
            this.drawBlank()

            if (!ctx) return

            let p1 = this._points[0],
                p2 = this._points[1]

            if (this._points.length === 2 && p1.eq(p2)) {
                const width = this.width / 1000

                p1.x -= width
                p2.x += width
            }

            this._saveAndTransform(ctx)

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
            ctx.restore()
        },

        finalize(obj)
        {
            obj && this.canvas.insertTo(obj)

            this.canvas.renderAll()
            this.blank.clear()

            this._points = []
            this._min = null
            this._max = null
        },

        perform()
        {
            return new Promise(resolve => {
                if (!this._min || !this._max) return

                let left = this._min.x,
                    top = this._min.y,

                    height = this._max.y - top,
                    width = this._max.x - left,

                    origin = { left, top, width, height, scaleX: 1, scaleY: 1, angle: 0 },
                    cvs = document.createElement('canvas'),
                    ctx = cvs.getContext('2d')

                cvs.height = height
                cvs.width = width

                ctx.drawImage(this.blank.cnv, left, top, width, height, 0, 0, width, height)

                origin.src = cvs.toDataURL('image/png', 1.0)
                fabric.Image.fromObject(origin, resolve)
            })
        },

        onError()
        {
            try {

                this.context.$bus.$emit('snack', {
                    content: 'Internal error',
                    color: 'error'
                })

            } catch (e) {
            }
        },

        apply(state)
        {
            (state ? this.perform() : Promise.resolve())
                .then(this.finalize.bind(this))
                .catch(this.onError.bind(this))
        }
    })

    return fabric
}
