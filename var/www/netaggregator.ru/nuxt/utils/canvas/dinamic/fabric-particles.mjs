import { debounce } from '../../common/debounce.mjs'
import { Particle } from './particle.mjs'

const options = { background: '#006DBC', color: '#FFF', nop: 100 },
    { random, round, sqrt } = Math

/**
* @see https://www.youtube.com/watch?v=d620nV6bp0A
*/
export class FabricParticles
{
    set nop(v) {
        if (options.nop !== v) {
            options.nop = v
            this.debounceCreate()
        }
    }

    get nop() {
        return options.nop
    }

    /**
     * @param {String} v
     */
    set color(v) {
        options.color = v
    }

    get color() {
        return options.color
    }

    /**
     * @param {String} v
     */
    set background(v) {
        options.background = v
    }

    get background() {
        return options.background
    }

    constructor({ layer: { w, h } })
    {
        this.debounceCreate = debounce.call(this, this.createParticles, 100)
        this.mouse = { on: false, radius: (h / 80) * (w / 80), x: null, y: null }
        this.partArray = []
        this.velocity = 1

        this.w = w
        this.h = h

        this.nop = round(w * h / (7 * sqrt(w * h)))

        this.createParticles()
    }

    setColor(hex)
    {
        options.color = hex
    }

    setBackground(hex)
    {
        options.background = hex
    }

    createParticles()
    {
        this.partArray = []

        if (!this.nop) {
            this.nop = round(this.w * this.h / (7 * sqrt(this.w * this.h)))
        }
        for (let i = 0; i < this.nop; ++i) {
            const size = random() * 3 + 1

            const dX = random() * (random() > .5 ? this.velocity : -this.velocity)
            const dY = random() * (random() > .5 ? this.velocity : -this.velocity)
            const x = random() * ((this.w - size * 2) - (size * 2)) + (size * 2)
            const y = random() * ((this.h - size * 2) - (size * 2)) + (size * 2)

            this.partArray[i] = new Particle(x, y, dX, dY, size)
        }
    }

    update(correction, app)
    {
        this.mouse = { ...this.mouse, ...app.mouse }

        if (!this.partArray.length) {
            this.createParticles()
        }

        this.partArray.forEach(c => c.update(this))
    }

    render(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = options.background

        ctx.fillRect(0, 0, this.w, this.h)

        ctx.strokeStyle = options.color
        ctx.fillStyle = options.color
        ctx.lineWidth = .3

        this.partArray.forEach(c => c.render(ctx))

        this.connect(ctx)
    }

    connect(ctx)
    {
        let distance, dx, dy

        for (let a = 0; a < this.partArray.length; a++) {
            for (let b = a; b < this.partArray.length; b++) {
                dx = this.partArray[a].x - this.partArray[b].x
                dy = this.partArray[a].y - this.partArray[b].y

                distance = dx * dx + dy * dy

                if (distance < (this.w / 10) * (this.h / 10)) {
                    // const [_r, _g, _b] = options.color.rgb
                    // ctx.strokeStyle = `rgba(${_r},${_g},${_b},${1 - (distance / 20000)})`

                    ctx.beginPath()
                    ctx.moveTo(this.partArray[a].x, this.partArray[a].y)
                    ctx.lineTo(this.partArray[b].x, this.partArray[b].y)
                    ctx.stroke()
                }
            }
        }
    }
}
