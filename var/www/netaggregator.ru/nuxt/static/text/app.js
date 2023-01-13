const { atan2, cos, pow, random, sin, sqrt } = Math

const rand = n => n * random()
const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2))
const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1)
const lerp = (a, b, t) => (1 - t) * a + t * b

const textBaselineTypes = { ALPHABETIC: 'alphabetic', BOTTOM: 'bottom', HANGING: 'hanging', MIDDLE: 'middle', TOP: 'top' }
const textAlignTypes = { CENTER: 'center', END: 'end', LEFT: 'left', RIGHT: 'right', START: 'start' }
const drawTypes = { FILL: 'fill', STROKE: 'stroke' }

Array.prototype.lerp = function(t = [], a = 0) {
    this.forEach((n, i) => (this[i] = lerp(n, t[i], a)))
}

Float32Array.prototype.get = function(i = 0, n = 0) {
    let r = []

    for (const t = i + n; i < t; i++) {
        r.push(this[i])
    }

    return r
}

class PropsArray
{
    constructor(count = 0, props = [], type = 'float')
    {
        this.spread = props.length
        this.count = count
        this.props = props

        this.values = type === 'float'
            ? new Float32Array(count * props.length)
            : new Uint32Array(count * props.length)
    }

    get length() {
        return this.values.length
    }

    set(a = [], i = 0) {
        this.values.set(a, i)
    }

    setMap(o = {}, i = 0) {
        this.set(Object.values(o), i)
    }

    get(i = 0) {
        return this.values.get(i, this.spread)
    }

    getMap(i = 0) {
        return this.get(i).reduce(
            (r, v, i) => ({
                ...r,
                ...{ [this.props[i]]: v }
            }),
            {}
        )
    }

    forEach(cb)
    {
        for (let i = 0; i < this.length; i += this.spread) {
            cb(this.get(i), i, this)
        }
    }

    map(cb)
    {
        for (let i = 0; i < this.length; i += this.spread) {
            this.set(cb(this.get(i), i, this), i)
        }
    }

    async* read()
    {
        for (let i = 0; i < this.length; i += this.spread) {
            yield { index: i, value: this.get(i) }
        }
    }
}

function createOffscreenCanvas(width, height)
{
    let _canvas

    if (typeof OffscreenCanvas !== 'undefined') {
        _canvas = new OffscreenCanvas(parseFloat(width), parseFloat(height))
    } else {
        _canvas = createCanvas(width, height)
    }

    return _canvas
}

function createCanvas(width, height)
{
    const canvas = document.createElement('canvas')

    canvas.height = height
    canvas.width = width

    return canvas
}

function createContext2D(width = innerWidth, height = innerHeight, contextAttributes) {
    return createCanvas(width, height).getContext('2d', contextAttributes)
}

function createOffscreenContext2D(width = innerWidth, height = innerHeight, contextAttributes) {
    return createOffscreenCanvas(width, height).getContext('2d', contextAttributes)
}

function createRenderingContext(width, height) {
    const contextAttributes = { desynchronized: true, willReadFrequently: true }

    const buffer = createOffscreenContext2D(width, height, contextAttributes)
    const ctx = createContext2D(width, height, contextAttributes)

    ctx.canvas.style.position = 'absolute'

    document.body.appendChild(ctx.canvas)

    return {
        buffer,
        ctx
    }
}

// -----------------------------------------------------------------------------------

const options = {
    mouse: {
        lerpAmt: .5,
        repelThreshold: 100
    },
    particles: {
        density: 3,
        get pixelDensity() {
            return (4 - this.density) * 4
        },
        pLerpAmt: .25,
        vLerpAmt: .1
    },
    text: {
        drawType: drawTypes.STROKE,
        fontColor: [60, 200, 255, 255],
        fontSize: 120,
        get fontStyle() {
            return `${this.fontSize}px Oswald, sans-serif`
        },
        message: 'NetAggregator'
    }
}

const particleProps = ['x', 'y', 'vx', 'vy', 'bx', 'by']
const { buffer, ctx } = createRenderingContext()

