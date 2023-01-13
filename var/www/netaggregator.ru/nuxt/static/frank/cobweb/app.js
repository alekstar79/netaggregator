const canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d')

canvas.height = window.innerHeight
canvas.width = window.innerWidth

const mouse = { on: false, radius: (canvas.height / 80) * (canvas.width / 80), x: null, y: null }
let particlesArray

window.addEventListener('mousemove', e => {
    mouse.on = true
    mouse.x = e.x
    mouse.y = e.y
})

window.addEventListener('mouseout', () => {
    mouse.x = undefined
    mouse.y = undefined
    mouse.on = false
})

window.addEventListener('resize', () => {
    canvas.height = window.innerHeight
    canvas.width = window.innerWidth
    mouse.radius = (canvas.height / 80) * (canvas.width / 80)
    init()
})

class Particle
{
    constructor(x, y, directionX, directionY, size, color)
    {
        this.directionX = directionX
        this.directionY = directionY
        this.color = color
        this.size = size
        this.x = x
        this.y = y
    }
    draw()
    {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color // '#8C5523'
        ctx.fill()
    }
    mouseRecalc()
    {
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y

        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < mouse.radius + this.size) {
            let s10 = this.size * 10

            if (mouse.x < this.x && this.x < canvas.width - s10) {
                this.x += 10
            }
            if (mouse.x > this.x && this.x > s10) {
                this.x -= 10
            }
            if (mouse.y < this.y && this.y < canvas.height - s10) {
                this.y += 10
            }
            if (mouse.y > this.y && this.y > s10) {
                this.y -= 10
            }
        }
    }
    update()
    {
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY
        }
        if (mouse.on) {
            this.mouseRecalc()
        }

        this.x += this.directionX
        this.y += this.directionY
    }
}

function connect()
{
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let abx = particlesArray[a].x - particlesArray[b].x
            let aby = particlesArray[a].y - particlesArray[b].y
            let distance = (abx * abx) + (aby * aby)

            if (distance < (canvas.width / 10) * (canvas.height / 10)) {
                ctx.strokeStyle = `rgba(255,255,255,${1 - (distance / 20000)})`
                ctx.lineWidth = 1

                ctx.beginPath()
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
                ctx.stroke()
            }
        }
    }
}

;(function init()
{
    const NOP = (canvas.width * canvas.height) / 9000

    particlesArray = []

    for (let i = 0; i < NOP; i++) {
        let size = Math.random() * 3 + 1
        let x = Math.random() * ((innerWidth - size * 2) - (size * 2)) + (size * 2)
        let y = Math.random() * ((innerHeight - size * 2) - (size * 2)) + (size * 2)
        let directionX = Math.random() * 5 - 2.5
        let directionY = Math.random() * 5 - 2.5

        particlesArray.push(
          new Particle(x, y, directionX, directionY, size, '#fff')
        )
    }
})()

;(function animate()
{
    requestAnimationFrame(animate)

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
    }

    connect()
})()
