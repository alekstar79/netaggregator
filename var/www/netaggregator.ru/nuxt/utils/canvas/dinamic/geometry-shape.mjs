import { fadeInOut, randRange, rand, TO_RAD, round, cos, sin, floor } from '../../toolkit.mjs'

export class GeometryShape
{
    constructor(x, y)
    {
        this.position = { x, y }
        this.size = 2 + rand(20)
        this.speed = 2 + rand(5)

        this.direction = (floor(rand(6)) * 60) * TO_RAD
        this.directionChangeRate = 20 + round(rand(10))
        this.turnDirection = randRange(1) * .1

        this.hue = rand(90) + 180
        this.ttl = rand(90) + 100

        this.destroy = false
        this.life = 0
    }

    update()
    {
        this.destroy = this.life++ > this.ttl
        this.direction += (this.life % this.directionChangeRate) === 0 && round(randRange(1)) * 60 * TO_RAD
        this.velocity = fadeInOut(this.life, this.ttl) * this.speed
        this.position.x += cos(this.direction) * this.velocity
        this.position.y += sin(this.direction) * this.velocity
    }

    draw(ctx)
    {
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = `hsla(${this.hue},100%,50%,${fadeInOut(this.life, this.ttl)})`
        ctx.strokeRect(this.position.x - (.5 * this.size), this.position.y - (.5 * this.size), this.size, this.size)
        ctx.closePath()
    }
}
