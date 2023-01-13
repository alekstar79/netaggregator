// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    let props = ['text','fillStyle','fontWeight','fontStyle','fontSize','fontFamily','charSpacing','lineWidth','underline','control1','control2','start','end','cH','cW'],
        lock = () => ['lockRotation','lockScalingX','lockScalingY','lockUniScaling','lockScalingFlip','lockSkewingX','lockSkewingY']
            .reduce((c, k) => ({ ...c, [k]: true }), {}),

        controls = () => ['hasControls','hasBorders','hasRotatingPoint'].reduce((c, k) => ({ ...c, [k]: false }), {}),
        corners = () => ['tl','tr','br','bl','ml','mt','mr','mb','mtr'].reduce((a,c) => ({ ...a, [c]: false }), {}),

        browser = typeof process === 'undefined' || process.browser,
        module = browser ? './index.mjs' : './empty.mjs',

        { setControls } = await import(/* webpackChunkName: "toolkit" */ `${module}`).then(m => m.default || m),
        { nextFrame } = await import(/* webpackChunkName: "callbacks" */ '../callbacks.mjs'),
        { debounce } = await import('../common/debounce.mjs'),
        { Curved, options } = await import('./curved.mjs'),
        { loadFont } = await import('./fonts/loader.mjs'),
        { promisify } = await import('./index.mjs'),

        emitter = (events = {}) => ({
            emit: (name, ...data) => (events[name] || []).forEach(fn => fn(...data)),
            on: (name, fn) => (events[name] = events[name] || []).push(fn)
        }),

        resolve = () => !browser ? Promise.resolve() : loadFont(options()),
        catcher = () => {}

    fabric.CurvedControls = fabric.util.createClass(fabric.Rect, {
        type: 'curved-controls',

        excludeFromExport: true,

        control: 'start',
        context: null,
        parent: null,

        onHover: false,
        visible: false,

        stroke: 'rgb(0,148,221)',
        strokeWidth: 2,
        fill: '',

        originX: 'center',
        originY: 'center',

        height: 15,
        width: 15,

        initialize(control, { e: emitter, left, top, parent, context = {} })
        {
            const stoping = this._onStoping.bind(this),
                moving = this._onMoving.bind(this)

            if (typeof control === 'number') {
                switch (control) {
                    case 0: control = 'start'; break
                    case 1: control = 'control1'; break
                    case 2: control = 'control2'; break
                    case 3: control = 'end'; break
                }
            }

            this.on('removed', () => {
                this.off('moving', moving)
                this.off('moved', stoping)
            })

            this.on('added', () => {
                this.on('moving', moving)
                this.on('moved', stoping)
            })

            this.callSuper('initialize', {
                fill: ['start','end'].includes(control) ? this.stroke : '',
                left: left || context[control].x,
                top: top || context[control].y,
                emitter,
                control,
                context,
                parent,

                ...controls(),
                ...lock()
            })

            this.setControlsVisibility(corners())
        },

        _drawControl(control, ctx, methodName, left, top, styleOverride)
        {
            //
        },

        _render(ctx)
        {
            const size = 15 / (this.canvas ? this.canvas.getZoom() : 1)

            this.height = size
            this.width = size

            this.callSuper('_render', ctx)
        },

        _onMoving({ pointer /*, target */ })
        {
            this.context[this.control] = pointer

            this.emitter.emit('moving')
        },

        _onStoping({/* target */})
        {
            this.canvas.trigger('programmatic')

            this.emitter.emit('stoped')
        },

        correction({ x, y })
        {
            this.left += x
            this.top += y
        },

        toObject(includes = [])
        {
            return this.callSuper('toObject', ['parent','control'].concat(includes))
        },

        drawControls(ctx, styleOverride)
        {
            //
        },

        onDeselect(options)
        {
            //
        },

        onSelect(options)
        {
            //
        }
    })

    fabric.CurvedText = fabric.util.createClass(fabric.Object, {
        type: 'curved-text',

        prev: { width: 0, height: 0, left: 0, top: 0 },

        lockScalingFlip: true,
        lockUniScaling: true,
        lockSkewingX: true,
        lockSkewingY: true,

        controls: [],

        ...options(),

        initialize(options)
        {
            this.callSuper('initialize', options)

            this.on('removed', this._uninstall)
            this.on('added', this._install)

            browser && setControls(this, {
                tr: {
                    cursor: 'pointer',
                    action: () => {
                        this.stopFix = true
                        this.canvas.trigger('curved:settings', this)
                        setTimeout(() => {
                            this.stopFix = false
                        }, 100)
                    }
                }
            })
        },

        _install()
        {
            this.canvas.stackManagerStop = true
            this.canvas._objects = this.canvas._objects.filter(o => o.parent !== this.custom.unique)

            const e = emitter()

            e.on('moving', () => this.resize(this.visible))
            e.on('stoped', () => this.update(this.visible))

            this.controls = Array.from({ length: 4 }, (_, i) => {
                const c = new fabric.CurvedControls(i, { parent: this.custom.unique, context: this.context, e })
                this.canvas.insertTo(c)
                return c
            })

            this.canvas.stackManagerStop = false

            this.on('scaling', this._onMoving)
            this.on('scaled', this._onStoping)
            this.on('moving', this._onMoving)
            this.on('moved', this._onStoping)

            this.update()
        },

        _uninstall()
        {
            this.canvas.stackManagerStop = true

            this.controls.forEach(c => {
                if (c.parent === this.custom.unique) {
                    this.canvas.remove(c)
                    c.fire('removed')
                }
            })

            this.canvas.stackManagerStop = false
            this.controls = []

            this.off('scaling', this._onMoving)
            this.off('scaled', this._onStoping)
            this.off('moving', this._onMoving)
            this.off('moved', this._onStoping)
        },

        _onMoving({/* target, pointer */})
        {
            this.context.moving = true

            const { left, top, prev: { left: pl, top: pt } } = this,
                diff = { x: left - pl, y: top - pt }

            this.controls.forEach(c => {
                if (c.parent === this.custom.unique) {
                    c.correction(diff)
                }
            })

            this.setPrev()
        },

        /**
         * @param {CanvasRenderingContext2D} ctx
         */
        _render(ctx)
        {
            ctx.drawImage(this.context.canvas, -this.width / 2, -this.height / 2)
        },

        onDeselect(/* options */)
        {
            const visible = this.controls.some(c => c.onHover)

            if (!this.canvas._objects.filter(o => o.parent === this.custom.unique).length) {
                this.controls.forEach(this.canvas.insertTo.bind(this.canvas))
            }

            this.controls.forEach(c => {
                if (c.parent === this.custom.unique) {
                    c.visible = visible
                }
            })

            this.context.underline = visible
        },

        onSelect(/* options */)
        {
            this.context.underline = true

            if (!this.canvas._objects.filter(o => o.parent === this.custom.unique).length) {
                this.controls.forEach(this.canvas.insertTo.bind(this.canvas))
            }

            this.controls.forEach(c => {
                if (c.parent === this.custom.unique) {
                    c.visible = true
                }
            })
        },

        resize()
        {
            nextFrame(() => {
                this.height = this.context.canvas.height
                this.width = this.context.canvas.width
            })
        },

        update: debounce(function(distort = false)
        {
            distort && this.canvas.trigger('canvas:distort', {})

            this.context.moving = false
            this.controls.forEach(c => {
                this[c.control] = { x: c.left, y: c.top }
            })

            this.setPrev()

        }, 0),

        setPrev()
        {
            this.prev.height = this.height
            this.prev.width = this.width
            this.prev.left = this.left
            this.prev.top = this.top
        }
    })

    /* fabric.CurvedText.prototype.requestRender = (function(render) {
        let canvas = null

        return debounce(function() {
            this.canvas && (canvas = this.canvas)
            canvas && render.call(canvas)

        }, 0)
    })(fabric.Canvas.prototype.renderAll) */

    fabric.CurvedText.prototype.onChangeFix = debounce(function() {
        if (this.stopFix || !this.canvas) {
            this.stopFix = false
            return
        }

        this.canvas.trigger('programmatic')

    }, 0)

    fabric.CurvedText.prototype.toObject = (function(toObject) {
        return function(include = []) {
            this.update(this.visible)

            return toObject.call(this, props.concat(include))
        }
    })(fabric.CurvedText.prototype.toObject)

    fabric.CurvedText.fromObject = function(options, callback) {
        resolve().catch(catcher).then(() => {
            callback(new fabric.CurvedText({ ...options, context: new Curved(options) }))
        })
    }

    fabric.CurvedText.create = function({ canvas: c }) {
        return resolve().catch(catcher).then(() => {
            const z = c.getZoom(),
                cH = (c.height / z) + .5 | 0,
                cW = (c.width / z) + .5 | 0,

                context = new Curved({ cH, cW }),
                height = +`${context.canvas.height}`,
                width = +`${context.canvas.width}`,

                top = (cH / 2) - height / 2,
                left = (cW / 2) - width / 2

            return new fabric.CurvedText({ context, cH, cW, height, width, left, top })
        })
    }

    fabric.CurvedText.async = true

    fabric.CurvedText = promisify(fabric.CurvedText, function(prop) {
        if (['text','fillStyle','fontSize','fontFamily','charSpacing'].includes(prop)) {
            this.onChangeFix()
            fabric.request()
        }
    })

    return fabric
}
