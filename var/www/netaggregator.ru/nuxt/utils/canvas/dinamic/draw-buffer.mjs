import { PropsArray, createRenderingContext, lerp } from '../../toolkit.mjs'

const outOfBounds = (x, y, w, h) => x < 1 || x > w - 1 || y < 1 || y > h - 1

export class DrawBuffer
{
    constructor(w, h, props)
    {
        this.particles = new PropsArray(w * h / 4, props)
        this.options = { mouse: { lerpAmt: .25, repelThreshold: 80 } }
        this.mouse = { on: false, x: null, y: null }
        this.pProps = props

        this.centerx = w / 2
        this.centery = h / 2

        this.repelx = this.centerx
        this.repely = this.centery

        this.userx = this.centerx
        this.usery = this.centery

        this.w = w
        this.h = h

        this.createContext(this)
    }

    createContext({ w, h })
    {
        this.ctx = createRenderingContext(w, h)
        this.buffer = this.ctx.createImageData(w, h)
    }

    update(correction, app)
    {
        this.mouse = { ...this.mouse, ...app.mouse }
        this.userx = this.mouse.x
        this.usery = this.mouse.y

        if (this.mouse.on) {
            this.repelx = lerp(this.repelx, this.userx, this.options.mouse.lerpAmt)
            this.repely = lerp(this.repely, this.usery, this.options.mouse.lerpAmt)
        } /* else {
            this.repelx = lerp(this.repelx, this.centerx, this.options.mouse.lerpAmt)
            this.repely = lerp(this.repely, this.centery, this.options.mouse.lerpAmt)
        } */
    }

    updatePixelCoords(...args)
    {
        return args
    }

    drawParticles(color = [60, 200, 255, 255])
    {
        let _x, _y, _g = this.particles.read()

        this.buffer.data.fill(0)

        for (const { index, value: [x, y, vx, vy, bx, by] } of _g) {
            _x = x | 0
            _y = y | 0

            if (!outOfBounds(_x, _y, this.w, this.h)) {
                this.buffer.data.set(color, 4 * (_x + _y * this.w))
            }

            this.particles.set(
                this.updatePixelCoords(x, y, vx, vy, bx, by),
                index
            )
        }

        this.ctx.putImageData(this.buffer, 0, 0)
    }
}
