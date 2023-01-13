export class Circle
{
    constructor({ w, h, minRadius, maxRadius })
    {
        this.x = Math.random() * w
        this.y = Math.random() * h

        this.radius = Math.random() * (maxRadius - minRadius) + minRadius
        this.angle = Math.random() * Math.PI * 2

        this.firstColor  = `hsla(${Math.random() * 360}, 100%, 50%, 1)`
        this.secondColor = `hsla(${Math.random() * 360}, 100%, 50%, 0)`
    }

    draw(ctx, { speed })
    {
        this.angle += speed

        const x = this.x + Math.cos(this.angle) * 200
        const y = this.y + Math.sin(this.angle) * 200

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius)

        gradient.addColorStop(0, this.firstColor)
        gradient.addColorStop(1, this.secondColor)

        ctx.globalCompositeOperation = 'overlay'
        ctx.fillStyle = gradient

        ctx.beginPath()
        ctx.arc(x, y, this.radius, 0, Math.PI * 2)
        ctx.fill()
    }
}
