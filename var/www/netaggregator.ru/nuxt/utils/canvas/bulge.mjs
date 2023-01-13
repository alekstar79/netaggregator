// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    const { init } = await import(/* webpackChunkName: "glfx" */ './libs/glfx/index.mjs'),
        { createImage } = await import('../common/image.mjs')

    function clear(context)
    {
        ['process','current','texture','origin','dump','id'].forEach(p => { context[p] = null })
    }

    // noinspection DuplicatedCode
    const Bulge = fabric.util.createClass(fabric.BaseBrush, {
        type: 'BulgeBrush',

        context: null,
        origin: null,
        dump: null,
        id: null,

        texture: null,
        fx: null,

        process: false,
        current: null,
        factor: 1,

        initialize(canvas)
        {
            canvas.on('before:render', () => this.origin && this._render())

            this.canvas = canvas
            this._points = []

            this.fx = init()
        },

        _render()
        {
            const { fx, canvas: cv, dump: { left: dl, top: dt } } = this,
                { width, height, viewportTransform: v } = cv,

                ctx = this.canvas.contextTop,
                c = this.current

            fx.draw(this.texture)

            for (let p, i = 0; i < this._points.length; i++) {
                p = this._points[i]

                fx.bulgePinch(p.x - dl, p.y - dt, p.w, p.f)
            }

            if (this.current) {
                fx.bulgePinch(c.x - dl, c.y - dt, c.w, c.f)
            }

            fx.update()

            ctx.clearRect(0, 0, width, height)
            ctx.setTransform(v[0], v[1], v[2], v[3], v[4], v[5])
            ctx.drawImage(fx, dl, dt)
        },

        onMouseDown({ x, y }, { e })
        {
            if (e.shiftKey || !this.canvas._isMainEvent(e)) return

            const p = new fabric.Point(x, y)

            p.f = this.factor
            p.w = this.width

            this.process = true
            this.current = p

            this._render()
        },

        onMouseMove({ x, y }, { e })
        {
            if (this.process && this.canvas._isMainEvent(e)) {
                this.current.x = x
                this.current.y = y

                this._render()
            }
        },

        onMouseUp({ e })
        {
            if (this.current && this.canvas._isMainEvent(e)) {
                this._points.push(this.current)
                this.process = false
                this.current = null
            }
        },

        async setTargetObject(obj)
        {
            const img = obj.type !== 'image' ? await createImage(obj) : obj

            const dump = img.getBoundingRect(true),
                src = img.toCanvasElement()

            this.texture = this.fx.texture(src)
            this.id = this.getId(obj)

            this.origin = img
            this.dump = dump

            this._render()

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
                    mock = { ...origin, scaleX: 1, scaleY: 1, angle: 0 },

                    { width: oW, height: oH, angle, scaleX: sX, scaleY: sY } = origin,
                    { width: dw, height: dh } = this.dump,

                    RAD = Math.PI / 180,

                    cvs,
                    ctx

                fabric.Image.fromObject(mock, img => {
                    cvs = img.toCanvasElement()
                    ctx = cvs.getContext('2d')

                    ctx.save()
                    ctx.translate(oW / 2, oH / 2)
                    ctx.rotate(-angle * RAD)
                    // ctx.globalCompositeOperation = 'source-atop'
                    ctx.drawImage(this.fx, 0, 0, dw, dh, -dw / 2 / sX, -dh / 2 / sY, dw / sX, dh / sY)
                    ctx.restore()

                    origin.src = cvs.toDataURL('image/png', 1.0)
                    origin.angle = angle

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

    fabric.bulgeTool = function(context) {
        const instance = new Bulge(context.canvas)

        instance.setContext(context)

        return instance
    }

    return fabric
}
