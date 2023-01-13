export class Particle
{
    constructor(x, y, directionX, directionY, size)
    {
        this.directionX = directionX
        this.directionY = directionY
        this.radius = size

        this.x = x
        this.y = y
    }

    mouseRecalc(w, h, mouse)
    {
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y

        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < mouse.radius + this.radius) {
            let s10 = this.radius * 10

            if (mouse.x < this.x && this.x < w - s10) {
                this.x += 10
            }
            if (mouse.x > this.x && this.x > s10) {
                this.x -= 10
            }
            if (mouse.y < this.y && this.y < h - s10) {
                this.y += 10
            }
            if (mouse.y > this.y && this.y > s10) {
                this.y -= 10
            }
        }
    }

    update({ w, h, mouse })
    {
        if (this.x > w || this.x < 0) {
            this.directionX = -this.directionX
        }
        if (this.y > h || this.y < 0) {
            this.directionY = -this.directionY
        }
        if (mouse.on) {
            this.mouseRecalc(w, h, mouse)
        }

        this.x += this.directionX
        this.y += this.directionY
    }

    render(ctx)
    {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fill()
    }
}
