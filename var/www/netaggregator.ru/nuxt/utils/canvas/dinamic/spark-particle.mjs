function random(...args)
{
    const min = args.length === 1 ? 0 : args[0],
        max = args.length === 1 ? args[0] : args[1]

    return Math.random() * (max - min) + min
}

export class Particle
{
    constructor(x, y)
    {
        this.maxLife = random(15)

        this.vx = random(-1, 1)
        this.vy = random(-1, 1)

        this.origX = this.x = x
        this.origY = this.y = y

        this.grav = .07
        this.life = 0
    }

    draw(ctx, { size, color })
    {
        ctx.fillStyle = color // this.color
        ctx.fillRect(this.x, this.y, size, size)
    }

    update(correction, { hue })
    {
        if (this.life >= this.maxLife) {
            this.reset(hue)
        }

        this.vy += this.grav
        this.x += this.vx
        this.y += this.vy

        this.life++
    }

    reset(/* hue */)
    {
        this.vx = random(-1, 1)
        this.vy = random(-1, 1)

        this.x = this.origX
        this.y = this.origY

        // this.color = `hsl(${hue}, 100%, 50%)`
        this.life = 0
    }
}
