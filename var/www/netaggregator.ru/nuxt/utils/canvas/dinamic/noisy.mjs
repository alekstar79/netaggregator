import { debounce } from '../../common/debounce.mjs'
import { Circle } from './noisy-circle.mjs'

const options = { circlesNum: 40, radius: 300, noise: 40, size: 300 }

export class Noisy
{
    set circlesNum(v) {
        if (options.circlesNum !== v) {
            options.circlesNum = v

            this.createCircles()
        }
    }

    get circlesNum() {
        return options.circlesNum
    }

    set radius(v) {
        if (options.radius !== v) {
            options.radius = v

            this.createCircles()
        }
    }

    get radius() {
        return options.radius
    }

    set noise(v) {
        if (options.noise !== v) {
            options.noise = v

            this.createCircles()
        }
    }

    get noise() {
        return options.noise
    }

    set size(v) {
        if (options.size !== v) {
            options.size = v

            this.createCircles()
        }
    }

    get size() {
        return options.size
    }

    constructor({ layer: { w, h } })
    {
        this.createCircles = debounce.call(this, this.createCircles, 100)

        this.background = '#110119'
        this.color = '#FFFFFF'

        this.circlesNum = 40
        this.speed = .3

        this.circles = []

        this.w = w
        this.h = h

        this.createCircles()
    }

    setColor(hex)
    {
        this.color = hex
    }

    setBackground(hex)
    {
        this.background = hex
    }

    X(x)
    {
        return this.w / 2 + x
    }

    Y(y)
    {
        return this.h / 2 - y
    }

    createCircles()
    {
        const { circles = [], circlesNum } = this

        if (circles.length > circlesNum) {
            this.circles.splice(0, circles.length - circlesNum)
        }
        for (let i = 0; i < this.circlesNum; ++i) {
            this.circles[i] = new Circle(i, this)
        }
    }

    update(/* correction, mouse */)
    {
        //
    }

    render(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = this.background
        ctx.fillRect(0, 0, this.w, this.h)

        if (!this.circles) return

        this.circles.forEach(c => {
            for (let i = 0; i < this.size; ++i) {
                const a = i * Math.PI * 2 / this.size

                ctx.fillStyle = this.color

                ctx.fillRect(
                    this.X(Math.cos(a) * (c.r - c.val * Math.cos(i / 4))),
                    this.Y(Math.sin(a) * (c.r - c.val * Math.cos(i / 4))),
                    1,
                    1
                )
            }

            c.update()
        })
    }
}
