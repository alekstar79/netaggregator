// noinspection DuplicatedCode

const options = { step: .1 }

export class Mesh
{
    set step(v) {
        if (options.step !== v) {
            options.step = v

            this.calcOffsets()
            this.createParticles()
            this.createTriangles()
        }
    }

    get step() {
        return options.step
    }

    constructor({ layer: { w, h } })
    {
        this.mouse = { on: false, x: null, y: null }
        this.maxDist = Math.hypot(w, h)

        this.extraPoints = 3
        this.colorPalet = 160
        this.colorSpeed = 30
        this.colorTimer = 0

        this.w = w
        this.h = h

        this.calcOffsets()
        this.createParticles()
        this.createTriangles()
    }

    calcOffsets()
    {
        this.stepX = this.maxDist * this.step
        this.stepY = this.stepX * Math.sqrt(3) / 2

        this.cols = (this.w / this.stepX | 0) + this.extraPoints
        this.rows = (this.h / this.stepY | 0) + this.extraPoints

        this.extraOffsetX = this.stepX / 4
        this.offsetX = (this.w - (this.cols - 1) * this.stepX) / 2
        this.offsetY = (this.h - (this.rows - 1) * this.stepY) / 2
    }

    createParticles()
    {
        this.particles = []

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const shiftX = i & 1 ? -this.extraOffsetX : this.extraOffsetX,

                    x = j * this.stepX + this.offsetX + shiftX,
                    y = i * this.stepY + this.offsetY,

                    homeX = x,
                    homeY = y,

                    radius = Math.random() * this.extraOffsetX / 2 + this.extraOffsetX,
                    angle = Math.random() * Math.PI * 2,
                    velocity = Math.random() * 2 - 1

                this.particles.push({ x, y, homeX, homeY, angle, radius, velocity })
            }
        }
    }

    createTriangles()
    {
        this.triangles = []

        for (let y = 0; y < this.rows - 1; y++) {
            const vertices = []

            for (let x = 0; x < this.cols; x++) {
                let a = x + this.cols * (y + 1),
                    b = x + this.cols * y

                if (y & 1) [a, b] = [b, a]

                vertices.push(this.particles[a], this.particles[b])
            }
            for (let i = 0; i < vertices.length - 2; i++) {
                this.triangles.push({
                    a: vertices[i],
                    b: vertices[i + 1],
                    c: vertices[i + 2]
                })
            }
        }
    }

    /* mouseRecalc({ x, y, angle, radius })
    {
        let dx = this.mouse.x - x
        let dy = this.mouse.y - y

        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < this.mouse.radius + radius) {
            let s10 = radius * 10

            if (this.mouse.x < x && x < this.w - s10) {
                x += 200
            }
            if (this.mouse.x > x && x > s10) {
                x -= 200
            }
            if (this.mouse.y < y && y < this.h - s10) {
                y += 200
            }
            if (this.mouse.y > y && y > s10) {
                y -= 200
            }

            angle *= 1.2
        }

        return { x, y, angle }
    } */

    updateParticles(correction = 0)
    {
        // let c

        this.particles.forEach(p => {
            p.angle += p.velocity * correction

            p.x = Math.cos(p.angle) * p.radius + p.homeX
            p.y = Math.sin(p.angle) * p.radius + p.homeY

            /* if (this.mouse.on) {
                c = this.mouseRecalc(p)

                p.angle = c.angle
                p.x = c.x
                p.y = c.y
            } */
        })
    }

    updateTriangles(correction = 0)
    {
        this.colorTimer = (this.colorTimer + this.colorSpeed * correction) % 360
    }

    update(correction = 0, app)
    {
        this.mouse = { ...this.mouse, ...app.mouse }

        this.updateParticles(correction)
        this.updateTriangles(correction)
    }

    renderParticles(ctx)
    {
        ctx.fillStyle = 'red'

        const radius = 5

        this.particles.forEach(p => {
            ctx.beginPath()
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
            ctx.fill()
        })
    }

    renderTriangles(ctx)
    {
        this.triangles.forEach(t => {
            const { a, b, c } = t,

                posX = (a.x + b.x + c.x) / 3,
                posY = (a.y + b.y + c.y) / 3,

                dist = Math.hypot(posX, posY),
                hue = dist / this.maxDist * this.colorPalet - this.colorTimer

            ctx.strokeStyle = `hsl(${hue}, 70%, 70%)`
            ctx.fillStyle = `hsl(${hue}, 85%, 50%)`

            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.lineTo(c.x, c.y)
            ctx.closePath()

            ctx.fill()
            ctx.stroke()
        })
    }

    render(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'

        this.renderTriangles(ctx)
        // this.renderParticles(ctx)
    }
}
