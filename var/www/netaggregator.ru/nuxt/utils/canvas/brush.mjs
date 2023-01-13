import { circleCursor, fillCursor } from './cursors.mjs'
import { Throttle } from '../throttle.mjs'
import { Fabric } from './import.mjs'

let fabric, pattern, circle, pencil, spray

export class Brush
{
    static CIRCLE  = 0
    static PENCIL  = 1
    static PATTERN = 2
    static SPRAY   = 3
    static ERASE   = 4

    static DESATURATE = 5
    static SHARPEN = 7
    static MAGIC = 8
    static CLONE = 9
    static BULGE = 10
    static BLUR = 11
    static FILL = 12

    constructor(editor)
    {
        this.defaultBrush = undefined
        this.circleBrush = undefined
        this.sprayBrush = undefined

        this.editor = editor

        this.resolved = {
            [Brush.CIRCLE]:  true,
            [Brush.PENCIL]:  true,
            [Brush.PATTERN]: true,
            [Brush.SPRAY]:   true,
            [Brush.ERASE]:   true,

            [Brush.DESATURATE]: true,
            [Brush.SHARPEN]: true,
            [Brush.MAGIC]: true,
            [Brush.CLONE]: true,
            [Brush.BULGE]: true,
            [Brush.BLUR]: true,
            [Brush.FILL]: true
        }

        this.state = {
            mode: Brush.PENCIL,
            options: {}
        }

        this.getOptions()
    }

    get on()
    {
        return this.editor.canvas && this.editor.canvas.isDrawingMode
    }

    /**
     * @param {boolean} v
     */
    set on(v)
    {
        this.getOptions()
        this.onMode(v)
    }

    get mode()
    {
        return this.state.mode
    }

    /**
     * @param {number} mode
     */
    set mode(mode)
    {
        if (mode in this.resolved) {
            this.state.mode = mode
            this.on && this.onMode(true)
        }
    }

    optionsAssign(options)
    {
        Object.assign(this.state.options, options)
    }

    toolsInit({ blurring, sharpen })
    {
        const bf = blurring.setFactor.bind(blurring),
            sf = sharpen.setFactor.bind(sharpen)

        this.blurFactor = Throttle.create()
        this.blurFactor.set(bf)

        this.sharpenFactor = Throttle.create()
        this.sharpenFactor.set(sf)
    }

    getOptions()
    {
        const { drawerOptions: o, scaled } = this.editor.$store.state.canvas,
            { alpha, blur, bulge, sharp, soft, magicThreshold: magic, fill: color, strokeWidth: width } = o,
            scale = scaled ? scaled.scale : 1

        this.state.options = {
            alpha,
            bulge,
            color,
            magic,
            width,
            sharp,
            scale,
            blur,
            soft
        }
    }

    getDefaultBrush()
    {
        pencil || (pencil = () => new fabric.PencilBrushMod(this.editor))

        if (!this.defaultBrush && this.editor.canvas) {
            this.defaultBrush = pencil()
        }

        return this.defaultBrush
    }

    getCircle()
    {
        circle || (circle = () => new fabric.CircleBrush(this.editor))

        if (!this.circleBrush && this.editor.canvas) {
            this.circleBrush = circle()
        }

        return this.circleBrush
    }

    getSpray()
    {
        spray || (spray = () => new fabric.SprayBrush(this.editor))

        if (!this.sprayBrush && this.editor.canvas) {
            this.sprayBrush = spray()
        }

        return this.sprayBrush
    }

    getPattern()
    {
        pattern || (pattern = () => new fabric.PatternBrush(this.editor))

        if (!this.patternBrush && this.editor.canvas) {
            this.patternBrush = pattern()
        }

        return this.patternBrush
    }

    getCloneBrush(on, width, scale)
    {
        const color = 'rgba(255,255,255,.5)'

        return {
            cursor: circleCursor(width, scale, color),
            brush: this.editor.clone,
            width,
            on
        }
    }

    getBlurBrush(on, width, scale, factor)
    {
        const color = 'rgba(255,255,255,.5)'

        if (this.editor.blurring.factor !== factor) {
            this.blurFactor.run(factor)
        }

        return {
            cursor: circleCursor(width, scale, color),
            brush: this.editor.blurring,
            width,
            on
        }
    }

