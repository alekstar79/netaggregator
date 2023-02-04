import { nextFrame, cancelFrame } from '~/utils/callbacks.mjs'

let HEX_CRAD = 24,
    HEX_BG = '#171717',
    HEX_HL = '#2a2a2a',
    HEX_HLW = 2,
    HEX_GAP = 4,
    NEON_PALETE = [
        '#cb3301', '#ff0066',
        '#ff6666', '#feff99',
        '#ffff67', '#ccff66',
        '#99fe00', '#fe99ff',
        '#ff99cb', '#fe349a',
        '#cc99fe', '#6599ff',
        '#00ccff', '#ffffff'
    ],

    T_SWITCH = 128, // 64

    unit_x = 3 * HEX_CRAD + HEX_GAP * Math.sqrt(3),
    unit_y = HEX_CRAD * Math.sqrt(3) * .5 + .5 * HEX_GAP,
    off_x = 1.5 * HEX_CRAD + HEX_GAP * Math.sqrt(3) * .5,

    wp = NEON_PALETE.map(c => {
        const num = parseInt(c.replace('#', ''), 16)

        return {
            'r': num >> 16 & 0xFF,
            'g': num >> 8 & 0xFF,
            'b': num & 0xFF
        }
    }),

    nwp = wp.length,
    csi = 0,

    f = 1 / T_SWITCH,

    c = [],
    w, h, _min,
    ctx = [],
    grid,

    t = 0,
    shiftY = 0,
    request_id = null,
    source = null

class GridItem
{
    constructor(x, y)
    {
        this.points = { hex: [], hl: [] }

        this.x = x || 0
        this.y = y || 0

        this.init()
    }

    init()
    {
        let x, y, a, ba = Math.PI / 3, ri = HEX_CRAD - .5 * HEX_HLW

        for (let i = 0; i < 6; i++) {
            a = i * ba
            x = this.x + HEX_CRAD * Math.cos(a)
            y = this.y + HEX_CRAD * Math.sin(a)

            this.points.hex.push({ x, y })

            if (i > 2) {
                x = this.x + ri * Math.cos(a)
                y = this.y + ri * Math.sin(a)

                this.points.hl.push({ x, y })
            }
        }
    }

    draw(ct)
    {
        for (let i = 0; i < 6; i++) {
            ct[(i === 0 ? 'move' : 'line') + 'To'](
                this.points.hex[i].x,
                this.points.hex[i].y
            )
        }
    }

    highlight(ct)
    {
        for (let i = 0; i < 3; i++) {
            ct[(i === 0 ? 'move' : 'line') + 'To'](
                this.points.hl[i].x,
                this.points.hl[i].y
            )
        }
    }
}

class Grid
{
    constructor(rows, cols)
    {
        this.cols = cols || 16
        this.rows = rows || 16
        this.items = []

        this.n = this.items.length

        this.init()
    }

    init()
    {
        let x, y

        for (let row = 0; row < this.rows; row++) {
            y = row * unit_y

            for(let col = 0; col < this.cols; col++) {
                x = ((row % 2 === 0) ? 0 : off_x) + col * unit_x

                this.items.push(new GridItem(x, y))
            }
        }

        this.n = this.items.length
    }

    draw(ct)
    {
        ct.fillStyle = HEX_BG
        ct.beginPath()

        for (let i = 0; i < this.n; i++) {
            this.items[i].draw(ct)
        }

        ct.closePath()
        ct.fill()

        ct.strokeStyle = HEX_HL
        ct.beginPath()

        for (let i = 0; i < this.n; i++) {
            this.items[i].highlight(ct)
        }

        ct.closePath()
        ct.stroke()
    }
}

function fillBackground(bg_fill)
{
    ctx[0].fillStyle = bg_fill
    ctx[0].beginPath()
    ctx[0].rect(0, 0, w, h)
    ctx[0].closePath()
    ctx[0].fill()
}

function neon()
{
    stopAnimation(true)

    let k = (t % T_SWITCH) * f,
        rgb = {
            r: ~~(wp[csi].r * (1 - k) + wp[(csi + 1) % nwp].r * k),
            g: ~~(wp[csi].g * (1 - k) + wp[(csi + 1) % nwp].g * k),
            b: ~~(wp[csi].b * (1 - k) + wp[(csi + 1) % nwp].b * k)
        },

        rgb_str = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')',
        light = ctx[0].createRadialGradient(source.x, source.y, 0, source.x, source.y, .8 * _min),

        stp

    stp = .5 - .5 * Math.sin(7 * t * f) * Math.cos(5 * t * f) * Math.sin(3 * t * f)

    light.addColorStop(0, rgb_str)
    light.addColorStop(stp, 'rgba(0,0,0,.03)')

    fillBackground('rgba(0,0,0,.1)')
    fillBackground(light)

    t++

    if (t % T_SWITCH === 0) {
        csi++

        if (csi === nwp) {
            csi = 0
            t = 0
        }
    }

    startAnimation(true)
}

export function init()
{
    if (!c.length) return

    let rows, cols
    let rect = c[0].getBoundingClientRect()

    shiftY = rect.top
    h = ~~rect.height
    w = ~~rect.width

    _min = .5 * Math.min(w, h)

    rows = ~~(h / unit_y) + 2
    cols = ~~(w / unit_x) + 2

    for (let i = 0; i < 2; i++) {
        c[i].width = w
        c[i].height = h
        ctx[i] = c[i].getContext('2d')
    }

    grid = new Grid(rows, cols)
    grid.draw(ctx[1])

    if (!source) {
        source = {
            x: ~~(w / 2),
            y: ~~(h / 2)
        }
    }

    return ctx[1]
}

export function mousemove(e)
{
    source = { x: e.clientX, y: e.clientY - shiftY }
}

export function startAnimation(glow)
{
    if (!glow) return stopAnimation(glow)

    c.length && (request_id = nextFrame(neon))
}

export function stopAnimation(glow)
{
    request_id && cancelFrame(request_id)
    request_id = null

    if (!glow) clear()
}

export function clear()
{
    ctx[0] && fillBackground('rgba(0,0,0,1)')
}

/**
* @param {HTMLCanvasElement[]} canvasesArray
*/
export function setCanvas(canvasesArray)
{
    c = canvasesArray
}
