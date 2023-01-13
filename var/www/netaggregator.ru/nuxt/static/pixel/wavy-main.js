import { Canvas } from './wavy-canvas.js'

const PI2 = Math.PI * 2

/**
* @see https://www.youtube.com/watch?v=JqZV_wXDy2w
* @see https://www.youtube.com/watch?v=Md0DQltTx8o
* @see https://codepen.io/ThreePixDroid/pen/QWKMBRW
*/
class Animation
{
    constructor(text, { amplitude = 10, length = 250, waveSpeed = 0, textSpeed = 0, slice = 1 }, image = null)
    {
        this.waveAmplitude = amplitude
        this.waveLength = length

        this.waveSpeed = waveSpeed
        this.textSpeed = textSpeed

        if (!slice || slice <= 0) {
            slice = 1
        }
        if (!textSpeed) {
            text = ` ${text.trim()} `
        }

        this.textSliceWidth = slice
        this.mainText = text

        image
            ? this.loadImg(image)
            : this.init()
    }

    init()
    {
        this.c = new Canvas()
        this.createTextData()

        this.setupProperties()
        this.animate()

        window.addEventListener('resize', () => {
            this.c.fitToScreen()
            this.createTextData()
            this.setupProperties()
        })
    }

    setupProperties()
    {
        this.gradientLayer = this.c.createGradient()
        this.textSlicesCout = this.textArea.w / this.textSliceWidth
        this.textY = (this.c.h - this.textArea.h) / 2
        this.textX = 0
    }

    createTextData()
    {
        this.textArea = this.c.drawText(this.mainText)

        // this.addGradientLayer()
        // this.c.drawImg(this.imgLayer)

        this.textData = this.c.getImageData(this.textArea)
    }

    loadImg(url)
    {
        this.imgLayer = new Image()
        this.imgLayer.onload = this.init.bind(this)
        this.imgLayer.src = url
    }

    wave()
    {
        let waveOffset = new Date().getMilliseconds() / 1000 * PI2 * this.waveSpeed,
            x = this.textX

        for(let i = 0; i < this.textSlicesCout; i++) {
            const xSlicePoint = i * this.textSliceWidth,
                offsetY = Math.sin(waveOffset + xSlicePoint / this.waveLength * PI2) * this.waveAmplitude,
                y = this.textY + offsetY

            if (x + xSlicePoint > this.c.w ) {
                x = x - this.c.w
            } else if (x + xSlicePoint < 0) {
                x = x + this.c.w
            }

            this.c.putImageData(this.textData, x, y, xSlicePoint, 0, this.textSliceWidth, this.textArea.h)
        }

        this.textX = (this.textX + this.textSpeed) % this.c.w
    }

    addGradientLayer()
    {
        this.c.compositeOperation('source-atop')
        this.c.ctx.drawImage(this.c.createGradient(), 0, 0)
        // this.c.ctx.drawImage(this.gradientLayer, 0, 0)
    }

    animate()
    {
        window.requestAnimationFrame(this.animate.bind(this))

        this.c.clear()
        this.wave()

        // this.addGradientLayer()
        this.c.drawImg(this.imgLayer)
    }
}

window.onload = () => {
    new Animation('Half-life ', { amplitude: 10, length: 250, waveSpeed: -1, textSpeed: -2, slice: 1 }, 'alien.jpg')
}
