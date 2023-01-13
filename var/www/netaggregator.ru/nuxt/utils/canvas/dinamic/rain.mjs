export class Rain
{
    constructor({ layer: { w, h } })
    {
        this.mouse = { on: false, x: null, y: null }

        this.total = w
        this.size = 1
        this.occupation = 1
        this.length = 200
        this.accelleration = .03
        this.background = '#2b2b2b'
        this.colors = []
        this.dots = []
        this.dotsVel = []

        this.w = w
        this.h = h

        this.calculations()
    }

    setColor(hex)
    {
        // this.color = hex
    }

    setBackground(hex)
    {
        this.background = hex
    }

    calculations()
    {
        const portion = 360 / this.total

        for (let i = 0; i < this.total; ++i) {
            this.dotsVel[i] = Math.random() * 10
            this.dots[i] = this.h + this.length
            this.colors[i] = portion * i
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

        for (let i = 0; i < this.total; ++i) {
            const currentY = this.dots[i] - this.length

            this.dots[i] += this.dotsVel[i] += this.accelleration

            ctx.fillStyle = `hsl(${this.colors[i]}, 80%, 50%)`
            ctx.fillRect(this.occupation * i, currentY, this.size, this.dotsVel[i] + this.length)

            if (this.dots[i] > this.h && Math.random() < .01) {
                this.dots[i] = this.dotsVel[i] = 0
            }
        }
    }
}
