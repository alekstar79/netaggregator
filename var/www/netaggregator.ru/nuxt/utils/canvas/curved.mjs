import { createRenderingContext } from '../toolkit.mjs'
import { nextFrame } from '../callbacks.mjs'
import { trimCanvas } from './edges.mjs'

// final stage which takes p, p+1 and calculates the rotation, distance on the path and accumulates the total distance
function Bezier(b1, b2, xDist)
{
    this.rad = Math.atan(b1.point.mY / b1.point.mX)
    this.b2 = b2
    this.b1 = b1

    this.dist = Math.sqrt(((b2.x - b1.x) * (b2.x - b1.x)) + ((b2.y - b1.y) * (b2.y - b1.y)))
    this.curve = { rad: this.rad, dist: this.dist, cDist: xDist + this.dist }
}

// calculates the tangent line to a point in the curve; later used to calculate the degrees of rotation at this point
function BezierT(t, startX, startY, c1X, c1Y, c2X, c2Y, endX, endY)
{
    this.mx = (3 * (1 - t) * (1 - t) * (c1X - startX)) + ((6 * (1 - t) * t) * (c2X - c1X)) + (3 * t * t * (endX - c2X))
    this.my = (3 * (1 - t) * (1 - t) * (c1Y - startY)) + ((6 * (1 - t) * t) * (c2Y - c1Y)) + (3 * t * t * (endY - c2Y))
}

// linear bezier curve plotter; used recursivly in the quadratic bezier curve calculation
function Bezier1(t, startX, startY, c1X, c1Y, c2X, c2Y)
{
    this.x = ((1 - t) * (1 - t) * startX) + (2 * (1 - t) * t * c1X) + (t * t * c2X)
    this.y = ((1 - t) * (1 - t) * startY) + (2 * (1 - t) * t * c1Y) + (t * t * c2Y)
}

// quadratic bezier curve plotter
function Bezier2(t, startX, startY, c1X, c1Y, c2X, c2Y, endX, endY)
{
    this.bezier1 = new Bezier1(t, startX, startY, c1X, c1Y, c2X, c2Y)
    this.bezier2 = new Bezier1(t, c1X, c1Y, c2X, c2Y, endX, endY)

    this.x = ((1 - t) * this.bezier1.x) + (t * this.bezier2.x)
    this.y = ((1 - t) * this.bezier1.y) + (t * this.bezier2.y)

    this.slope = new BezierT(t, startX, startY, c1X, c1Y, c2X, c2Y, endX, endY)
    this.point = { t, x: this.x, y: this.y, mX: this.slope.mx, mY: this.slope.my }
}

function calculate({ start, end, control1, control2, sample })
{
    let a, b, c, xDist = 0, textCurve = []

    for (let i = 0; i < sample; i++) {
        a = new Bezier2(i / sample, start.x, start.y, control1.x, control1.y, control2.x, control2.y, end.x, end.y)
        b = new Bezier2((i + 1) / sample, start.x, start.y, control1.x, control1.y, control2.x, control2.y, end.x, end.y)
        c = new Bezier(a, b, xDist)

        textCurve.push({ bezier: a, curve: c.curve })
        xDist += c.dist
    }

    return { textCurve }
}

export const options = () => ({
    cW: 640,
    cH: 480,

    control1: null,
    control2: null,
    start: null,
    end: null,

    text: 'another good day for creativity',
    fontFamily: 'Archive',
    fontStyle: 'normal',       // normal | italic | oblique
    fontWeight: 500,           // normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
    fontSize: null,

    fillStyle: 'rgba(0,0,0,1)',
    charSpacing: null,
    underline: false,
    lineWidth: 2
})

/**
* Maximum size of a canvas element
* @see https://overcoder.net/q/9458/%D0%BC%D0%B0%D0%BA%D1%81%D0%B8%D0%BC%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80-%D1%8D%D0%BB%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%D0%B0-ltcanvasgt#111288
* @see https://overcoder.net/q/9458/%D0%BC%D0%B0%D0%BA%D1%81%D0%B8%D0%BC%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80-%D1%8D%D0%BB%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%D0%B0-ltcanvasgt#111290
* @see https://github.com/jhildenbiddle/canvas-size
* @see https://github.com/adam-roth/wrapped-canvas
*/
export class Curved
{
    set control1(v) {
        if (this._options.control1 !== v) {
            this._options.control1 = v
            this.onChange()
        }
    }

