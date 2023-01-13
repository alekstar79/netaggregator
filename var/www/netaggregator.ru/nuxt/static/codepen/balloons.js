const b64data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAI0lEQVQIW2NkwAT/GdHE/gP5jMiCYAGQIpggXAAmiCIAEgQAAE4FBbECyZcAAAAASUVORK5CYII='
const colors = ['255,255,255', '255,99,71', '19,19,19']
const bg = 'rgba(43,43,43,1)'

/**
 * Generates random particles using canvas
 * @class Particles
 */
class Particles
{
    constructor(canvas, options)
    {
        this.ctx = canvas.getContext('2d')
        this.canvas = canvas

        this.bgColor = options.bgColor || bg
        this.b64data = options.b64data || b64data
        this.pattern = options.pattern || null
        this.bgImage = options.bgImage || null

        this.colors = options.colors || colors
        this.blurry = options.blurry || true
        this.border = options.border || false

        this.minRadius = options.minRadius || 10
        this.maxRadius = options.maxRadius || 35

        this.minOpacity = options.minOpacity || .01
        this.maxOpacity = options.maxOpacity || .5

        this.minSpeed = options.minSpeed || .05
        this.maxSpeed = options.maxSpeed || .5

        this.numParticles = options.numParticles || 75
        this.particle = []
    }

    /**
     * Generates random number between min and max values
     * @param {Number} min value
     * @param {Number} max malue
     * @return {Number} random number between min and max
     * @method _rand
     */
    static _rand(min, max)
    {
        return Math.random() * (max - min) + min
    }

    /**
     * @method loadPattern
     */
    loadPattern()
    {
        const img = new Image()

        return new Promise(resolve => {
            img.src = this.b64data

            img.onload = () => {
                this.pattern = this.ctx.createPattern(img, 'repeat')
                resolve()
            }
        })
    }

    /**
     * Sets canvas size and updates values on resize
     * @method resize
     */
    resize()
    {
        this.canvas.height = window.innerHeight
        this.canvas.width = window.innerWidth
    }

    /**
     * Randomly creates particle attributes
     * @method start
     */
    start()
    {
        this.particle = []

        for (let i = 0; i < this.numParticles; i++) {
            const color = this.colors[~~(Particles._rand(0, this.colors.length))]

            this.particle[i] = {
                radius: Particles._rand(this.minRadius, this.maxRadius),
                xPos: Particles._rand(0, this.canvas.width),
                yPos: Particles._rand(0, this.canvas.height),
                xVelocity: Particles._rand(this.minSpeed, this.maxSpeed),
                yVelocity: Particles._rand(this.minSpeed, this.maxSpeed),
                color: `rgba(${color},${Particles._rand(this.minOpacity, this.maxOpacity)})`
            }
        }

        this.animate()
    }

    /**
     * Draws particles on canvas
     * @param {Number} i index of the particle
     * @method draw
     */
    draw(i)
    {
        if (this.blurry === true) {
            const grd = this.ctx.createRadialGradient(
                this.particle[i].xPos,
                this.particle[i].yPos,
                this.particle[i].radius,
                this.particle[i].xPos,
                this.particle[i].yPos,
                this.particle[i].radius / 1.25
            )

            grd.addColorStop(1.000, this.particle[i].color)
            grd.addColorStop(0.000, 'rgba(34,34,34,0)')
            this.ctx.fillStyle = grd

        } else {
            this.ctx.fillStyle = this.particle[i].color
        }
        if (this.border === true) {
            this.ctx.strokeStyle = '#fff'
            this.ctx.stroke()
        }

        this.ctx.beginPath()
        this.ctx.arc(this.particle[i].xPos, this.particle[i].yPos, this.particle[i].radius, 0, 2 * Math.PI, false)
        this.ctx.fill()
    }

    /**
     * Animates particles
     * @method animate
     */
    animate()
    {
        window.requestAnimationFrame(this.animate.bind(this))

        this.clearCanvas()

        if (this.bgColor) {
            this.ctx.fillStyle = this.bgColor
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }
        if (this.pattern) {
            this.ctx.fillStyle = this.pattern
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }

        for (let i = 0; i < this.numParticles; i++) {
            this.particle[i].xPos += this.particle[i].xVelocity
            this.particle[i].yPos -= this.particle[i].yVelocity

            if (this.particle[i].xPos > this.canvas.width + this.particle[i].radius ||
                this.particle[i].yPos > this.canvas.height + this.particle[i].radius) {
                this.resetParticle(i)
            } else {
                this.draw(i)
            }
        }
    }

    /**
     * Resets position of particle when it goes off screen
     * @param {Number} i value from createCircle method
     * @method resetParticle
     */
    resetParticle(i)
    {
        const random = Particles._rand(0, 1)

        if (random > .5) {
            // 50% chance particle comes from left side of window...
            this.particle[i].xPos = -this.particle[i].radius
            this.particle[i].yPos = Particles._rand(0, this.canvas.height)
        } else {
            // .. or bottom of window
            this.particle[i].xPos = Particles._rand(0, canvas.width)
            this.particle[i].yPos = this.canvas.height + this.particle[i].radius
        }

        this.draw(i)
    }

    /**
     * Clears canvas between animation frames
     * @method clearCanvas
     */
    clearCanvas()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    /**
     * Initializes everything
     * @method init
     */
    static init(canvas, options = {})
    {
        const p = new Particles(canvas, options)

        window.addEventListener('resize', p.resize)

        p.resize()

        p.loadPattern()
            .then(p.start.bind(p))

        return p
    }
}

window.onload = function() {
    Particles.init(document.getElementById('canvas'), {})
}
