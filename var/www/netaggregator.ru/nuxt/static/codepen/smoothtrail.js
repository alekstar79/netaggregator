const SmoothTrail = function(canvas) {
    const _this = this

    this.ctx = canvas.getContext('2d')
    this.ch = canvas.height
    this.cw = canvas.width
    this.c = canvas
    this.mx = 0
    this.my = 0

    this.trail = []
    this.maxTrail = 200

    this.ctx.lineJoin = 'round'
    this.ctx.lineWidth = .1

    this.speed = .07
    this.growRadius = true
    this.radius = 1
    this.angle = 0
    this.arcx = 0
    this.arcy = 0
    this.seconds = 0
    this.milliseconds = 0

    this.d = Math.sqrt(this.cw * this.cw + this.ch * this.ch) / 3

    this.rand = function(rMi, rMa) {
        return ~~((Math.random() * (rMa - rMi + 1)) + rMi)
    }

    this.createPoint = function(x, y) {
        this.trail.push({ x, y })
    }

    this.updateTrail = function() {
        if (this.trail.length < this.maxTrail) {
            this.createPoint(this.arcx, this.arcy)
        }
        if (this.trail.length >= this.maxTrail) {
            this.trail.splice(0, 1)
        }
    }

    this.updateArc = function() {
        this.arcx = (this.cw / 2) + Math.sin(this.angle) * this.radius
        this.arcy = (this.ch / 2) + Math.cos(this.angle) * this.radius

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

    this.renderTrail = function() {
        let i = this.trail.length

        this.ctx.beginPath()

        while (i--) {
            const point = this.trail[i]
            const nextPoint = (i === this.trail.length) ? this.trail[i + 1] : this.trail[i]
            const c = (point.x + nextPoint.x) / 2
            const d = (point.y + nextPoint.y) / 2

            this.ctx.quadraticCurveTo(Math.round(this.arcx), Math.round(this.arcy), c, d)
        }

        this.ctx.strokeStyle = `hsla(${this.rand(170, 300)}, 100%, ${this.rand(50, 75)}%, 1)`
        this.ctx.stroke()
        this.ctx.closePath()
    }

    this.clearCanvas = function() {
        // this.ctx.globalCompositeOperation = 'source-over'
        // this.ctx.clearRect(0 ,0 ,this.cw, this.ch)

        this.ctx.globalCompositeOperation = 'destination-out'
        this.ctx.fillStyle = 'rgba(0,0,0,.1)'
        this.ctx.fillRect(0, 0, this.cw, this.ch)
        this.ctx.globalCompositeOperation = 'lighter'
    }

    this.loop = function() {
        window.requestAnimationFrame(_this.loop)

        _this.clearCanvas()
        _this.updateArc()
        _this.updateTrail()
        _this.renderTrail()
    }
}

SmoothTrail.init = function(c, cw, ch) {
    const st = new SmoothTrail(c, cw, ch)

    st.loop()
}

const setupRAF = function() {
    let lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o']

    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            const currTime = new Date().getTime()
            const timeToCall = Math.max(0, 16 - (currTime - lastTime))
            const id = window.setTimeout(function() {
                callback(currTime + timeToCall)
            }, timeToCall)

            lastTime = currTime + timeToCall

            return id
        }
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id)
        }
    }
}

const c = document.createElement('canvas')

c.height = 1200
c.width = 1200

setupRAF()
document.body.appendChild(c)
SmoothTrail.init(c)
