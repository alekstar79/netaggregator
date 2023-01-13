// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    let { App } = await import(/* webpackChunkName: "dinamic-background" */ './dinamic/index.mjs'),
        { createCanvas } = await import('../common/canvas.mjs'),
        { rndstring } = await import('../common/symbols.mjs'),

        lock = ['lockMovementX','lockMovementY','lockRotation','lockScalingX','lockScalingY','lockUniScaling','lockSkewingX','lockSkewingY','lockScalingFlip']
            .reduce((c, k) => ({ ...c, [k]: true }), {}),

        controlls = ['selectable','hasControls','hasBorders','hasRotatingPoint']
            .reduce((c, k) => ({ ...c, [k]: false }), {}),

        animList = [
            { value: 'gradient',  text: 'Gradient'   },
            { value: 'geometry',  text: 'Geometry'   },
            { value: 'balloons',  text: 'Balloons'   },
            { value: 'particles', text: 'Particles'  },
            { value: 'rainbow',   text: 'Rainbow'    },
            { value: 'sparkling', text: 'Sparkling'  },
            { value: 'mystical',  text: 'Mystical'   },
            { value: 'mesh',      text: 'Mesh'       },
            { value: 'neon',      text: 'Neon'       },
            { value: 'noisy',     text: 'Noisy'      }
         // { value: 'grid',      text: 'Grid'       }
        ],

        animation = animList[0],

        instances = {},
        canvases = {},
        dataset = {}

    fabric.DynamicBackground = fabric.util.createClass(fabric.Image, {
        type: 'dynamic-background',

        animList,

        applied: false,
        binding: false,

        app: null,
        cnv: null,
        id: null,

        initialize(options)
        {
            this.release()
            this.bind()

            const k = `${options.width}_${options.height}`

            canvases[k] || (canvases[k] = createCanvas(options))

            this.cnv = canvases[k]
            this.app = App.init(k, this.cnv)
            this.applied = false

            this.callSuper('initialize', this.cnv, {
                ...options,
                ...controlls,
                ...lock
            })
        },

        bind()
        {
            if (this.binding) return

            this.binding = true

            this.canvas ? this.onAdded() : this.on('added', this.onAdded)

            this.on('removed', this.release)
            this.on('mouseup', this.apply)
        },

        unbind()
        {
            this.off('removed', this.release)
            this.off('added', this.onAdded)
            this.off('mouseup', this.apply)

            this.binding = false
        },

        onAdded()
        {
            this.on('mousemove', this.app.mousemove.bind(this.app))
            this.on('mouseout', this.app.mouseout.bind(this.app))

            this.app.setRenderer(this.canvas.requestRenderAllBound)
            this.app.setCleaner(this.clearCanvas.bind(this))
            this.app.choose(animation.value, dataset)
        },

        render(ctx)
        {
            ctx && this.callSuper('render', ctx)
        },

        clearCanvas()
        {
            const { contextContainer: ctx, width = 0, height = 0 } = this.canvas || {}

            ctx && ctx.clearRect(0, 0, width, height)
        },

        getId(obj)
        {
            return this.canvas?.getObjects().findIndex(o => o === obj) || 0
        },

        release()
        {
            this.unbind()

            if (this.canvas) {
                this.canvas.cancelRequestedRender()
                this.clearCanvas()
            }
            if (this.app) {
                this.app.loop.stop()
                this.app.dispose()
            }
        },

        setExtra(extra)
        {
            if (!this.app) return Promise.resolve()

            dataset[this.app.type] = extra

            return this.app.setExtra(extra)
        },

        choose(type)
        {
            if (!this.app) return Promise.resolve()

            animation = type

            return this.app.choose(type.value, dataset)
        },

        apply()
        {
            fabric.Image.fromURL(this.cnv.toDataURL(), img => {
                img.set({ custom: { unique: rndstring(12), name: 'background' } })

                this.canvas.trigger('canvas:flash')
                this.canvas.insertAt(img, this.getId(this), true)
                this.canvas.trigger('canvas:distort')

                this.applied = true

                this.release()
            })
        }
    })

    fabric.DynamicBackground.fromObject = function(options, callback) {
        const k = `${options.width}_${options.height}`

        instances[k] || (instances[k] = new fabric.DynamicBackground(options))

        instances[k].bind()

        callback(instances[k])
    }

    fabric.DynamicBackground.create = function(context) {
        const { canvas: { width, height }, scaled: { scale } } = context,
            k = `${width}_${height}`

        instances[k] || (instances[k] = new fabric.DynamicBackground({
            height: height / scale,
            width: width / scale,
            scale
        }))

        instances[k].bind()

        return instances[k]
    }

    return fabric
}
