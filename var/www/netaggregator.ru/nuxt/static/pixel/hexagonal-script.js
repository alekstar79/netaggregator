/* eslint no-unused-vars:0 */

/**
* @see https://www.youtube.com/watch?v=r6l75hWKpac
* @see https://codepen.io/ThreePixDroid/pens/public
*/

const cnv  = document.querySelector('canvas'),
    ctx  = cnv.getContext('2d')

let cw, ch, cx, cy
function resizeCanvas()
{
    ch = cnv.height = innerHeight
    cw = cnv.width = innerWidth
    cx = cw / 2
    cy = ch / 2
}

resizeCanvas()
window.addEventListener('resize', resizeCanvas)

const v1 = {
    hue: 0,
    bgFillColor: 'rgba(50,50,50, .05)',
    dirsCount: 6,
    stepToTurn: 12,
    dotSize: 4,
    dotsCount: 300,
    dotVelocity: 2,
    distance: 70,
    gradientLen: 5
}

const v2 = {
    hue: 0,
    bgFillColor: 'rgba(50,50,50,.01)',
    dirsCount: 6,
    stepToTurn: 8,
    dotSize: 2,
    dotsCount: 300,
    dotVelocity: 2,
    distance: 70,
    gradientLen: 5
}

const v3 = {
    hue: 0,
    bgFillColor: 'rgba(50,50,50,.01)',
    dirsCount: 3,
    stepToTurn: 20,
    dotSize: 2,
    dotsCount: 300,
    dotVelocity: 2,
    distance: 200,
    gradientLen: 5
}

const v4 = {
    hue: 200,
    bgFillColor: 'rgba(50,50,50,.01)',
    dirsCount: 4,
    stepToTurn: 20,
    dotSize: 2,
    dotsCount: 300,
    dotVelocity: 2,
    distance: 200,
    gradientLen: 5,
    gridAngle: 45
}

const v5 = {
    hue: 200,
    bgFillColor: 'rgba(50,50,50,.01)',
    dirsCount: 8,
    stepToTurn: 2,
    dotSize: 2,
    dotsCount: 300,
    dotVelocity: 2,
    distance: 200,
    gradientLen: 5,
    gridAngle: 45
}

const v6 = {
    hue: 200,
    bgFillColor: 'rgba(50,50,50,.01)',
    dirsCount: 23,
    stepToTurn: 1,
    dotSize: 2,
    dotsCount: 300,
    dotVelocity: 1,
    distance: 200,
    gradientLen: 5,
    gridAngle: 45
}

const v7 = {
    hue: 200,
    bgFillColor: 'rgba(50,50,50,.01)',
    dirsCount: 23,
    stepToTurn: 20,
    dotSize: 2,
    dotsCount: 300,
    dotVelocity: 1,
    distance: 200,
    gradientLen: 5,
    gridAngle: 45
}

const cfg = v7

function drawRect(color, x, y, w, h, shadowColor, shadowBlur, gco)
{
    ctx.globalCompositeOperation = gco

    ctx.shadowColor = shadowColor || 'black'
    ctx.shadowBlur = shadowBlur  || 1
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
}

class Dot
{
    constructor()
    {
        this.dir = cfg.dirsCount === 6 ? (Math.random() * 3 | 0) * 2 : Math.random() * cfg.dirsCount | 0
        this.pos = { x: cx, y: cy }
        this.step = 0
    }

    redrawDot()
    {
        let xy = Math.abs(this.pos.x - cx) + Math.abs(this.pos.y - cy)
        let makeHue = (cfg.hue + xy / cfg.gradientLen) % 360
        let color = `hsl(${ makeHue }, 100%, 50%)`
        let blur = cfg.dotSize - Math.sin(xy / 8) * 2
        let size = cfg.dotSize // - Math.sin(xy / 9) * 2 + Math.sin(xy / 2)
        let x = this.pos.x - size / 2
        let y = this.pos.y - size / 2

        drawRect(color, x, y, size, size, color, blur, 'lighter')
    }

    moveDot()
    {
        this.step++
        this.pos.x += dirsList[this.dir].x * cfg.dotVelocity
        this.pos.y += dirsList[this.dir].y * cfg.dotVelocity
    }

    changeDir()
    {
        if (this.step % cfg.stepToTurn === 0) {
            this.dir = Math.random() > .5 ? (this.dir + 1) % cfg.dirsCount : (this.dir + cfg.dirsCount - 1) % cfg.dirsCount
        }
    }

    killDot(id)
    {
        let percent = Math.random() * Math.exp(this.step / cfg.distance)

        if (percent > 100) {
            dotsList.splice(id, 1)
        }
    }
}

let dirsList = []
function createDirs()
{
    for (let i = 0; i < 360; i += 360 / cfg.dirsCount) {
        let x = Math.cos(i * Math.PI / 180)
        let y = Math.sin(i * Math.PI / 180)
        dirsList.push({ x, y })
    }
}

createDirs()

let dotsList = []
function addDot()
{
    if (dotsList.length < cfg.dotsCount && Math.random() > .8) {
        dotsList.push(new Dot())
        cfg.hue = (cfg.hue + 1) % 360
    }
}

function refreshDots()
{
    dotsList.forEach((i, id) => {
        i.redrawDot()
        i.moveDot()
        i.changeDir()
        i.killDot(id)
    })
}

function loop()
{
    drawRect(cfg.bgFillColor, 0, 0, cw, ch, 0, 0, 'normal')
    addDot()
    refreshDots()

    requestAnimationFrame(loop)
}

loop()
