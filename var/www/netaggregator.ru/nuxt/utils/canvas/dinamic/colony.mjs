import { TAU, lerp, rand } from '../../toolkit.mjs'
import { debounce } from '../../common/debounce.mjs'
import { Tentacle } from './tentacle.mjs'

import SimplexNoise from '../../simplex.mjs'

const { cos, round, sin } = Math

export class Colony
{
    constructor({ center: [x, y], radius, tCount, ctx })
    {
        this.createTentacles = debounce.call(this, this.createTentacles, 100)

        this.simplex = new SimplexNoise()

        this.position = [x, y]
        this.center = [x, y]
        this.radius = radius
        this.follow = false
        this.tentacles = []
        this.ctx = ctx

        this.createTentacles(radius, tCount)
        this.setTarget([x, y])
    }

    createTentacles(count)
    {
        const { ctx, tentacles: { length }, radius, position: [x, y] } = this

        if (length > count) {
            this.tentacles.splice(0, length - count)
        }

        for (let phi, i = 0; i < count; i++) {
            phi = i / count * TAU

            this.tentacles[i] = new Tentacle(
                x + radius * cos(phi),
                y + radius * sin(phi),
                round(rand(10)) + 10,
                round(rand(5)) + 20,
                phi,
                ctx
            )
        }

        return this
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

    async update(tick)
    {
        const n = this.simplex.noise3D(this.position[0] * .0005, this.position[1] * .0005, tick * .0015) * TAU

        this.position.lerp(this.target, .05)

        this.position[0] = lerp(this.position[0], this.position[0] + this.center[0] * cos(n), .015)
        this.position[1] = lerp(this.position[1], this.position[1] + this.center[1] * sin(n), .015)

        this.radius += sin(tick * .05)

        await Promise.all(this.tentacles.map((tentacle, i) => {
            return new Promise(resolve => {
                let t = i / this.tentacles.length * TAU
                let tx = this.position[0] + this.radius * cos(t)
                let ty = this.position[1] + this.radius * sin(t)

                tentacle.setTarget([tx, ty])

                return tentacle.update(tick, this.simplex)
                    .then(resolve)
            })
        }))
    }
}
