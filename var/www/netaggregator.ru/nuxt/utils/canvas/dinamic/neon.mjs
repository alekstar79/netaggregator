import { TextRenderer, textBaselineTypes, textAlignTypes, drawTypes } from '../text-renderer.mjs'
import { PropsArray, rand, dist, angle, lerp, cos, sin, pow } from '../../toolkit.mjs'
import { DrawBuffer } from './draw-buffer.mjs'

// import { rgbToHex } from '../../common/rgb-to-hex.mjs'
import { hexToRgbA } from '../../common/hex-to-rgba.mjs'

const options = {
    message: 'NetAggregator\nPRO',
    fontFamily: 'Casper-Bold',
    fontSize: 96,
    fontColor: [60, 200, 255, 255], // #3cc8ff
    drawType: drawTypes.FILL,
    align: textAlignTypes.CENTER,
    baseline: textBaselineTypes.BOTTOM,
    horizontal: .9,
    vertical: .4,

    get fontStyle() {
        return `${this.fontSize}px ${this.fontFamily}, sans-serif`
    },

    mouse: { lerpAmt: .5, repelThreshold: 100 },
    particles: {
        pLerpAmt: .25,
        vLerpAmt: .1,
        density: 3,

        get pixelDensity() {
            return (4 - this.density) * 4
        }
    }
}

export class Neon extends DrawBuffer
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

    /* get color()
    {
        const fn = (a, c, i) => ({ ...a, [['r','g','b'][i]]: c }),
            { fontColor: c } = options

        return rgbToHex(c.slice(0, -1).reduce(fn, {}))
    }

    set color(hex)
    {
        options.fontColor = Object.values(hexToRgbA(hex, 255))
    } */

    constructor({ layer: { w, h } })
    {
        super(w, h, ['x','y','vx','vy','bx','by'])

        this.renderer = new TextRenderer(this)

        this.background = 'rgba(0,0,0,1)'
        this.color = '#3cc8ff'

        this.mapParticles()
    }

    setColor(hex, opacity = 255)
    {
        options.fontColor = Object.values(hexToRgbA(hex, opacity))

        this.color = hex
    }

    setBackground(rgba)
    {
        this.background = rgba
    }

    mapParticles()
    {
        try {

            this.ctx.clearRect(0, 0, this.w, this.h)

            this.renderer.renderText(this.options)
            // this.setTextStyles()
            // this.drawMessage()

            const { data } = this.ctx.getImageData(0, 0, this.w, this.h),
                pixelData = new Uint32Array(data),
                pixels = []

            let { particles } = this.options,
                i, x, y, bx, by, vx, vy

            for (i = 0; i < pixelData.length; i += 4) {
                if (pixelData[i + 3] && !(i % particles.pixelDensity)) {
                    x = rand(this.w) | 0
                    y = rand(this.h) | 0
                    bx = (i / 4) % this.w
                    by = ((i / 4) / this.w) | 0
                    vx = 0
                    vy = 0

                    pixels.push(x, y, vx, vy, bx, by)
                }
            }

            this.particles = new PropsArray(pixels.length / this.pProps.length, this.pProps)
            this.particles.set(pixels, 0)

        } catch (e) {
        }
    }

    updatePixelCoords(x, y, vx, vy, bx, by)
    {
        const { mouse, particles } = this.options

        let rd, dx, dy, phi, f

        rd = dist(x, y, this.repelx, this.repely)
        phi = angle(this.repelx, this.repely, x, y)
        f = (pow(mouse.repelThreshold, 2) / rd) * (rd / mouse.repelThreshold)

        dx = bx - x
        dy = by - y

        vx = lerp(vx, dx + (cos(phi) * f), particles.vLerpAmt)
        vy = lerp(vy, dy + (sin(phi) * f), particles.vLerpAmt)

        x = lerp(x, x + vx, particles.pLerpAmt)
        y = lerp(y, y + vy, particles.pLerpAmt)

        return [x, y, vx, vy]
    }

    render(ctx)
    {
        ctx.clearRect(0, 0, this.w, this.h)

        this.drawParticles(this.options.fontColor)

        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = this.background
        ctx.fillRect(0, 0, this.w, this.h)

        ctx.save()
        ctx.filter = 'blur(8px) brightness(200%)'
        ctx.drawImage(this.ctx.canvas, 0, 0, this.w, this.h)
        ctx.restore()

        ctx.save()
        ctx.filter = 'blur(0)'
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(this.ctx.canvas, 0, 0, this.w, this.h)
        ctx.restore()
    }
}
