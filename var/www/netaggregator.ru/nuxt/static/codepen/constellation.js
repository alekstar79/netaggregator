const defaults = () => ({
    star: {
        randomWidth: true,
        color: 'rgba(255,255,255,.9)',
        width: 2
    },
    line: {
        color: 'rgba(255,255,255,.5)',
        width: .2
    },
    position: {
        x: 0,
        y: 0
    },
    velocity: .1,
    length: 200,
    distance: 120,
    radius: 150,
    stars: []
})

class Star
{
    constructor({ width, height, config })
    {
        this.x = Math.random() * width
        this.y = Math.random() * height

        this.vx = config.velocity - Math.random() * .5
        this.vy = config.velocity - Math.random() * .5

        this.radius = config.star.randomWidth
            ? Math.random() * config.star.width
            : config.star.width
    }

    update({ width, height })
    {
        if (this.y < 0 || this.y > height) {
            this.vy = -this.vy

        } else if (this.x < 0 || this.x > width) {
            this.vx = -this.vx
        }

        this.x += this.vx
        this.y += this.vy
    }

    draw({ context })
    {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fill()
    }
}

/**
 * Makes a nice constellation on canvas
 * @class Constellation
 */
class Constellation
{
    constructor(canvas, options)
    {
        this.config = Object.assign(defaults(), options)
        this.context = canvas.getContext('2d')
        this.canvas = canvas

        this.setInitialPosition(options)

        this.mousemove = this.mousemove.bind(this)
        this.resize = this.resize.bind(this)

        this.setCanvas()
        this.setContext()
        this.createStars()
        this.loop(this.render.bind(this))
        this.bind()
    }

    mousemove(e)
    {
        this.config.position.x = e.pageX - this.canvas.offsetLeft
        this.config.position.y = e.pageY - this.canvas.offsetTop
    }

    resize()
    {
        this.setCanvas()
        this.setContext()
        this.createStars()
    }

    drawLines()
    {
        let iStar, jStar, i, j

        for (i = 0; i < this.config.length; i++) {
            for (j = 0; j < this.config.length; j++) {
                iStar = this.config.stars[i]
                jStar = this.config.stars[j]

                if ((iStar.x - jStar.x) < this.config.distance &&
                    (iStar.y - jStar.y) < this.config.distance &&
                    (iStar.x - jStar.x) > -this.config.distance &&
                    (iStar.y - jStar.y) > -this.config.distance
                ) {
                    if ((iStar.x - this.config.position.x) < this.config.radius &&
                        (iStar.y - this.config.position.y) < this.config.radius &&
                        (iStar.x - this.config.position.x) > -this.config.radius &&
                        (iStar.y - this.config.position.y) > -this.config.radius
                    ) {
                        this.context.beginPath()
                        this.context.moveTo(iStar.x, iStar.y)
                        this.context.lineTo(jStar.x, jStar.y)
                        this.context.stroke()
                        this.context.closePath()
                    }
                }
            }
        }
    }

    createStars()
    {
        for (let i = 0; i < this.config.length; i++) {
            this.config.stars[i] = new Star(this)
        }
    }

    render()
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        for (let i = 0; i < this.config.length; i++) {
            this.config.stars[i].update(this)
            this.config.stars[i].draw(this)
        }

        this.drawLines()
    }

    setCanvas()
    {
        this.canvas.height = this.height = window.innerHeight
        this.canvas.width = this.width = window.innerWidth
    }

    setContext()
    {
        this.context.strokeStyle = this.config.line.color
        this.context.fillStyle = this.config.star.color
        this.context.lineWidth = this.config.line.width
    }

    setInitialPosition(options)
    {
        if (!options || !Object.prototype.hasOwnProperty.call(options, 'position')) {
            this.config.position = { x: this.canvas.width * .5, y: this.canvas.height * .5 }
        }
    }

    loop(callback)
    {
        this.rAF = window.requestAnimationFrame(() => {
            this.loop(callback)
        })

        callback()
    }

    bind()
    {
        window.addEventListener('mousemove', this.mousemove)
        window.addEventListener('resize', this.resize)
    }

    unbind()
    {
        window.removeEventListener('mousemove', this.mousemove)
        window.removeEventListener('resize', this.resize)
    }
}

window.onload = function() {
    return new Constellation(document.getElementById('canvas'), {
        star: {
            color: 'rgba(255,255,255,.9)',
            width: 2
        },
        line: {
            color: 'rgba(255,255,255,.2)'
        },
        length: window.innerWidth / 6,
        radius: window.innerWidth / 5
    })
}