    get control1() {
        return this._options.control1 || { x: .4 * this.cW, y: .20 * this.cH }
    }

    set control2(v) {
        if (this._options.control2 !== v) {
            this._options.control2 = v
            this.onChange()
        }
    }

    get control2() {
        return this._options.control2 || { x: .6 * this.cW, y: .80 * this.cH }
    }

    set start(v) {
        if (this._options.start !== v) {
            this._options.start = v
            this.onChange()
        }
    }

    get start() {
        return this._options.start || { x: .25 * this.cW, y: .5 * this.cH }
    }

    set end(v) {
        if (this._options.end !== v) {
            this._options.end = v
            this.onChange()
        }
    }

    get end() {
        return this._options.end || { x: .75 * this.cW, y: .5 * this.cH }
    }

    /**
     * @param {String} v
     */
    set text(v) {
        if (this._options.text !== v) {
            this._options.text = v
            this.onChange()
        }
    }

    get text() {
        return this._options.text
    }

    set fontWeight(v) {
        if (this._options.fontWeight !== v) {
            this._options.fontWeight = v
            this.onChange()
        }
    }

    get fontWeight() {
        return this._options.fontWeight
    }

    /**
     * @param {String} v
     */
    set fontStyle(v) {
        if (this._options.fontStyle !== v) {
            this._options.fontStyle = v
            this.onChange()
        }
    }

    get fontStyle() {
        return this._options.fontStyle
    }

    set fontSize(v) {
        if (this._options.fontSize !== v) {
            this._options.fontSize = v
            this.onChange()
        }
    }

    get fontSize() {
        return this._options.fontSize || (this.cW === 640 ? 22 : 32)
    }

    /**
     * @param {String} v
     */
    set fontFamily(v) {
        if (this._options.fontFamily !== v) {
            this._options.fontFamily = v
            this.onChange()
        }
    }

    get fontFamily() {
        return this._options.fontFamily
    }

    /**
     * @param {String} v
     */
    set fillStyle(v) {
        if (this._options.fillStyle !== v) {
            this._options.fillStyle = v
            this.onChange()
        }
    }

    get fillStyle() {
        return this._options.fillStyle
    }

    set lineWidth(v) {
        if (this._options.lineWidth !== v) {
            this._options.lineWidth = v
            this.onChange()
        }
    }

    get lineWidth() {
        return this._options.lineWidth
    }

    set charSpacing(v) {
        if (this._options.charSpacing !== v) {
            this._options.charSpacing = v
            this.onChange()
        }
    }

    get charSpacing() {
        return this._options.charSpacing || (this.cW === 640 ? 0 : 1)
    }

    set underline(v) {
        if (this._options.underline !== v) {
            this._options.underline = v
            this.onChange(false)
        }
    }

    get underline() {
        return this._options.underline
    }

    get canvas() {
        return this.output.canvas
    }

    constructor({
        cW = 640,
        cH = 480,

        text = 'another good day for creativity',
        fontFamily = 'Archive',
        fontStyle = 'normal',
        fontWeight = 500,
        fontSize = null,

        fillStyle = 'rgba(0,0,0,1)',
        charSpacing = null,
        underline = false,
        lineWidth = 2,

        control1 = null,
        control2 = null,
        start = null,
        end = null
    } = {}) {

        this.sizes = { left: 0, top: 0, w: cW, h: cH }
        this._options = options()
        this.timeout = null
        this.moving = false
        this.busy = false
        this.cH = cH
        this.cW = cW

        const W = 3 * cW, H = 3 * cH

        this.offset = { x: cW, y: cH }
        this.textContext = createRenderingContext(W, H)
        this.lineContext = createRenderingContext(W, H)
        this.output = createRenderingContext(W, H)
        this.ctx = createRenderingContext(W, H)

        this.fontFamily = fontFamily
        this.fontWeight = fontWeight
        this.fontStyle = fontStyle
        this.fontSize = fontSize

        this.charSpacing = charSpacing
        this.lineWidth = lineWidth
        this.fillStyle = fillStyle
        this.underline = underline

        this.control1 = control1
        this.control2 = control2
        this.start = start
        this.end = end

        this.text = text

        this.directPerform(true)
    }

