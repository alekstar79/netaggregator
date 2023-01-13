import { Colony } from './colony.js'

let canvas, ctx, center, creature, tick = 0

async function setup()
{
    createScene()
    resize()

    creature = new Colony(center[0], center[1], 40, 20)
    creature.setCtx(ctx.a)

    await loop()
}

function createScene()
{
    canvas = { a: document.createElement('canvas'), b: document.createElement('canvas') }

    Object.assign(canvas.b.style, {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
    })

    document.body.appendChild(canvas.b)

    ctx = { a: canvas.a.getContext('2d'), b: canvas.b.getContext('2d') }

    center = [.5 * canvas.a.width, .5 * canvas.a.height]
}

function resize()
{
    const { innerWidth, innerHeight } = window

    canvas.a.height = innerHeight
    canvas.a.width = innerWidth

    ctx.a.drawImage(canvas.b, 0, 0)

    canvas.b.height = innerHeight
    canvas.b.width = innerWidth

    ctx.b.drawImage(canvas.a, 0, 0)

    center[1] = .5 * canvas.a.height
    center[0] = .5 * canvas.a.width
}

function renderBackground()
{
    ctx.a.clearRect(0, 0, canvas.b.width, canvas.b.height)

    ctx.b.fillStyle = 'rgba(0,0,5,.8)'
    ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height)
}

function renderGlow()
{
    ctx.b.save()
    ctx.b.filter = 'blur(8px) brightness(200%)'
    ctx.b.globalCompositeOperation = 'lighter'
    ctx.b.drawImage(canvas.a, 0, 0)
    ctx.b.restore()

    ctx.b.save()
    ctx.b.filter = 'blur(4px) brightness(200%)'
    ctx.b.globalCompositeOperation = 'lighter'
    ctx.b.drawImage(canvas.a, 0, 0)
    ctx.b.restore()
}

function renderToScreen()
{
    ctx.b.save()
    ctx.b.globalCompositeOperation = 'lighter'
    ctx.b.drawImage(canvas.a, 0, 0)
    ctx.b.restore()
}

async function loop()
{
    window.requestAnimationFrame(loop)

    tick++

    renderBackground()

    await creature.update(center, tick)

    renderGlow()
    renderToScreen()
}

window.addEventListener('load', setup)
window.addEventListener('resize', resize)
window.addEventListener('mousemove', e => {
    if (!creature) return

    creature.follow = true
    creature.setTarget([e.clientX, e.clientY])
})

window.addEventListener('mouseout', () => {
    if (!creature) return

    creature.follow = false
})
