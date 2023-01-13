import { debounce } from '../../common/debounce.mjs'
import { Star } from './star.mjs'

const { round, sqrt, min } = Math

const options = {
    background: '#006DBC',
    color: '#FFF',
    nop: 100
}

export class CosmoParticles
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

    set color(v) {
        options.color = v
    }

    get color() {
        return options.color
    }

    set background(v) {
        options.background = v
    }

    get background() {
        return options.background
    }

    constructor({ layer: { w, h } })
    {
        this.debounceCreate = debounce.call(this, this.createStars, 100)

        this.position = { x: 0, y: 0 }
        this.star = { random: true, width: 3 }
        this.line = { width: .2 }

        this.radius = min(w, h) / 6
        this.distance = 1.2 * this.radius
        this.velocity = 1

        this.stars = []

        this.w = w
        this.h = h

        this.nop = round(w * h / (10 * sqrt(w * h))) // 640 - 55, 1024 - 88, 1920 - 144; 1590 - 91

        this.createStars()
    }

    setColor(hex)
    {
        options.color = hex
    }

    setBackground(hex)
    {
        options.background = hex
    }

    createStars()
    {
        this.stars = []

        if (!this.nop) {
            this.nop = round(this.w * this.h / (10 * sqrt(this.w * this.h)))
        }
        for (let i = 0; i < this.nop; ++i) {
            this.stars[i] = new Star(this)
        }
    }

    update(correction, { mouse })
    {
        if (mouse.on) {
            this.position.x = mouse.x
            this.position.y = mouse.y
        }
        if (!this.stars.length) {
            this.createStars()
        }

        this.stars.forEach(c => c.update(this))
    }

    render(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = this.background

        ctx.fillRect(0, 0, this.w, this.h)

        ctx.lineWidth = this.line.width
        ctx.strokeStyle = this.color
        ctx.fillStyle = this.color

        this.stars.forEach(c => c.render(ctx))

        this.drawLines(ctx)
    }

    drawLines(ctx)
    {
        let iStar, jStar, i, j

        for (i = 0; i < this.stars.length; i++) {
            for (j = 0; j < this.stars.length; j++) {
                iStar = this.stars[i]
                jStar = this.stars[j]

                if ((iStar.x - jStar.x) < this.distance &&
                    (iStar.y - jStar.y) < this.distance &&
                    (iStar.x - jStar.x) > -this.distance &&
                    (iStar.y - jStar.y) > -this.distance
                ) {
                    if ((iStar.x - this.position.x) < this.radius &&
                        (iStar.y - this.position.y) < this.radius &&
                        (iStar.x - this.position.x) > -this.radius &&
                        (iStar.y - this.position.y) > -this.radius
                    ) {
                        ctx.beginPath()
                        ctx.moveTo(iStar.x, iStar.y)
                        ctx.lineTo(jStar.x, jStar.y)
                        ctx.stroke()
                        ctx.closePath()
                    }
                }
            }
        }
    }
}
