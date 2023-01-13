import { debounce } from '../../common/debounce.mjs'

const b64data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAI0lEQVQIW2NkwAT/GdHE/gP5jMiCYAGQIpggXAAmiCIAEgQAAE4FBbECyZcAAAAASUVORK5CYII='
const colors = ['255,255,255', '255,99,71', '19,19,19']

const options = {
    numParticles: 75,

    border: false,
    blurry: true,

    minRadius: 10,
    maxRadius: 35
}

function noop() {}

export class Balloons
{
    set border(v) {
        if (options.border !== v) {
            options.border = v
            this.createBalloons()
        }
    }

    get border() {
        return options.border
    }

    set blurry(v) {
        if (options.blurry !== v) {
            options.blurry = v
            this.createBalloons()
        }
    }

    get blurry() {
        return options.blurry
    }

    set minRadius(v) {
        if (options.minRadius !== v) {
            options.minRadius = v
            this.createBalloons()
        }
    }

    get minRadius() {
        return options.minRadius
    }

    set maxRadius(v) {
        if (options.maxRadius !== v) {
            options.maxRadius = v
            this.createBalloons()
        }
    }

    get maxRadius() {
        return options.maxRadius
    }

    set numParticles(v) {
        if (options.numParticles !== v) {
            options.numParticles = v
            this.createBalloons()
        }
    }

    get numParticles() {
        return options.numParticles
    }

    constructor({ layer: { w, h, context } }, options = {})
    {
        this.mouse = { on: false, x: null, y: null }

        this.b64data = options.b64data || b64data
        this.pattern = options.pattern || null
        this.bgImage = options.bgImage || null

        this.minOpacity = options.minOpacity || .01
        this.maxOpacity = options.maxOpacity || .5
        this.minSpeed = options.minSpeed || .05
        this.maxSpeed = options.maxSpeed || .5

        this.colors = options.colors || colors
        this.background = '#2B2B2B'

        this.particle = []

        this.w = w
        this.h = h

        this.createBalloons = debounce.call(this, this.createBalloons, 0)
        this.createBalloons()

        this.loadPattern(context, this.b64data)
            .then(pattern => {
                this.pattern = pattern
            }).catch(noop)
    }

    static _rand(min, max)
    {
        return Math.random() * (max - min) + min
    }

    loadPattern(ctx, src)
    {
        const img = new Image()

        return new Promise((resolve, reject) => {
            img.onerror = reject

            img.onload = () => {
                resolve(ctx.createPattern(img, 'repeat'))
            }

            img.src = src
        })
    }

    createBalloons()
    {
        const { particle: { length }, numParticles } = this

        if (length > numParticles) {
            this.particle.splice(0, length - numParticles)
        }
        for (let i = 0; i < this.numParticles; i++) {
            const color = this.colors[~~(Balloons._rand(0, this.colors.length))]

            this.particle[i] = {
                color: `rgba(${color},${Balloons._rand(this.minOpacity, this.maxOpacity)})`,
                xVelocity: Balloons._rand(this.minSpeed, this.maxSpeed),
                yVelocity: Balloons._rand(this.minSpeed, this.maxSpeed),
                radius: Balloons._rand(this.minRadius, this.maxRadius),
                xPos: Balloons._rand(0, this.w),
                yPos: Balloons._rand(0, this.h)
            }
        }
    }

    update(correction, app)
    {
        this.mouse = { ...this.mouse, ...app.mouse }
    }

    render(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = this.background

        ctx.fillRect(0, 0, this.w, this.h)

        if (this.background) {
            ctx.fillStyle = this.background
            ctx.fillRect(0, 0, this.w, this.h)
        }
        if (this.pattern) {
            ctx.fillStyle = this.pattern
            ctx.fillRect(0, 0, this.w, this.h)
        }

        this.particle.forEach((_, i) => {
            this.particle[i].xPos += this.particle[i].xVelocity
            this.particle[i].yPos -= this.particle[i].yVelocity

            if (this.particle[i].xPos > this.w + this.particle[i].radius ||
                this.particle[i].yPos > this.h + this.particle[i].radius) {
                this.resetParticle(ctx, i)
            } else {
                this.draw(ctx, i)
            }
        })
    }

    draw(ctx, i)
    {
        if (this.blurry === true) {
            const grd = ctx.createRadialGradient(
                this.particle[i].xPos,
                this.particle[i].yPos,
                this.particle[i].radius,
                this.particle[i].xPos,
                this.particle[i].yPos,
                this.particle[i].radius / 1.25
            )

            grd.addColorStop(0.0, 'rgba(34, 34, 34, 0)')
            grd.addColorStop(1.0, this.particle[i].color)

            ctx.fillStyle = grd

        } else {
            ctx.fillStyle = this.particle[i].color
        }
        if (this.border === true) {
            ctx.strokeStyle = '#fff'
            ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(this.particle[i].xPos, this.particle[i].yPos, this.particle[i].radius, 0, 2 * Math.PI, false)
        ctx.fill()
    }

    resetParticle(ctx, i)
    {
        const random = Balloons._rand(0, 1)

        if (random > .5) {
            this.particle[i].xPos = -this.particle[i].radius
            this.particle[i].yPos = Balloons._rand(0, this.h)
        } else {
            this.particle[i].xPos = Balloons._rand(0, this.w)
            this.particle[i].yPos = this.h + this.particle[i].radius
        }

        this.draw(ctx, i)
    }
}
