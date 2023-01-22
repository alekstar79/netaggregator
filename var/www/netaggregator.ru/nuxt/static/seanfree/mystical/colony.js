import { Tentacle, TAU } from './tentacle.js'
import { lerp, rand } from './utils.js'

const { cos, round, sin } = Math

export class Colony
{
    constructor(x, y, radius, tentacleCount)
    {
        this.simplex = new SimplexNoise()

        this.position = [x, y]
        this.radius = radius
        this.tentacles = []
        this.follow = false

        for (let phi, i = 0; i < tentacleCount; i++) {
            phi = i / tentacleCount * TAU

            this.tentacles.push(
                new Tentacle(
                    x + radius * cos(phi),
                    y + radius * sin(phi),
                    round(rand(10)) + 10,
                    round(rand(5)) + 20,
                    phi
                )
            )
        }

        this.setTarget([x, y])
    }

    setCtx(ctx)
    {
        this.ctx = ctx

        for (let i = 0; i < this.tentacles.length; i++) {
            this.tentacles[i].setCtx(ctx)
        }
    }

    setTarget(target)
    {
        this.target = target

        for (let i = 0; i < this.tentacles.length; i++) {
            this.tentacles[i].setTarget(target)
        }
    }

    async update(center, tick)
    {
        const n = this.simplex.noise3D(this.position[0] * .0005, this.position[1] * .0005, tick * .0015) * TAU

        this.position.lerp(this.target, .05)

        this.position[0] = lerp(this.position[0], this.position[0] + center[0] * cos(n), .015)
        this.position[1] = lerp(this.position[1], this.position[1] + center[1] * sin(n), .015)

        this.radius += sin(tick * .05)

        await Promise.all(this.tentacles.map((tentacle, i) => {
            return new Promise(resolve => {
                let t, tx, ty

                t = i / this.tentacles.length * TAU

                tx = this.position[0] + this.radius * cos(t)
                ty = this.position[1] + this.radius * sin(t)

                tentacle.setTarget([tx, ty])

                return tentacle.update(tick, this.simplex)
                    .then(resolve)
            })
        }))
    }
}
