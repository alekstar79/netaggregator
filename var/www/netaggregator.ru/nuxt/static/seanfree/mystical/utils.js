const { abs, atan2, random } = Math

export const rand = n => n * random()

export const fadeIn = (t, m) => t / m
export const fadeInOut = (t, m) => {
    let hm = .5 * m
    return abs((t + hm) % m - hm) / hm
}

export const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1)
export const lerp = (a, b, t) => (1 - t) * a + t * b

Array.prototype.lerp = function(t = [], a = 0) {
    this.forEach((n, i) => this[i] = lerp(n, t[i], a))
}

Float32Array.prototype.get = function(i = 0, n = 0) {
    const t = i + n

    let r = []

    for (; i < t; i++) {
        r.push(this[i])
    }

    return r
}

export class PropsArray
{
    constructor(count = 0, props = [], type = 'float')
    {
        this.spread = props.length
        this.props = props
        this.count = count

        this.values = type === 'float'
            ? new Float32Array(count * props.length)
            : new Uint32Array(count * props.length)
    }

    get length() {
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