    getBulgeBrush(on, width, scale, factor)
    {
        const color = 'rgba(255,255,255,.5)'

        this.editor.bulge.factor = factor

        return {
            cursor: circleCursor(width, scale, color),
            brush: this.editor.bulge,
            width,
            on
        }
    }

    getSharpenBrush(on, width, scale, factor)
    {
        const color = 'rgba(255,255,255,.5)'

        if (this.editor.sharpen.factor !== factor) {
            this.sharpenFactor.run(factor)
        }

        return {
            cursor: circleCursor(width, scale, color),
            brush: this.editor.sharpen,
            width,
            on
        }
    }

    getDesaturateBrush(on, width, scale)
    {
        const color = 'rgba(255,255,255,.5)'

        return {
            cursor: circleCursor(width, scale, color),
            brush: this.editor.desaturator,
            width,
            on
        }
    }

    getMagicWandBrush(on, width, factor)
    {
        this.editor.magic.currentThreshold = factor

        return {
            cursor: 'default',
            brush: this.editor.magic,
            width,
            on
        }
    }

    getFillBrush(on, width, color)
    {
        color = color.match(/rgba?\((.*)\)/)[1].split(',')
            .map(parseFloat)

        color[3] = Math.round(color[3] * 255)

        this.editor.filler.color = color

        return {
            cursor: fillCursor(),
            brush: this.editor.filler,
            width,
            color,
            on
        }
    }

    getEraserBrush(on, width, scale, alpha, soft)
    {
        const color = 'rgba(255,255,255,.5)'

        this.editor.eraser.alpha = alpha
        this.editor.eraser.soft = soft

        if (width < 5) width = 5

        return {
            cursor: circleCursor(width, scale, color),
            brush: this.editor.eraser,
            width,
            on
        }
    }

    setOptions({ strokeWidth: width, fill: color, magicThreshold: magic, alpha, blur, bulge, sharp, soft })
    {
        this.optionsAssign({ sharp, width, color, alpha, magic, bulge, blur, soft })

        this.on && this.onMode(true)
    }

    setScale({ scale = 1 })
    {
        this.state.options.scale = scale

        this.on && this.onMode(true)
    }

    onMode(on = false)
    {
        if (!this.editor.canvas) return

        let { alpha, blur, bulge, magic, sharp, soft, color, scale, width } = this.state.options,
            set = { cursor: 'crosshair', color: color || 'rgb(0,0,0)', width: width || 1, on };

        Fabric.resolve().then(f => {
            fabric = f

            set.brush = this.getDefaultBrush()

            switch (this.state.mode) {
                case Brush.DESATURATE:
                    set = this.getDesaturateBrush(on, width, scale)
                    break
                case Brush.SHARPEN:
                    set = this.getSharpenBrush(on, width, scale, sharp)
                    break
                case Brush.MAGIC:
                    set = this.getMagicWandBrush(on, width, magic)
                    break
                case Brush.CLONE:
                    set = this.getCloneBrush(on, width, scale)
                    break
                case Brush.BULGE:
                    set = this.getBulgeBrush(on, width, scale, bulge)
                    break
                case Brush.BLUR:
                    set = this.getBlurBrush(on, width, scale, blur)
                    break
                case Brush.FILL:
                    set = this.getFillBrush(on, width, color)
                    break
                case Brush.ERASE:
                    set = this.getEraserBrush(on, width, scale, alpha, soft)
                    break
                case Brush.PATTERN:
                    set.brush = this.getPattern(on, width, scale)
                    break
                case Brush.CIRCLE:
                    set.brush = this.getCircle(on, width, scale)
                    break
                case Brush.SPRAY:
                    set.brush = this.getSpray(on, width, scale,)
                    break
                case Brush.PENCIL:
                    break

                default:
                    set.on = false
            }

            this.setBrush(set)
        })
    }

    setBrush({ on, color, width, brush, cursor })
    {
        this.editor.canvas.freeDrawingCursor = cursor
        this.editor.canvas.freeDrawingBrush = brush

        this.editor.canvas.freeDrawingBrush.color = color
        this.editor.canvas.freeDrawingBrush.width = width

        this.editor.canvas.isDrawingMode = on
    }
}