    onChange(changed = true)
    {
        if (this.busy) return

        this.busy = true

        nextFrame(this.directPerform.bind(this, changed))
    }

    directPerform(changed)
    {
        if (!this.moving && changed) this.drawCache()

        const { left = 0, top = 0, w = this.cW, h = this.cH } = this.calcSizes(!this.moving && changed) || {}

        this.clearCanvas(this.output)
        this.output.drawImage(this.textContext.canvas, left, top, w, h, 0, 0, w, h)

        if (this.underline) {
            this.output.drawImage(this.lineContext.canvas, left, top, w, h, 0, 0, w, h)
        }

        this.busy = false
    }

    adaptSizes(options = {})
    {
        const { start, control1, control2, end, offset } = this

        return {
            start: { x: start.x + offset.x, y: start.y + offset.y },
            control1: { x: control1.x + offset.x, y: control1.y + offset.y },
            control2: { x: control2.x + offset.x, y: control2.y + offset.y },
            end: { x: end.x + offset.x, y: end.y + offset.y },
            ...options
        }
    }

    drawCache()
    {
        this.clearCanvas(this.textContext, this.lineContext)

        this.drawCurve()
        this.drawText()

        this.clearCanvas(this.ctx)

        this.ctx.drawImage(this.textContext.canvas, 0, 0)
        this.ctx.drawImage(this.lineContext.canvas, 0, 0)
    }

    drawCurve(ctx)
    {
        const { start, end, control1, control2 } = this.adaptSizes()

        ctx || (ctx = this.lineContext)

        ctx.strokeStyle = 'rgb(0,148,221)'
        ctx.lineWidth = this.lineWidth

        ctx.save()
        ctx.beginPath()
        ctx.setLineDash([15, 5])
        ctx.moveTo(start.x, start.y + this.lineWidth + 2)

        ctx.bezierCurveTo(
            control1.x, control1.y + this.lineWidth + 2,
            control2.x, control2.y + this.lineWidth + 2,
            end.x,
            end.y + this.lineWidth + 2
        )

        ctx.stroke()
        ctx.restore()
    }

    drawText(ctx)
    {
        ctx || (ctx = this.textContext)

        ctx.font = this.getFontDeclaration()
        ctx.fillStyle = this.fillStyle

        let p, w, ww, z, letterPadding, totalPadding, totalLength, cDist, sample = 1000,
            { textCurve } = calculate(this.adaptSizes({ sample }))

        letterPadding = this.charSpacing

        w = this.text.length
        ww = Math.round(ctx.measureText(this.text).width)

        totalPadding = (w - 1) * letterPadding
        totalLength = ww + totalPadding

        cDist = textCurve[sample - 1].curve.cDist
        z = (cDist / 2) - (totalLength / 2)
        p = 0

        for (let i = 0; i < sample; i++) {
            if (textCurve[i].curve.cDist >= z) {
                p = i
                break
            }
        }
        for (let x1, x2, i = 0; i < w; i++) {
            ctx.save()
            ctx.translate(textCurve[p].bezier.point.x, textCurve[p].bezier.point.y)
            ctx.rotate(textCurve[p].curve.rad)
            ctx.fillText(this.text[i], 0, 0)
            ctx.restore()

            x1 = ctx.measureText(this.text[i]).width + letterPadding
            x2 = 0

            for (let j = p; j < sample; j++) {
                x2 = x2 + textCurve[j].curve.dist

                if (x2 >= x1) {
                    p = j
                    break
                }
            }
        }
    }

    calcSizes(changed)
    {
        return changed ? (this.sizes = trimCanvas(this.ctx, this.output)) : this.sizes
    }

    clearCanvas(...args)
    {
        args.forEach(ctx => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height))
    }

    getFontDeclaration()
    {
        const isLikelyNode = typeof window === 'undefined'

        return [
            (isLikelyNode ? this.fontWeight : this.fontStyle),
            (isLikelyNode ? this.fontStyle : this.fontWeight),
            this.fontSize + 'px',
            (isLikelyNode ? ('"' + this.fontFamily + '"') : this.fontFamily)
        ].join(' ')
    }
}
