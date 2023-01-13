import { PropsArray, createRenderingContext, angle, lerp, dist } from './utils.js'

const { sin, cos, pow } = Math

const options = {
    particles: { color: [60, 120, 255, 255], pLerpAmt: .3, vLerpAmt: .1 },
    mouse: { lerpAmt: .25, repelThreshold: 80 }
}

const particleProps = ['x','y','vx','vy','bx','by']

const height = 512
const width = 512

const centerx = 256
const centery = 256

const particleCount = width * height / 4

const { buffer, ctx } = createRenderingContext(width, height)
const imageBuffer = buffer.createImageData(width, height)

let hover = false

let userx = 0
let usery = 0

let repelx = 0
let repely = 0

let particles

window.addEventListener('mousemove', mousemove)
window.addEventListener('mouseout', mousemove)
window.addEventListener('load', start)

function start()
{
    setupCanvas()
    mapParticles()
    run()
}

function setupCanvas()
{
    Object.assign(ctx.canvas.style, {
        transform: 'translateX(-50%) translateY(-50%)',
        boxShadow: '0 2px 16px 4px rgba(0,0,0,0.8)',
        background: 'black',
        position: 'absolute',
        left: '50%',
        top: '50%'
    })
}

function run()
{
    requestAnimationFrame(run)
    update()
    render()
}

function update()
{
    if (hover) {
        repelx = lerp(repelx, userx, options.mouse.lerpAmt)
        repely = lerp(repely, usery, options.mouse.lerpAmt)
    } else {
        repelx = lerp(repelx, centerx, options.mouse.lerpAmt)
        repely = lerp(repely, centery, options.mouse.lerpAmt)
    }
}

function render()
{
    clearBuffer()
    clearScreen()
    drawParticles()
    renderFrame()
}

function mapParticles()
{
    const pixelData = new Uint32Array(buffer.getImageData(0, 0, width, height).data),
        _particles = []

    let i, x, y, bx, by, vx, vy

    for (i = 0; i < pixelData.length; i += 4) {
        if (!(i % 24)) {
            x = bx = i / 4 % width
            y = by = i / 4 / width | 0

            vx = vy = 0

            _particles.push(x, y, vx, vy, bx, by)
        }
    }

    particles = new PropsArray(particleCount, particleProps)
    particles.set(_particles, 0)
}

function drawParticles()
{
    let i, _x, _y

    imageBuffer.data.fill(0)

    particles.forEach(([x, y, vx, vy, bx, by], index) => {
        _x = x | 0
        _y = y | 0
        i = 4 * (_x + _y * width)

        if (!outOfBounds(_x, _y, width, height)) {
            fillPixel(imageBuffer, i, options.particles.color)
        }

        particles.set(updatePixelCoords(x, y, vx, vy, bx, by), index)
    })

    buffer.putImageData(imageBuffer, 0, 0)
}

function fillPixel(imageData, i, [r, g, b, a])
{
    imageData.data.set([r, g, b, a], i)
}

function updatePixelCoords(x, y, vx, vy, bx, by)
{
    let rd, dx, dy, phi, f

    rd = dist(x, y, repelx, repely)

    phi = angle(repelx, repely, x, y)
    f = pow(options.mouse.repelThreshold, 2) / rd

    dx = bx - x
    dy = by - y

    vx = lerp(vx, dx + cos(phi) * f, options.particles.vLerpAmt)
    vy = lerp(vy, dy + sin(phi) * f, options.particles.vLerpAmt)

    x = lerp(x, x + vx, options.particles.pLerpAmt)
    y = lerp(y, y + vy, options.particles.pLerpAmt)

    return [x, y, vx, vy]
}

function outOfBounds(x, y, width, height)
{
    return x < 1 || x > width - 1 || y < 1 || y > height - 1
}

function renderFrame()
{
    ctx.save()

    ctx.filter = 'blur(4px) saturate(200%)'
    ctx.drawImage(buffer.canvas, 0, 0)

    ctx.filter = 'blur(0)'
    ctx.globalCompositeOperation = 'lighter'
    ctx.drawImage(buffer.canvas, 0, 0)

    ctx.restore()
}

function clearScreen()
{
    clear(ctx)
}

function clearBuffer()
{
    clear(buffer)
}

function clear(_ctx)
{
    _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height)
}

function mousemove({ type, clientX, clientY })
{
    const { left, top } = ctx.canvas.getBoundingClientRect()

    hover = type === 'mousemove'
    userx = clientX - left
    usery = clientY - top
}
