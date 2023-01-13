const { random } = Math

export class Star
{
    constructor({ w, h, velocity: v = 1, star })
    {
        this.x = random() * w
        this.y = random() * h

        this.vx = random() * (random() > .5 ? v : -v)
        this.vy = random() * (random() > .5 ? v : -v)

        this.radius = star.random
            ? random() * star.width
            : star.width
    }

    update({ w, h })
    {
        if (this.y < 0 || this.y > h) {
            this.vy = -this.vy

        } else if (this.x < 0 || this.x > w) {
            this.vx = -this.vx
        }

        this.x += this.vx
        this.y += this.vy
    }

    render(ctx)
    {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fill()
    }
}