let hover = false

let userx = 0
let usery = 0

let repelx = 0
let repely = 0

let centerx = 0
let centery = 0

let particles
let height
let width

let imageBuffer

window.addEventListener('resize', setup)
window.addEventListener('mousemove', mousemove)
window.addEventListener('mouseout', mousemove)
window.addEventListener('load', start)

function start()
{
    setup()
    run()
}

function setup()
{
    resize()
    clearBuffer()
    setTextStyles()
    mapParticles()
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
    drawMessage()

    const pixelData = new Uint32Array(buffer.getImageData(0, 0, width, height).data)
    const pixels = []

    let i, x, y, bx, by, vx, vy

    for (i = 0; i < pixelData.length; i += 4) {
        if (pixelData[i + 3] && !(i % options.particles.pixelDensity)) {
            x = rand(width) | 0
            y = rand(height) | 0
            bx = (i / 4) % width
            by = ((i / 4) / width) | 0
            vx = 0
            vy = 0

            pixels.push(x, y, vx, vy, bx, by)
        }
    }

    particles = new PropsArray(pixels.length / particleProps.length, particleProps)
    particles.set(pixels, 0)
}

function drawParticles()
{
    let i, _x, _y

    imageBuffer.data.fill(0)

    particles.forEach(([x, y, vx, vy, bx, by], index) => {
        _x = x | 0
        _y = y | 0

        if (!outOfBounds(_x, _y, width, height)) {
            i = 4 * (_x + _y * width)

            fillPixel(imageBuffer, i, options.text.fontColor)
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
    f = (pow(options.mouse.repelThreshold, 2) / rd) * (rd / options.mouse.repelThreshold)

    dx = bx - x
    dy = by - y

    vx = lerp(vx, dx + (cos(phi) * f), options.particles.vLerpAmt)
    vy = lerp(vy, dy + (sin(phi) * f), options.particles.vLerpAmt)

    x = lerp(x, x + vx, options.particles.pLerpAmt)
    y = lerp(y, y + vy, options.particles.pLerpAmt)

    return [x, y, vx, vy]
}

function outOfBounds(x, y, width, height)
{
    return x < 1 || x >= width || y < 1 || y >= height
}

function renderFrame()
{
    ctx.save()

    ctx.filter = 'blur(8px) brightness(200%)'
    ctx.drawImage(buffer.canvas, 0, 0)

    ctx.filter = 'blur(0)'
    ctx.globalCompositeOperation = 'lighter'
    ctx.drawImage(buffer.canvas, 0, 0)

    ctx.restore()
}

function clearScreen() {
    clear(ctx)
}

function clearBuffer() {
    clear(buffer)
}

function clear(_ctx) {
    _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height)
}

function drawMessage() {
    drawText(options.text.message, centerx, centery, options.text.drawType)
}

function setTextStyles()
{
    setFont(options.text.fontStyle)
    setTextBaseline(textBaselineTypes.MIDDLE)
    setTextAlign(textAlignTypes.CENTER)
}

function drawText(str = '', x = 0, y = 0, type = drawTypes.FILL) {
    buffer[`${type}Text`](str, x, y)
}

function setFont(font) {
    buffer.font = font
}

function setTextAlign(align = textAlignTypes.LEFT) {
    buffer.textAlign = align
}

function setTextBaseline(baseline = textBaselineTypes.ALPHABETIC) {
    buffer.textBaseline = baseline
}

function resize()
{
    buffer.canvas.height = height = innerHeight
    buffer.canvas.width = width = innerWidth

    buffer.drawImage(ctx.canvas, 0, 0)

    ctx.canvas.height = innerHeight
    ctx.canvas.width = innerWidth

    ctx.drawImage(buffer.canvas, 0, 0)

    centery = .5 * innerHeight
    centerx = .5 * innerWidth

    imageBuffer = buffer.createImageData(width, height)
}

function mousemove({ type, clientX, clientY })
{
    hover = type === 'mousemove'
    userx = clientX
    usery = clientY
}
