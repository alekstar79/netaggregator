import { Colony } from './colony.mjs'

const options = {
    tCount: 25,
    radius: 50
}

export class Mystical
{
    set tCount(v) {
        options.tCount = v

        if (this.creature && this.creature.tentacles.length !== v) {
            this.creature.createTentacles(v)
        }
    }

    get tCount() {
        return options.tCount
    }

    set radius(v) {
        options.radius = v

        if (this.creature) {
            this.creature.radius = v
        }
    }

    get radius() {
        return options.radius
    }

    constructor({ layer: { w, h } })
    {
        this.scene = document.createElement('canvas')
        this.ctx = this.scene.getContext('2d')

        this.scene.height = h
        this.scene.width = w

        this.background = '#000'
        this.mouse = { on: false, x: 0, y: 0 }
        this.center = [w / 2, h / 2]

        this.creature = new Colony(this)

        this.tick = 0

        this.w = w
        this.h = h
    }

    async update(correction, app)
    {
        this.mouse = { ...this.mouse, ...app.mouse }

        if ((this.creature.follow = this.mouse.on)) {
            this.creature.setTarget([this.mouse.x, this.mouse.y])
        }

        this.ctx.clearRect(0, 0, this.w, this.h)

        await this.creature.update(++this.tick)
    }

    render(ctx)
    {
        this.renderBackground(ctx)
        this.renderGlow(ctx)
        this.renderColony(ctx)
    }

    renderBackground(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = this.background
        ctx.fillRect(0, 0, this.w, this.h)
    }

    renderGlow(ctx)
    {
        ctx.save()
        ctx.filter = 'blur(8px) brightness(200%)'
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(this.scene, 0, 0)
        ctx.restore()

        ctx.save()
        ctx.filter = 'blur(4px) brightness(200%)'
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(this.scene, 0, 0)
        ctx.restore()
    }

    renderColony(ctx)
    {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(this.scene, 0, 0)
        ctx.restore()
    }
}
