// noinspection ES6CheckImport
import Canvas from 'canvas'

/**
* @see https://codepen.io/seanfree/pens/public
* @see https://github.com/SeanFree
*/

export const document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : null
export const { PI, cos, sin, tan, abs, sqrt, pow, min, max, ceil, floor, round, random, atan2 } = Math
export const TO_RAD = PI / 180
export const TAU = 2 * PI

export const rand = n => n * random()
export const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2))
export const norm = (n, _min, _max) => (n - _min) / (_max - _min)
export const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1)
export const clamp = (n, _min, _max) => min(max(n, _min), _max)
export const lerp = (a, b, t) => (1 - t) * a + t * b
export const randRange = n => n - rand(2 * n)
export const fadeIn = (t, m) => t / m
export const fadeInOut = (t, m) => {
    let hm = .5 * m
    return abs((t + hm) % m - hm) / hm
}

export const pad = (n, len = 2, char = '0') => {
    let result = `${n}`

    while (result.length < len) {
        result = `${char}${result}`
    }

    return result
}

export const sToTime = s => `${pad(parseInt(`${s / 60}`))}:${pad(parseInt(`${s % 60}`))}`
export const clone = o => JSON.parse(JSON.stringify(o))

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

/**
 * @param {Number} width
 * @param {Number} height
 * @return {{HTMLCanvasElement}}
 */
export function createCanvas(width, height)
{
    const canvas = document ? document.createElement('canvas') : Canvas.createCanvas(width, height)

    canvas.height = height
    canvas.width = width

    return canvas
}

/**
 * @param {Number|String} width
 * @param {Number|String} height
 * @return {{OffscreenCanvas}|{HTMLCanvasElement}}
 */
export function createOffscreenCanvas(width, height)
{
    return typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(parseFloat(width), parseFloat(height))
        : createCanvas(width, height)
}

/**
 * @param {Number} width
 * @param {Number} height
 * @param {Object} contextAttributes
 * @return {{CanvasRenderingContext2D}}
 */
export function createContext2D(width, height, contextAttributes)
{
    return createCanvas(width, height).getContext('2d', contextAttributes)
}

/**
 * @param {Number} width
 * @param {Number} height
 * @param {Object} contextAttributes
 * @return {{OffscreenCanvasRenderingContext2D}}
 */
export function createOffscreenContext2D(width, height, contextAttributes)
{
    return createOffscreenCanvas(width, height).getContext('2d', contextAttributes)
}

/**
 * @param {Number} width
 * @param {Number} height
 * @return {{OffscreenCanvasRenderingContext2D}|{CanvasRenderingContext2D}}
 */
export function createRenderingContext(width, height)
{
    return createOffscreenContext2D(width, height, { willReadFrequently: true, desynchronized: true })
}

export function makeGLCanvas()
{
    let contextNames = ['webgl', 'experimental-webgl'],
        canvas = document.createElement('canvas'),
        gl = null

    for (let i = 0; i < contextNames.length; ++i) {
        try {
            // noinspection JSCheckFunctionSignatures
            gl = canvas.getContext(contextNames[i], {
                // Used so that the buffer contains valid information, and bytes can
                // be retrieved from it. Otherwise, WebGL will switch to the back buffer
                preserveDrawingBuffer: true
            })
        } catch (e) {}
        if (gl !== null) {
            break
        }
    }
    if (gl == null) {
        console.warn('WebGL not supported.')
        return
    }

    return { canvas, gl }
}

// From Wikipedia
function gcd(a, b)
{
    a = Math.abs(a)
    b = Math.abs(b)

    if (b > a) {
        let temp = a; a = b; b = temp
    }
    while (true) {
        if (b === 0) return a
        a %= b
        if (a === 0) return b
        b %= a
    }
}

function isGlContextFillingTheCanvas(gl)
{
    return gl.canvas.width === gl.drawingBufferWidth && gl.canvas.height === gl.drawingBufferHeight
}

/**
* This function works experimentally, by creating an actual canvas and finding the maximum value, the browser allows.
* @see https://overcoder.net/q/9458/%D0%BC%D0%B0%D0%BA%D1%81%D0%B8%D0%BC%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80-%D1%8D%D0%BB%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%D0%B0-ltcanvasgt#111288
* (See issue #2) All browsers reduce the size of the WebGL draw buffer for large canvases
* (usually over 4096px in width or height). This function uses a varian of binary search
* to find the maximum size for a canvas given the provided x to y size ratio.
* To produce exact results, this function expects an integer ratio.
* The ratio will be equal to: xRatio/yRatio.
*/
export function determineMaxCanvasSize(xRatio, yRatio)
{
    const { canvas, gl } = makeGLCanvas()

    // Reduce the ratio to minimum
    const gcdOfRatios = gcd(xRatio, yRatio)

    xRatio /= gcdOfRatios
    yRatio /= gcdOfRatios

    // if the browser cannot handle the minimum ratio, there is not much we can do
    canvas.height = yRatio
    canvas.width = xRatio

    if (!isGlContextFillingTheCanvas(gl)) {
        throw new Error(`The browser is unable to use WebGL canvases with the specified ratio ${xRatio}:${yRatio}`)
    }

    // First find an upper bound
    let ratioMultiple = 1  // to maintain the exact ratio, we will keep the multiplyer that
                           // resulted in the upper bound for the canvas size
    while (isGlContextFillingTheCanvas(gl)) {
        canvas.width  *= 2
        canvas.height *= 2
        ratioMultiple *= 2
    }

    // Search with minVal inclusive, maxVal exclusive
    function binarySearch(minVal, maxVal) {
        if (minVal === maxVal) return minVal

        const middle = Math.floor((maxVal - minVal) / 2) + minVal

        canvas.height = middle * yRatio
        canvas.width = middle * xRatio

        if (isGlContextFillingTheCanvas(gl)) {
            return binarySearch(middle + 1, maxVal)
        } else {
            return binarySearch(minVal, middle)
        }
    }

    ratioMultiple = binarySearch(1, ratioMultiple)

    return [
        xRatio * ratioMultiple,
        yRatio * ratioMultiple
    ]
}

export class PropsArray
{
    constructor(count = 0, props = [])
    {
        this.values = new Float32Array(count * props.length)
        this.spread = props.length

        this.count = count
        this.props = props
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

    *read()
    {
        for (let i = 0; i < this.length; i += this.spread) {
            yield { index: i, value: this.get(i).slice(0, this.spread) }
        }
    }
}
