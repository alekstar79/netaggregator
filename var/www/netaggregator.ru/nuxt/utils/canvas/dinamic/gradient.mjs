import { debounce } from '../../common/debounce.mjs'
import { Circle } from './gradient-circle.mjs'

const options = {
    circlesNum: 20,
    minRadius: 400,
    maxRadius: 800
}

/**
* @see https://www.youtube.com/watch?v=2k4qqqGoCFA
* @see https://codepen.io/ThreePixDroid/pen/MWeomWp
*/
export class Gradient
{
    set minRadius(v) {
        if (options.minRadius !== v) {
            options.minRadius = v
            this.createCircles()
        }
    }

    get minRadius() {
        return options.minRadius
    }

    set maxRadius(v) {
        if (options.maxRadius !== v) {
            options.maxRadius = v
            this.createCircles()
        }
    }

    get maxRadius() {
        return options.maxRadius
    }

    set circlesNum(v) {
        if (options.circlesNum !== v) {
            options.circlesNum = v
            this.createCircles()
        }
    }

    get circlesNum() {
        return options.circlesNum
    }

    constructor({ layer: { w, h } })
    {
        this.createCircles = debounce.call(this, this.createCircles, 100)
        this.mouse = { on: false, x: null, y: null }
        this.speed = .007

        this.circles = []

        this.w = w
        this.h = h

        this.createCircles()
    }

    createCircles()
    {
        const { circles: { length }, circlesNum } = this

        if (length > circlesNum) {
            this.circles.splice(0, length - circlesNum)
        }
        for (let i = 0; i < this.circlesNum; ++i) {
            this.circles[i] = new Circle(this)
        }
    }

    update(correction = 0, app)
    {
        this.mouse = { ...this.mouse, ...app.mouse }
    }

    render(ctx)
    {
        ctx.clearRect(0, 0, this.w, this.h)

        this.circles.forEach(c => c.draw(ctx, this))
    }
}
