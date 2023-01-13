import { PropsArray, angle, lerp, dist, sin, cos, pow } from '../../toolkit.mjs'
import { DrawBuffer } from './draw-buffer.mjs'

export class Grid extends DrawBuffer
{
    constructor({ layer: { w, h } })
    {
        super(w, h, ['x','y','vx','vy','bx','by'])

        this.options = {
            particles: { color: [60, 200, 255, 255], pLerpAmt: .25, vLerpAmt: .1 },
            mouse: { lerpAmt: .25, repelThreshold: 80 }
        }

        this.background = '#000'
        this.pCount = w * h / 4

        this.mapParticles()
    }

    mapParticles()
    {
        const { data } = this.buffer.getImageData(0, 0, this.w, this.h),
            pixelData = new Uint32Array(data),
            pixels = []

        let i, x, y, bx, by, vx, vy

        for (i = 0; i < pixelData.length; i += 4) {
            if (!(i % 24)) {
                x = bx = i / 4 % this.w
                y = by = i / 4 / this.w | 0

                vx = vy = 0

                pixels.push(x, y, vx, vy, bx, by)
            }
        }

        this.particles = new PropsArray(this.pCount, this.pProps)
        this.particles.set(pixels, 0)
    }

    updatePixelCoords(x, y, vx, vy, bx, by)
    {
        const { mouse, particles } = this.options

        let rd, dx, dy, phi, f

        rd = dist(x, y, this.repelx, this.repely)
        phi = angle(this.repelx, this.repely, x, y)
        f = pow(mouse.repelThreshold, 2) / rd

        dx = bx - x
        dy = by - y

        vx = lerp(vx, dx + cos(phi) * f, particles.vLerpAmt)
        vy = lerp(vy, dy + sin(phi) * f, particles.vLerpAmt)

        x = lerp(x, x + vx, particles.pLerpAmt)
        y = lerp(y, y + vy, particles.pLerpAmt)

        return [x, y, vx, vy]
    }

    render(ctx)
    {
        this.drawParticles(this.options.particles.color)

        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = this.background
        ctx.fillRect(0, 0, this.w, this.h)

        ctx.save()
        ctx.filter = 'blur(4px) saturate(200%)'
        ctx.drawImage(this.buffer.canvas, 0, 0, this.w, this.h)
        ctx.restore()

        ctx.save()
        ctx.filter = 'blur(0)'
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(this.buffer.canvas, 0, 0, this.w, this.h)
        ctx.restore()
    }
}
