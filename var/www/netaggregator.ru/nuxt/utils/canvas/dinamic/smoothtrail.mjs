const rand = (rMi, rMa) => ~~((Math.random() * (rMa - rMi + 1)) + rMi)

let background = '#000'

export class Smoothtrail
{
    constructor({ _canvas, layer: { w, h } })
    {
        Object.assign(_canvas.style, { background })

        this.d = Math.sqrt(w * w + h * h) / 4
        this.background = background
        this.canvas = _canvas

        this.trail = []
        this.maxTrail = 200
        this.speed = .09
        this.growRadius = true
        this.radius = 1
        this.angle = 0

        this.arcx = 0
        this.arcy = 0

        this.seconds = 0
        this.milliseconds = 0

        this.mx = 0
        this.my = 0

        this.w = w
        this.h = h
    }

    setColor(hex)
    {
        this.color = hex
    }

    setBackground(hex)
    {
        this.background = hex
    }

    update(correction, app)
    {
        this.mouse = { ...this.mouse, ...app.mouse }

        this.updateArc()
        this.updateTrail()
    }

    updateTrail()
    {
        if (this.trail.length < this.maxTrail) {
            this.trail.push({ x: this.arcx, y: this.arcy })
        }
        if (this.trail.length >= this.maxTrail) {
            this.trail.splice(0, 1)
        }
    }

    updateArc()
    {
        this.arcx = (this.w / 2) + Math.sin(this.angle) * this.radius
        this.arcy = (this.h / 2) + Math.cos(this.angle) * this.radius

        const d = new Date()

        this.seconds = d.getSeconds()
        this.milliseconds = d.getMilliseconds()
        this.angle += this.speed * (this.seconds + 1 + (this.milliseconds / 1000))

        if (this.radius <= 1) {
            this.growRadius = true
        }
        if (this.radius >= this.d) {
            this.growRadius = false
        }
        if (this.growRadius) {
            this.radius += 1
        } else {
            this.radius -= 1
        }
    }

    render(ctx)
    {
        this.adjustBackground()
        this.fillCanvas(ctx)
        this.renderTrail(ctx)
    }

    adjustBackground()
    {
        if (this.background !== background) {
            Object.assign(this.canvas.style, { background: this.background })
            background = this.background
        }
    }

    fillCanvas(ctx)
    {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'rgba(0,0,0,.1)'
        ctx.fillRect(0, 0, this.w, this.h)
    }

    renderTrail(ctx)
    {
        ctx.globalCompositeOperation = 'lighter'
        ctx.beginPath()

        let i = this.trail.length

        while (i--) {
            const nextPoint = (i === this.trail.length)
                ? this.trail[i + 1]
                : this.trail[i]

            const c = (this.trail[i].x + nextPoint.x) / 2
            const d = (this.trail[i].y + nextPoint.y) / 2

            ctx.quadraticCurveTo(
                Math.round(this.arcx),
                Math.round(this.arcy),
                c,
                d
            )
        }

        ctx.strokeStyle = `hsla(${rand(170, 300)}, 100%, ${rand(50, 75)}%, 1)`
        ctx.stroke()
        ctx.closePath()
    }
}
