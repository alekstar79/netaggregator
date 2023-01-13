/**
* @see https://www.youtube.com/watch?v=qqq4E6PU2vQ
* @see https://codepen.io/franksLaboratory/pen/yLJdOBM
*/

const canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d')

canvas.height = window.innerHeight
canvas.width = window.innerWidth

let canvasPosition = canvas.getBoundingClientRect()
let bubbleTextArray, adjustX, adjustY

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 150
}

canvas.addEventListener('mousemove', e => {
    mouse.x = e.x - canvasPosition.left
    mouse.y = e.y - canvasPosition.top
})

window.addEventListener('resize', () => {
    canvasPosition = canvas.getBoundingClientRect()

    canvas.height = window.innerHeight
    canvas.width = window.innerWidth

    mouse.x = canvas.width / 2
    mouse.y = canvas.height / 2
})

ctx.fillStyle = 'white'
ctx.font = '25px Verdana'
ctx.fillText('BUBBLE', 20, 42)

const textCoordinates = ctx.getImageData(0, 0, 500, 100)

class Particle
{
    constructor(x, y)
    {
        this.x = x
        this.y = y
        this.size = 7
        this.baseX = this.x
        this.baseY = this.y
        this.density = (Math.random() * 15) + 1
        this.distance
    }
    draw()
    {
        ctx.lineWidth = 3
        ctx.strokeStyle = 'rgba(34,147,214,1)'
        ctx.fillStyle = 'rgba(255,255,255,1)'
        ctx.beginPath()

        if (this.distance < 50) {
            this.size = 14
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
            ctx.stroke()
            ctx.closePath()
            ctx.beginPath()
            ctx.arc(this.x + 4, this.y - 4, this.size / 3, 0, Math.PI * 2)
            ctx.arc(this.x - 6, this.y - 6, this.size / 5, 0, Math.PI * 2)
        } else if (this.distance <= 80) {
            this.size = 8
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
            ctx.stroke()
            ctx.closePath()
            ctx.beginPath()
            ctx.arc(this.x + 3, this.y - 3, this.size / 2.5, 0, Math.PI * 2)
            ctx.arc(this.x - 4, this.y - 4, this.size / 4.5, 0, Math.PI * 2)
        } else {
            this.size = 5
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
            ctx.stroke()
            ctx.closePath()
            ctx.beginPath()
            ctx.arc(this.x + 1, this.y - 1, this.size / 3, 0, Math.PI * 2)
        }
        ctx.closePath()
        ctx.fill()
    }
    update()
    {
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y

        let distance = Math.sqrt(dx * dx + dy * dy)
        this.distance = distance

        let forceDirectionX = dx / distance
        let forceDirectionY = dy / distance

        let maxDistance = 100

        let force = (maxDistance - distance) / maxDistance

        let directionX = forceDirectionX * force * this.density
        let directionY = forceDirectionY * force * this.density

        if (distance < 100) {
            this.x -= directionX
            this.y -= directionY
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX
                this.x -= dx / 20
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY
                this.y -= dy / 20
            }
        }
    }
}

;(function init()
{
    bubbleTextArray = []
    adjustX = -3
    adjustY = -3

    for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                let positionX = x + adjustX
                let positionY = y + adjustY

                bubbleTextArray.push(
                  new Particle(positionX * 8, positionY * 8)
                )
            }
        }
    }
})()

;(function animate()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < bubbleTextArray.length; i++) {
        bubbleTextArray[i].draw()
        bubbleTextArray[i].update()
    }

    requestAnimationFrame(animate)
})()
