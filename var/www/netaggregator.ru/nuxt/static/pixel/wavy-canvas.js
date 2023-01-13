export class Canvas
{
    get w() {
        return this.cnv.width
    }

    get h() {
        return this.cnv.height
    }

    constructor()
    {
        this.createCanvas()
        this.fitToScreen()
    }

    createCanvas()
    {
        this.cnv = document.createElement('canvas')
        this.ctx = this.cnv.getContext('2d')

        document.body.appendChild(this.cnv)
    }

    fitToScreen()
    {
        this.cnv.height = window.innerHeight
        this.cnv.width = window.innerWidth
    }

    fitTextToCanvas(textWidth)
    {
        return this.w / textWidth * this.h
    }

    drawText(t = 'Wavy Text Animation')
    {
        this.ctx.font = `${this.h}px Arial black`

        const newTextSize = this.fitTextToCanvas(this.ctx.measureText(t).width)

        this.ctx.font = `${newTextSize}px Arial black`

        this.ctx.fillStyle = 'white'
        this.ctx.textBaseline = 'middle' // alphabetic | top | hanging | middle | ideographic | bottom
        this.ctx.fillText(t, 0, -20)

        const fw = this.ctx.measureText(t).width

        return { x: 0, y: 0, w: fw, h: newTextSize }
    }

    createGradient()
    {
        const gradient = this.ctx.createLinearGradient(0, 0, this.w, this.h)

        for (let i = 0; i < 360; i++) {
            gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`)
        }

        this.ctx.fillStyle = gradient
        this.ctx.fillRect(0, 0, this.w, this.h)

        const pic = new Image(this.w, this.h)

        pic.src = this.cnv.toDataURL()

        return pic
    }

    drawImg(img)
    {
        this.compositeOperation('source-atop')
        this.ctx.drawImage(img, 0, 0)
        this.compositeOperation('source-over')
    }

    getImageData({ x, y, w, h })
    {
        return this.ctx.getImageData(x, y, w, h)
    }

    putImageData(d, x, y, dx, dy, dw, dh)
    {
        this.ctx.putImageData(d, x, y, dx, dy, dw, dh)
    }

    compositeOperation(type)
    {
        this.ctx.globalCompositeOperation = type
    }

    rect(c, x, y, w, h)
    {
        this.ctx.fillStyle = c
        this.ctx.fillRect(x, y, w, h)
    }

    clear()
    {
        this.ctx.clearRect(0, 0, this.w, this.h)
    }
}
