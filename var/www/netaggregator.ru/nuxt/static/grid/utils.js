const { atan2, pow, sqrt } = Math

export const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2))
export const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1)
export const lerp = (a, b, t) => (1 - t) * a + t * b

Array.prototype.lerp = function (t = [], a = 0) {
    this.forEach((n, i) => this[i] = lerp(n, t[i], a))
}

Float32Array.prototype.get = function (i = 0, n = 0) {
    let r = []

    for (const t = i + n; i < t; i++) {
        r.push(this[i])
    }

    return r
}

export class PropsArray
{
    constructor(count = 0, props = [], type = 'float')
    {
        this.count = count
        this.props = props
        this.spread = props.length

        this.values = type === 'float'
            ? new Float32Array(count * props.length)
            : new Uint32Array(count * props.length)
    }

    get length()
    {
        return this.values.length
    }

    set(a = [], i = 0)
    {
        this.values.set(a, i)
    }

    setMap(o = {}, i = 0)
    {
        this.set(Object.values(o), i)
    }

    get(i = 0)
    {
        return this.values.get(i, this.spread)
    }

    getMap(i = 0)
    {
        return this.get(i).reduce((r, v, i) => ({ ...r, ...{ [this.props[i]]: v } }), {})
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

    async *read()
    {
        for (let i = 0; i < this.length; i += this.spread) {
            yield { index: i, value: this.get(i) }
        }
    }
}

export function createOffscreenCanvas(width, height)
{
    let _canvas

    if (typeof OffscreenCanvas !== 'undefined') {
        _canvas = new OffscreenCanvas(parseFloat(width), parseFloat(height))
    } else {
        _canvas = createCanvas(width, height)
    }

    return _canvas
}

export function createCanvas(width, height)
{
    const canvas = document.createElement('canvas')

    canvas.height = height
    canvas.width = width

    return canvas
}

export function createContext2D(width = innerWidth, height = innerHeight, contextAttributes)
{
    return createCanvas(width, height).getContext('2d', contextAttributes)
}

export function createOffscreenContext2D(width = innerWidth, height = innerHeight, contextAttributes)
{
    return createOffscreenCanvas(width, height).getContext('2d', contextAttributes)
}

export function createRenderingContext(width, height)
{
    const contextAttributes = { desynchronized: true, willReadFrequently: true }

    const buffer = createOffscreenContext2D(width, height, contextAttributes)
    const ctx = createContext2D(width, height, contextAttributes)

    document.body.appendChild(ctx.canvas)

    return {
        buffer,
        ctx
    }
}
