import { createRenderingContext, cos, sin } from '../../toolkit.mjs'
import { rgbaStringify } from '../../common/rgba-stringify.mjs'
import { hexToRgbA } from '../../common/hex-to-rgba.mjs'

import { GeometryShape } from './geometry-shape.mjs'

const options = {
    bgColor: 'rgba(5,2,47,.05)',
    control: 'rgba(0,0,0,0)',
    mouse: {}
}

export class Geometry
{
    get x() {
        return options.mouse.x
    }

    set x(v) {
        options.mouse.x = v
    }

    get y() {
        return options.mouse.y
    }

    set y(v) {
        options.mouse.y = v
    }

    constructor({ layer: { w, h } })
    {
        options.mouse = { x: w / 2, y: h / 2 }

        this.mouse = { x: w / 2, y: h / 2, on: false }
        this.background = '#05022F'
        this.particles = []
        this.tick = 0
        this.w = w
        this.h = h

        this.createContext()
    }

    createContext()
    {
        this.buffer = createRenderingContext(this.w, this.h)
    }

    setBackground(hex)
    {
        options.bgColor = rgbaStringify(hexToRgbA(hex, .05))

        this.background = hex
    }

    update(correction = 0, app)
    {
        this.tick++
        this.mouse = { ...this.mouse, ...app.mouse }

        if (this.mouse.on) {
            this.x = this.mouse.x
            this.y = this.mouse.y

        } else {
            this.mouse.x = this.x + cos(this.tick * .05) * 100
            this.mouse.y = this.y + sin(this.tick * .05) * 100
        }
        if (this.tick % 2 === 0) {
            this.particles.push(new GeometryShape(this.mouse.x, this.mouse.y))
        }

        this.buffer.clearRect(0, 0, this.w, this.h)

        for (let i = this.particles.length - 1; i >= 0; --i) {
            this.particles[i].update(this.tick)
            this.particles[i].draw(this.buffer)

            if (this.particles[i].destroy) {
                this.particles.splice(i, 1)
            }
        }
    }

    render(ctx)
    {
        if (options.bgColor !== options.control) {
            this.renderCover(ctx)
        }

        this.renderBackground(ctx)
        this.renderGlow(ctx)
        this.renderShapes(ctx)
    }

    renderCover(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = this.background
        ctx.fillRect(0, 0, this.w, this.h)

        options.control = options.bgColor
    }

    renderBackground(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = options.bgColor
        ctx.fillRect(0, 0, this.w, this.h)
    }

    renderGlow(ctx)
    {
        ctx.save()
        ctx.filter = 'blur(8px)'
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(this.buffer.canvas, 0, 0)
        ctx.restore()
    }

    renderShapes(ctx)
    {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(this.buffer.canvas, 0, 0)
        ctx.restore()
    }
}
