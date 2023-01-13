// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    const { floodFill, concatMasks, gaussBlurOnlyBorder } = await import(/* webpackChunkName: "toolkit" */ './index.mjs'),
        { createCanvas } = await import('../common/canvas.mjs'),
        { createImage } = await import('../common/image.mjs'),
        { MaskHistory } = await import('./mask-history.mjs')

    function clear(context)
    {
        ['origin','blank','dump','src','id'].forEach(p => { context[p] = null })
    }

    // noinspection DuplicatedCode
    const Fill = fabric.util.createClass(fabric.BaseBrush, {
        type: 'FillBrush',

        colorThreshold: 16,
        blurRadius: 5,

        downPoint: null,
        imageInfo: null,
        history: null,

        context: null,
        canvas: null,
        origin: null,
        blank: null,
        dump: null,
        src: null,
        id: null,

        initialize(canvas)
        {
            const quickly = () => this.src && this.quickRender(),
                renderer = () => this.src && this._render()

            canvas.on('before:render', quickly)

            this.history = new MaskHistory(renderer)
            this.canvas = canvas
        },

        onMouseDown({ x, y }, { e })
        {
            if (!e.shiftKey && this.canvas._isMainEvent(e)) {
                this.downPoint = { x: x |= 0, y: y |= 0 }
                this.setMask().then(() => this._render())
            }
        },

        onMouseMove(/* pointer, { e } */)
        {
        },

        onMouseUp(/* { e } */)
        {
        },

        setMask()
        {
            const image = {
                data: this.imageInfo.data.data,
                height: this.imageInfo.height,
                width: this.imageInfo.width,
                bytes: 4
            }

            return new Promise(resolve => {
                let { x, y } = this.downPoint, mask, old

                mask = floodFill(image, x, y, this.colorThreshold, null, false)

                if ((old = this.history.getCurrent())) {
                    mask = concatMasks(mask, old.mask)
                }

                this.history.add({ mask })
                this.context.stateTools()

                resolve()
            })
        },

        _render()
        {
            const current = this.history.getCurrent()

            if (!current && this.history.undoDisabled) {
                return this.toCanvas()
            }

            const mask = gaussBlurOnlyBorder(current.mask, this.blurRadius),
                { context: src, height: h, width: w } = this.imageInfo,
                { data, bounds, width } = mask,

                img = new ImageData(w, h)

            for (let k, x, y = bounds.minY; y <= bounds.maxY; y++) {
                for (x = bounds.minX; x <= bounds.maxX; x++) {
                    if (data[y * width + x] === 0) continue

                    k = (y * w + x) * 4

                    img.data[k]     = this.color[0]
                    img.data[k + 1] = this.color[1]
                    img.data[k + 2] = this.color[2]
                    img.data[k + 3] = this.color[3]
                }
            }

            src.putImageData(img, 0, 0)

            this.toCanvas(src.canvas)
        },

        quickRender()
        {
            try {

                const { width, height } = this.canvas,
                    dst = this.canvas.contextTop,
                    src = this.blank,

                    h = src.height,
                    w = src.width

                dst.clearRect(0, 0, width, height)
                dst.drawImage(src, 0, 0, w, h, 0, 0, width, height)

            } catch (e) {
            }
        },

        toCanvas(src)
        {
            let { width: ow, height: oh } = this.imageInfo,
                { width: cw, height: ch } = this.canvas,

                blk,
                dst

            if (this.blank) {
                blk = this.blank.getContext('2d')
                blk.clearRect(0, 0, ow, oh)
            }
            if (this.canvas) {
                dst = this.canvas.contextTop
                dst.clearRect(0, 0, cw, ch)
            }
            if (src) {
                dst && dst.drawImage(src, 0, 0, ow, oh, 0, 0, cw, ch)
                blk && blk.drawImage(src, 0, 0)
            }
        },

        async setTargetObject(obj)
        {
            const img = obj.type !== 'image' ? await createImage(obj) : obj

            const dump = img.getBoundingRect(true),
                src = img.toCanvasElement(),
                id = this.getId(obj),

                cnv = createCanvas(this.canvas),
                ctx = cnv.getContext('2d')

            ctx.drawImage(src, dump.left, dump.top)

            this.blank = createCanvas(this.canvas)

            this.imageInfo = {
                context: createCanvas(this.canvas).getContext('2d'),
                data: ctx.getImageData(0, 0, cnv.width, cnv.height),
                height: cnv.height,
                width: cnv.width
            }

            this.oldobj = obj
            this.origin = img
            this.dump = dump
            this.src = src
            this.id = id

            this.history.clear()
        },

        setContext(context)
        {
            this.context = context
        },

        finalize()
        {
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

                    ctx.translate(oW / 2, oH / 2)
                    ctx.rotate(-angle * RAD)
                    ctx.drawImage(this.blank, dl, dt, dw, dh, dx, dy, zw, zh)

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

            (apply ? this.apply() : Promise.resolve())
                .then(obj => {
                    obj && (() => {
                        this.canvas.remove(this.oldobj)
                        insert(obj)
                    })()

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

    fabric.fillTool = function(context) {
        const instance = new Fill(context.canvas)

        instance.setContext(context)

        return instance
    }

    return fabric
}
