import { Layer } from './layer.js'
import { Loop } from './loop.js'
import { Mesh } from './mesh.js'

class App
{
    constructor(container)
    {
        this.layer = new Layer(container)

        // this.rect = { x: 0, y: 0, w: 32, h: 32, vx: 500, vy: 500, color: 'orange' }
        addEventListener('resize', () => this.createMesh())
        this.createMesh()

        this.loop = new Loop(this.update.bind(this), this.display.bind(this))
    }

    createMesh()
    {
        this.mesh = new Mesh(this.layer)
    }

    update(correction = 0)
    {
        /* if (this.rect.x <= 0 && this.rect.vx < 0 || this.rect.x + this.rect.w > this.layer.w && this.rect.vx > 0) {
            this.rect.vx = -this.rect.vx
        }
        if (this.rect.y <= 0 && this.rect.vy < 0 || this.rect.y + this.rect.h > this.layer.h && this.rect.vy > 0) {
            this.rect.vy = -this.rect.vy
        } */

        // this.rect.x += this.rect.vx * correction
        // this.rect.y += this.rect.vy * correction

        this.mesh.updateParticles(correction)
        this.mesh.updateTriangles(correction)
    }

    display()
    {
        // this.layer.context.clearRect(0, 0, this.layer.w, this.layer.h)
        // this.layer.context.fillStyle = this.rect.color
        // this.layer.context.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h)

        this.mesh.renderTriangles(this.layer.context)
        // this.mesh.renderParticles(this.layer.context)
    }
}

onload = () => { new App(document.body) }
