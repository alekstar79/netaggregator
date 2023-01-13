import { TextRenderer, textBaselineTypes, textAlignTypes, drawTypes } from '../text-renderer.mjs'
import { Particle } from './spark-particle.mjs'

import { debounce } from '../../common/debounce.mjs'

export const options = {
    message: 'NetAggregator\nPRO',
    fontFamily: 'Casper-Bold',
    fontSize: 96,
    drawType: drawTypes.FILL,
    align: textAlignTypes.CENTER,
    baseline: textBaselineTypes.BOTTOM,
    horizontal: .9,
    vertical: .4,

    get fontStyle() {
        return `${this.fontSize}px ${this.fontFamily}, sans-serif`
    }
}

export class Sparkling
{
    get options()
    {
        return options
    }

    set options(v)
    {
        Object.assign(options, v)

        this.mapParticles()
    }

    constructor({ layer: { w, h } })
    {
        this.mapParticles = debounce.call(this, this.mapParticles, 100)

        this.scene = document.createElement('canvas')
        this.ctx = this.scene.getContext('2d')

        this.scene.height = h
        this.scene.width = w

        this.background = '#08174C'
        this.color = '#fff'

        this.centerx = w / 2
        this.centery = h / 2

        this.size = 1
        this.hue = 0

        this.w = w
        this.h = h

        this.dataset = []

        this.renderer = new TextRenderer(this)

        this.mapParticles()
    }

    setColor(hex)
    {
        this.color = hex
    }

    setBackground(hex)
    {
        this.background = hex
    }

    /* setTextStyles()
    {
        const { align, baseline, fontStyle } = this.options

        this.setTextBaseline(baseline)
        this.setTextAlign(align)
        this.setFont(fontStyle)
    }

    setTextBaseline(baseline = textBaselineTypes.ALPHABETIC)
    {
        this.ctx.textBaseline = baseline
    }

    setTextAlign(align = textAlignTypes.LEFT)
    {
        this.ctx.textAlign = align
    }

    setFont(font)
    {
        this.ctx.font = font
    } */

    mapParticles()
    {
        this.ctx.clearRect(0, 0, this.w, this.h)

        this.renderer.renderText(this.options)
        // this.setTextStyles()
        // this.drawMessage()

        this.dataset = []

        const imgData = this.ctx.getImageData(0, 0, this.w, this.h),
            pixels = imgData.data

        for (let y = 0; y < imgData.height; y += 3) {
            for (let x = 0; x < imgData.width; x += 3) {
                if (pixels[((imgData.width * y) + x) * 4 + 3] > 0) {
                    this.dataset.push(new Particle(x, y))
                }
            }
        }
    }

    /* drawMessage()
    {
        const { centerx, centery, options } = this

        this.drawText(
            options.message,
            centerx,
            centery,
            options.drawType
        )
    }

    drawText(str = '', x = 0, y = 0, type = drawTypes.FILL)
    {
        this.ctx[`${type}Text`](str, x, y)
    } */

    update(correction, app)
    {
        this.mouse = { ...this.mouse, ...app.mouse }

        this.dataset.forEach(p => p.update(correction, this))

        // this.hue += 1
    }

    render(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'

        ctx.fillStyle = this.background
        ctx.fillRect(0, 0, this.w, this.h)

        this.dataset.forEach(p => p.draw(ctx, this))
    }
}
