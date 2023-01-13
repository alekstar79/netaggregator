// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    const { floodFill, concatMasks, gaussBlurOnlyBorder, getBorderIndices, traceContours, simplifyContours } =
        await import(/* webpackChunkName: "toolkit" */ './index.mjs'),

        { carryOut, nextFrame } = await import(/* webpackChunkName: "callbacks" */ '../callbacks.mjs'),
        { createCanvas } = await import('../common/canvas.mjs'),
        { createImage } = await import('../common/image.mjs'),
        { rclamp } = await import('../common/clamp.mjs'),

        { MaskHistory } = await import('./mask-history.mjs')

    function noop() {}

    function clear(context)
    {
        ['origin','blank','dump','src','id'].forEach(p => { context[p] = null })
    }

    // noinspection DuplicatedCode
    const Magic = fabric.util.createClass(fabric.BaseBrush, {
        type: 'MagicBrush',

        currentThreshold: 16,
        colorThreshold: 16,

        simplifyTolerant: 0,
        simplifyCount: 30,

        hatchOffset: 0,
        hatchLength: 5,
        blurRadius: 3,

        allowDraw: false,
        downPoint: null,
        imageInfo: null,
        history: null,

        context: null,
        origin: null,
        canvas: null,
        blank: null,
        dump: null,
        src: null,
        off: null,
        id: null,

        mask: false,
        fill: false,
        copy: false,

        initialize(canvas)
        {
            const renderer = () => this.src && this.tick()

            canvas.on('before:render', renderer)

            this.history = new MaskHistory(renderer)
            this.canvas = canvas
        },

        onMouseDown({ x, y }, { e })
        {
            if (e.shiftKey || !this.canvas._isMainEvent(e)) return

            if (e.button === 0) {
                this.fill = this.draw = false
                this.concat = e.ctrlKey

                this.downPoint = { x: x |= 0, y: y |= 0 }
                this.allowDraw = !this.concat

                this.build()
            }
        },

        onMouseMove({ x, y }, { e })
        {
            if (!this.allowDraw || !this.canvas._isMainEvent(e)) return

            x |= 0
            y |= 0

            if (x !== this.downPoint.x || y !== this.downPoint.y) {
                let dx = x - this.downPoint.x,
                    dy = y - this.downPoint.y,

                    len = Math.sqrt(dx * dx + dy * dy),
                    adx = Math.abs(dx),
                    ady = Math.abs(dy),

                    sign = adx > ady ? dx / adx : dy / ady

                sign = sign < 0 ? sign / 5 : sign / 3

                const ct = rclamp(Math.floor(sign * len), 8, 128)

                if (ct !== this.currentThreshold) {
                    this.emitThreshold(ct)
                    this.build()
                }
            }
        },

        onMouseUp({ e })
        {
            if (this.canvas._isMainEvent(e)) {
                this.allowDraw = false
                this.concat = false
            }
        },

        build()
        {
            this.settle()
                .then(this.setMask.bind(this))
                .then(this._render.bind(this))
                .catch(noop)
        },

        settle()
        {
            return !this.timeout
                ? new Promise(resolve => this.timeout = nextFrame(resolve))
                : Promise.reject()
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
                let old = this.history.getCurrent(),
                    { x, y } = this.downPoint,

                    border,
                    mask

                mask = floodFill(image, x, y, this.currentThreshold, null, false)

                if (this.concat && old) {
                    mask = concatMasks(mask, old.mask)
                }

                border = getBorderIndices(mask)

                this.history.add({ border, mask })
                this.context.$emit('drawingtool:history')

                resolve()
            })
        },

        _render()
        {
            if (this.quickRender()) return

            const current = this.history.getCurrent(),
                src = this.imageInfo.context,
                h = src.canvas.height,
                w = src.canvas.width,

                dst = this.canvas.contextTop,
                img = new ImageData(w, h),

                { width, height } = this.canvas,

                length = this.hatchLength,
                offset = this.hatchOffset

            for (let x, y, i, k, j = 0; j < current.border.length; j++) {
                i = current.border[j]
                x = i % w                           // calc x by index
                y = (i - x) / w                     // calc y by index
                k = (y * w + x) * 4

                if ((x + y + offset) % (length * 2) < length) {
                    img.data[k + 3] = 255           // black (change only alpha)
                } else {
                    img.data[k]     = 255           // white
                    img.data[k + 1] = 255
                    img.data[k + 2] = 255
                    img.data[k + 3] = 255
                }
            }

            src.clearRect(0, 0, w, h)
            src.putImageData(img, 0, 0)

            dst.clearRect(0, 0, width, height)
            dst.drawImage(src.canvas, 0, 0, w, h, 0, 0, width, height)

            this.timeout = undefined
        },

        quickRender()
        {
            let disable = this.history.undoDisabled,
                current = this.history.getCurrent(),
                scope = this.imageInfo && current,

                dst, src, height, width, h, w

            try {

                height = this.canvas.height
                width = this.canvas.width

                dst = this.canvas.contextTop
                src = this.blank

                h = src.height
                w = src.width

                if (this.fill || this.draw) {
                    dst.clearRect(0, 0, width, height)
                    dst.drawImage(src, 0, 0, w, h, 0, 0, width, height)
                    return true
                }

            } catch (e) {
            }

            if (!current && disable) {
                this.toCanvas()
            }

            return !scope
        },

        trace()
        {
            const current = this.history.getCurrent()

            if (!current) return

            const mask = gaussBlurOnlyBorder(current.mask, this.blurRadius),
                cs = simplifyContours(traceContours(mask), this.simplifyTolerant, this.simplifyCount),
                { context: src, height: h, width: w } = this.imageInfo

            src.clearRect(0, 0, w, h)

            // inner
            src.beginPath()

            for (let ps, i = 0; i < cs.length; i++) {
                if (!cs[i].inner) continue

                ps = cs[i].points
                src.moveTo(ps[0].x, ps[0].y)

                for (let j = 1; j < ps.length; j++) {
                    src.lineTo(ps[j].x, ps[j].y)
                }
            }

            src.strokeStyle = 'red'
            src.stroke()

            // outer
            src.beginPath()

            for (let ps, i = 0; i < cs.length; i++) {
                if (cs[i].inner) continue

                ps = cs[i].points
                src.moveTo(ps[0].x, ps[0].y)

                for (let j = 1; j < ps.length; j++) {
                    src.lineTo(ps[j].x, ps[j].y)
                }
            }

            src.strokeStyle = 'blue'
            src.stroke()

            this.toCanvas(src.canvas)

            this.draw = true
        },

        paint(color)
        {
            let rgba = { r: 255, g: 255, b: 255, a: 255 },
                current = this.history.getCurrent()

            if (!current) return

            if (this.fill) {
                rgba = color
                rgba.a = Math.round(color.a * 255)
            }

            let mask = gaussBlurOnlyBorder(current.mask, this.blurRadius),
                { context: src, height: h, width: w } = this.imageInfo,
                { data, bounds, width } = mask,

                img = new ImageData(w, h)

            for (let k, x, y = bounds.minY; y <= bounds.maxY; y++) {
                for (x = bounds.minX; x <= bounds.maxX; x++) {
                    if (data[y * width + x] === 0) continue

                    k = (y * w + x) * 4

                    img.data[k]     = rgba.r
                    img.data[k + 1] = rgba.g
                    img.data[k + 2] = rgba.b
                    img.data[k + 3] = rgba.a
                }
            }

            src.putImageData(img, 0, 0)

            this.toCanvas(src.canvas, true)

            this.fill = true
        },

        toCanvas(src, onlyBlank)
        {
            if (onlyBlank) this.off()

            let { width: ow, height: oh } = this.imageInfo,
                { width: cw, height: ch } = this.canvas,

                blk,
                dst

            if (this.blank) {
                blk = this.blank.getContext('2d')
                blk.clearRect(0, 0, ow, oh)
            }
            if (this.canvas && !onlyBlank) {
                dst = this.canvas.contextTop
                dst.clearRect(0, 0, cw, ch)
            }
            if (src) {
                blk && blk.drawImage(src, 0, 0)

                if (!onlyBlank && dst) {
                    dst.drawImage(src, 0, 0, ow, oh, 0, 0, cw, ch)
                }
            }
        },

        tick()
        {
            const equal = this.currentThreshold === this.colorThreshold

            this.hatchOffset = (this.hatchOffset + 1) % (this.hatchLength * 2)
            this.colorThreshold = this.currentThreshold

            equal ? this._render() : this.build()

            return !this.src
        },

        setLeftTopOrigin()
        {
            const { left: x, top: y } = this.origin,
                p = this.origin.translateToOriginPoint(
                    { x, y },
                    'left',
                    'top'
                )

            this.origin.set({
                originX: 'left',
                originY: 'top',
                left: p.x,
                top: p.y
            }).setCoords()
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

            this.origin = img
            this.dump = dump
            this.src = src
            this.id = id

            this.history.clear()

            this.off = carryOut(
                this.tick.bind(this),
                100
            )
        },

        emitThreshold(magicThreshold)
        {
            this.context.$store.commit('canvas/setDrawerOption', { magicThreshold })

            this.currentThreshold = magicThreshold
        },

        setContext(context)
        {
            this.context = context
        },

        finalize()
        {
            this.mask = false
            this.fill = false
            this.copy = false

            clear(this)
        },

        getId(obj)
        {
            return this.canvas.getObjects().findIndex(o => o === obj)
        },

        apply()
        {
            if (this.origin.originX === 'center' || this.origin.originY === 'center') {
                this.setLeftTopOrigin()
            }

            return new Promise(resolve => {
                let origin = { ...this.origin.toObject(), visible: true },
                    flat = { ...origin, scaleX: 1, scaleY: 1, angle: 0 },

                    { width: oW, height: oH, angle, scaleX: sX, scaleY: sY } = origin,
                    { width: dw, height: dh, left: dl, top: dt } = this.dump,

                    // to adjust bounding //////////////////////////////
                    { mask: { bounds: b } } = this.history.getCurrent(),

                    mW = (b.maxX - b.minX) / sX,
                    mH = (b.maxY - b.minY) / sY,
                    // /////////////////////////////////////////////////

                    RAD = Math.PI / 180,

                    zw = dw / sX,
                    zh = dh / sY,
                    dx = zw / 2,
                    dy = zh / 2,

                    cvs,
                    ctx

                fabric.Image.fromObject(flat, img => {
                    cvs = img.toCanvasElement()
                    ctx = cvs.getContext('2d')

                    switch (true) {
                        case this.mask || this.copy:
                            ctx.globalCompositeOperation = 'destination-in'
                            break
                        case this.fill:
                            ctx.globalCompositeOperation = 'source-over'
                            break
                    }

                    ctx.translate(oW / 2, oH / 2)
                    ctx.rotate(-angle * RAD)
                    ctx.drawImage(this.blank, dl, dt, dw, dh, -dx, -dy, zw, zh)

                    origin.src = cvs.toDataURL()

                    if ((this.mask || this.copy) && !angle) {
                        const output = createCanvas({ height: mH, width: mW }, 1),
                            out = output.getContext('2d')

                        out.translate((mW / 2) - (oW / 2), (mH / 2) - (oH / 2))
                        // out.rotate(-angle * RAD)
                        out.drawImage(
                            cvs,
                            (dl / sX + dx) - (b.minX / sX + mW / 2),
                            (dt / sY + dy) - (b.minY / sY + mH / 2)
                        )

                        origin.src = output.toDataURL()
                        origin.left = b.minX
                        origin.top = b.minY
                        origin.height = mH
                        origin.width = mW
                    }

                    fabric.Image.fromObject(origin, resolve)
                })
            })
        },

        perform(apply, callback)
        {
            const insert = (o, id) => this.canvas.insertAt(o, id)

            if (typeof callback !== 'function') {
                callback = () => {}
            }

            (apply ? this.apply() : Promise.resolve())
                .then(obj => {
                    obj && (() => {
                        this.copy || this.canvas.remove(this.origin)
                        insert(obj, this.copy ? ++this.id : this.id)
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

    fabric.magicTool = function(context) {
        const instance = new Magic(context.canvas)

        instance.setContext(context)

        return instance
    }

    return fabric
}
