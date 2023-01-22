/**
* @see https://stackoverflow.com/a/31349123/6399083
* @see http://jsfiddle.net/Makallus/hyyvpp8g
*/

const options = { text: '', curve: '' }

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
function BezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY)
{
    this.mx = (3 * (1 - t) * (1 - t) * (control1X - startX)) + ((6 * (1 - t) * t) * (control2X - control1X)) + (3 * t * t * (endX - control2X))
    this.my = (3 * (1 - t) * (1 - t) * (control1Y - startY)) + ((6 * (1 - t) * t) * (control2Y - control1Y)) + (3 * t * t * (endY - control2Y))
}

// linear bezier curve plotter; used recursivly in the quadratic bezier curve calculation
function Bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y)
{
    this.x = ((1 - t) * (1 - t) * startX) + (2 * (1 - t) * t * control1X) + (t * t * control2X)
    this.y = ((1 - t) * (1 - t) * startY) + (2 * (1 - t) * t * control1Y) + (t * t * control2Y)
}

// quadratic bezier curve plotter
function Bezier2(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY)
{
    this.Bezier1 = new Bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y)
    this.Bezier2 = new Bezier1(t, control1X, control1Y, control2X, control2Y, endX, endY)

    this.x = ((1 - t) * this.Bezier1.x) + (t * this.Bezier2.x)
    this.y = ((1 - t) * this.Bezier1.y) + (t * this.Bezier2.y)

    this.slope = new BezierT(t,startX, startY, control1X, control1Y, control2X, control2Y, endX, endY)
    this.point = { t, x: this.x, y: this.y, mX: this.slope.mx, mY: this.slope.my }
}

class CurvedText
{
    set points(v) {
        if (options.curve !== v) {
            options.curve = v
            this.onChange()
        }
    }

    get points() {
        return options.curve.split(',').filter(Boolean).map(parseFloat)
    }

    set text(v) {
        if (options.text !== v) {
            options.text = v
            this.onChange()
        }
    }

    get text() {
        return options.text
    }

    constructor(canvas)
    {
        this.ctx = canvas.getContext('2d')
        this.ctx.font = '30px arial black'
        this.ctx.fillStyle = 'black'

        this.height = canvas.height
        this.width = canvas.width

        this.lineWidth = 2
        this.timeout = null
    }

    onChange()
    {
        this.timeout && clearTimeout(this.timeout)

        this.timeout = setTimeout(() => {
            if (this.points.length === 8) {
                this.ribbon = {
                    startX: this.points[0],
                    startY: this.points[1],
                    control1X: this.points[2],
                    control1Y: this.points[3],
                    control2X: this.points[4],
                    control2Y: this.points[5],
                    endX: this.points[6],
                    endY: this.points[7]
                }

                this.clearCanvas()
                this.drawText()
                this.drawUnderline()
            }
        })
    }

    drawUnderline()
    {
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.moveTo(this.ribbon.startX, this.ribbon.startY + this.lineWidth + 2)
        this.ctx.lineWidth = this.lineWidth

        this.ctx.bezierCurveTo(
            this.ribbon.control1X, this.ribbon.control1Y + this.lineWidth + 2,
            this.ribbon.control2X, this.ribbon.control2Y + this.lineWidth + 2,
            this.ribbon.endX,
            this.ribbon.endY + this.lineWidth + 2
        )

        this.ctx.stroke()
        this.ctx.restore()
    }

    drawText()
    {
        let a, b, c, p, w, ww, z, letterPadding, totalPadding, totalLength, cDist, xDist = 0, textCurve = [], sample = 1000

        for (let i = 0; i < sample; i++) {
            a = new Bezier2(i / sample, this.ribbon.startX, this.ribbon.startY, this.ribbon.control1X, this.ribbon.control1Y, this.ribbon.control2X, this.ribbon.control2Y, this.ribbon.endX, this.ribbon.endY)
            b = new Bezier2((i + 1) / sample, this.ribbon.startX, this.ribbon.startY, this.ribbon.control1X, this.ribbon.control1Y, this.ribbon.control2X, this.ribbon.control2Y, this.ribbon.endX, this.ribbon.endY)
            c = new Bezier(a, b, xDist)

            textCurve.push({ bezier: a, curve: c.curve })
            xDist += c.dist
        }

        // letterPadding = this.ctx.measureText(' ').width / 4
        letterPadding = 0

        w = this.text.length
        ww = Math.round(this.ctx.measureText(this.text).width)

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
            this.ctx.save()
            this.ctx.translate(textCurve[p].bezier.point.x, textCurve[p].bezier.point.y)
            this.ctx.rotate(textCurve[p].curve.rad)
            this.ctx.fillText(this.text[i], 0, 0)
            this.ctx.restore()

            x1 = this.ctx.measureText(this.text[i]).width + letterPadding
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

    clearCanvas()
    {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }
}

const cText = new CurvedText(document.getElementById('canvas'))
const curve = document.getElementById('curve')
const text = document.getElementById('text')

curve.addEventListener('keyup', ({ target }) => {
    cText.points = target.value
})

text.addEventListener('keyup', ({ target }) => {
    cText.text = target.value
})

cText.points = curve.value
cText.text = text.value
