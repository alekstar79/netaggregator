// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createBrush)

export function createBrush({ fabric })
{
    // noinspection DuplicatedCode
    fabric.SprayBrush = fabric.util.createClass(fabric.BaseBrush, {
        color: '#000000',
        width: 30,

        blank: null,

        _point: null,
        _min: null,
        _max: null,

        initialize(context)
        {
            if (!context.canvas) return

            const canvas = context.canvas

            this.width = canvas.freeDrawingBrush.width
            this.color = canvas.freeDrawingBrush.color

            this.context = context
            this.canvas = canvas

            canvas.on('before:render', () => {
                this._point && this._render()
            })

            this.newBlank()
        },

        onMouseDown(pointer, { e })
        {
            if (this.canvas._isMainEvent(e)) {
                this._point = new fabric.Point(pointer.x, pointer.y)
                this._render(this.canvas.contextTop)
                this.extremum()
            }
        },

        onMouseMove(pointer, { e })
        {
            if (this.canvas._isMainEvent(e)) {
                this._point = new fabric.Point(pointer.x, pointer.y)
                this._render(this.canvas.contextTop)
                this.extremum()
            }
        },

        onMouseUp({ e })
        {
        },

        extremum()
        {
            const min = this._point.scalarSubtract(this.width),
                max = this._point.scalarAdd(this.width)

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

        _render(ctx)
        {
            if (!ctx) return this.drawBlank()

            for (let i = this.width; i--;) {
                const angle = fabric.util.getRandom(0, Math.PI * 2),
                    radius = fabric.util.getRandom(0, this.width)

                this.blank.ctx.fillStyle = this.color
                this.blank.ctx.fillRect(
                    this._point.x + radius * Math.cos(angle),
                    this._point.y + radius * Math.sin(angle),
                    1, 1
                )
            }

            this.drawBlank()
        },

        finalize(obj)
        {
            obj && this.canvas.insertTo(obj)

            this.canvas.renderAll()
            this.blank.clear()

            this._point = null
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
