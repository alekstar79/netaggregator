/**
* @see https://github.com/arahaya/ImageFilters.js
* @see https://github.com/rendro/vintageJS
*/

import { rgbToHsl, hslToRgb } from '../../index.mjs'
import { random } from '../../../common/random.mjs'
import { rclamp } from '../../../common/clamp.mjs'
import { range } from '../../../common/range.mjs'
import { init } from '../glfx/index.mjs'

const decompose = i => ({ idr: i, idg: i + 1, idb: i + 2, ida: i + 3 }),
    { ceil, sqrt, pow, max, round, floor } = Math

const buildMap = f => range(256).map((_, i) => f(i))
const applyMap = ({ data, width, height }, dst, map) => {
    for (let i = width * height; i >= 0; --i) {
        const { idr, idg, idb, ida } = decompose(i << 2)

        dst.data[idr] = map[data[idr]]
        dst.data[idg] = map[data[idg]]
        dst.data[idb] = map[data[idb]]
        dst.data[ida] = data[ida]
    }
}

export const mapRGB = (src, dst, fn) => {
    applyMap(src, dst, buildMap(fn))
}

export const clone = ({ data, width, height }) => {
    return new ImageData(data.slice(), width, height)
}

export const toImage = src => {
    return new Promise(resolve => {
        const image = new Image()

        image.crossOrigin = 'anonymous'
        image.onload = resolve
        image.src = src
    })
}

export const convolutionFilter = function(
    src, mX, mY, matrix, div = 1, offset = 0,
    pAlpha = true,
    clip = true,
    color = 0,
    alpha = 0
) {
    const dst = clone(src),

        clampR = color >> 16 & 0xFF,
        clampG = color >> 8 & 0xFF,
        clampB = color & 0xFF,
        clampA = alpha * 0xFF,

        rows = mX >> 1,
        cols = mY >> 1

    for (let idx = 0, y = 0; y < src.height; y++) {
        for (let x = 0; x < src.width; idx += 4, x++) {
            let { idr, idg, idb, ida } = decompose(idx),
                r = 0, g = 0, b = 0, a = 0,
                replace = false,
                mIndex = 0

            for (let row = -rows; row <= rows; row++) {
                let rowIndex = y + row, offset

                if (rowIndex >= 0 && rowIndex < src.height) {
                    offset = rowIndex * src.width
                } else if (clip) {
                    offset = y * src.width
                } else {
                    replace = true
                }

                for (let col = -cols; col <= cols; col += 1) {
                    const m = matrix[mIndex++]

                    if (m !== 0) {
                        let colIndex = x + col

                        if (!(colIndex >= 0 && colIndex < src.width)) {
                            if (clip) {
                                colIndex = x
                            } else {
                                replace = true
                            }
                        }
                        if (replace) {
                            r += m * clampR
                            g += m * clampG
                            b += m * clampB
                            a += m * clampA
                        } else {
                            let p = (offset + colIndex) << 2

                            r += m * src.data[p]
                            g += m * src.data[p + 1]
                            b += m * src.data[p + 2]
                            a += m * src.data[p + 3]
                        }
                    }
                }
            }

            dst.data[idr] = rclamp(r / div + offset)
            dst.data[idg] = rclamp(g / div + offset)
            dst.data[idb] = rclamp(b / div + offset)
            dst.data[ida] = pAlpha
                ? src.data[ida]
                : rclamp(a / div + offset)
        }
    }

    return dst
}

export const colorMatrixFilter = function(src, m, rect) {
    let { data, width, height } = src,
        startH = height,
        startW = width,
        endH = 0,
        endW = 0,
        r,g,b,a

    if (rect) {
        startH = rect.y + rect.h
        startW = rect.x + rect.w
        endH = rect.y
        endW = rect.x
    }

    for (let y = startH; y >= endH; --y) {
        for (let x = startW; x >= endW; --x) {
            const { idr, idg, idb, ida } = decompose(((y * width) + x - .5 | 0) << 2)

            r = data[idr]
            g = data[idg]
            b = data[idb]
            a = data[ida]

            data[idr] = rclamp(r * m[0] + g * m[1] + b * m[2] + a * m[3] + m[4])
            data[idg] = rclamp(r * m[5] + g * m[6] + b * m[7] + a * m[8] + m[9])
            data[idb] = rclamp(r * m[10] + g * m[11] + b * m[12] + a * m[13] + m[14])
            data[ida] = rclamp(r * m[15] + g * m[16] + b * m[17] + a * m[18] + m[19])
        }
    }

    return src
}

const boxBlur = function(src, dst, width, height, radius) {
    const tableSize = radius * 2 + 1,
        radiusPlus1 = radius + 1,
        widthMinus1 = width - 1,
        sumTable = []

    let srcIndex = 0,
        nextIndex,
        prevIndex,
        dstIndex,
        next,
        prev

    for (let i = 0, l = 256 * tableSize; i < l; i++) {
        sumTable[i] = i / tableSize | 0
    }
    for (let idx, r, g, b, a, y = 0; y < height; y++) {
        idx = srcIndex << 2
        r = g = b = a = 0
        dstIndex = y

        r += radiusPlus1 * src[idx]
        g += radiusPlus1 * src[idx + 1]
        b += radiusPlus1 * src[idx + 2]
        a += radiusPlus1 * src[idx + 3]

        for (let i = 1; i <= radius; i++) {
            idx = (srcIndex + (i < width ? i : widthMinus1)) << 2

            r += src[idx]
            g += src[idx + 1]
            b += src[idx + 2]
            a += src[idx + 3]
        }
        for (let x = 0; x < width; x++) {
            idx = dstIndex << 2

            dst[idx]     = sumTable[r]
            dst[idx + 1] = sumTable[g]
            dst[idx + 2] = sumTable[b]
            dst[idx + 3] = sumTable[a]

            nextIndex = x + radiusPlus1
            if (nextIndex > widthMinus1) {
                nextIndex = widthMinus1
            }

            prevIndex = x - radius
            if (prevIndex < 0) {
                prevIndex = 0
            }

            next = (srcIndex + nextIndex) << 2
            prev = (srcIndex + prevIndex) << 2

            r += src[next]     - src[prev]
            g += src[next + 1] - src[prev + 1]
            b += src[next + 2] - src[prev + 2]
            a += src[next + 3] - src[prev + 3]

            dstIndex += height
        }

        srcIndex += width
    }
}

const stroke = (i, x) => i % (x * 5) === 0 ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.1)'
const intensity = (r, g, b) => (r * 19595 + g * 38470 + b * 7471) >> 16
const contrastFactor = val => (259 * (val + 255)) / (255 * (259 - val))

const solarFunction = sol => {
    const k = 255 / sol
    return v => v > k ? (v - k) * sol : (k - v) * sol
}

export const color2heat = function(r, g, b) {
    const value = round(.2126 * r + .7152 * g + .0722 * b) / 255,
        RGB = { r: 0, g: 0, b: 0 }

    if (value >= 0 && value <= 1 / 8) {
        RGB.r = 0
        RGB.g = 0
        RGB.b = 4 * value + .5
    } else if (1 / 8 < value && value <= 3 / 8) {
        RGB.r = 0
        RGB.g = 4 * value - .5
        RGB.b = 1
    } else if (3 / 8 < value && value <= 5 / 8) {
        RGB.r = 4 * value - 1.5
        RGB.g = 1
        RGB.b = -4 * value + 2.5
    } else if (5 / 8 < value && value <= 7 / 8) {
        RGB.r = 1
        RGB.g = -4 * value + 3.5
        RGB.b = 0
    } else if (7 / 8 < value && value <= 1) {
        RGB.r = -4 * value + 4.5
        RGB.g = 0
        RGB.b = 0
    } else {
        RGB.r = .5
        RGB.g = 0
        RGB.b = 0
    }

    RGB.r = round(RGB.r * 255)
    RGB.g = round(RGB.g * 255)
    RGB.b = round(RGB.b * 255)

    return RGB
}

export const matrices = {
    brownie: [
         0.59970, 0.34553,-0.27082,0, 0.186,
        -0.03770, 0.86095, 0.15059,0,-0.1449,
         0.24113,-0.07441, 0.44972,0,-0.02965,
         0,0,0,1,0
    ],
    vintage: [
        0.62793, 0.32021,-0.03965,0,0.03784,
        0.02578, 0.64411, 0.03259,0,0.02926,
        0.04660,-0.08512, 0.52416,0,0.02023,
        0,0,0,1,0
    ],
    kodachrome: [
         1.12855,-0.39673,-0.03992,0,0.24991,
        -0.16404, 1.08352,-0.05498,0,0.09698,
        -0.16786,-0.56034, 1.60148,0,0.13972,
         0,0,0,1,0
    ],
    technicolor: [
         1.91252,-0.85453,-0.09155,0, 0.04624,
        -0.30878, 1.76589,-0.10601,0,-0.27589,
        -0.23110,-0.75018, 1.84759,0, 0.12137,
         0,0,0,1,0
    ],
    polaroid: [
         1.438,-0.062,-0.062,0,0,
        -0.122, 1.378,-0.122,0,0,
        -0.016,-0.016, 1.483,0,0,
         0,0,0,1,0
    ],
    sepia: [
        0.393,0.769,0.189,0,0,
        0.349,0.686,0.168,0,0,
        0.272,0.534,0.131,0,0,
        0,0,0,1,0
    ],
    greyscale: [
        0.333,0.333,0.333,0,0,
        0.333,0.333,0.333,0,0,
        0.333,0.333,0.333,0,0,
        0,0,0,1,0
    ],
    blackwhite: [
        1.5,1.5,1.5,0,-1,
        1.5,1.5,1.5,0,-1,
        1.5,1.5,1.5,0,-1,
        0,0,0,1,0
    ],
    invert: [
        -1, 0, 0, 0, 255,
         0,-1, 0, 0, 255,
         0, 0,-1, 0, 255,
         0, 0, 0, 1, 0
    ],
    r: [
        1, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 1, 0
    ],
    g: [
        0, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 1, 0
    ],
    b: [
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ],
    rgb: [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ]
}

export const filter = {
    edge: [
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1
    ],
    emboss: [
        -2, -1, 0,
        -1,  1, 1,
         0,  1, 2
    ],
    enrich: [
         0, -2,  0,
        -2, 20, -2,
         0, -2,  0
    ]
}

/**
* @param {HTMLCanvasElement} canvas
* @param {Object} presets
* @constructor
*/
export const Effect = function(canvas, presets = null) {
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new TypeError('The first parameter must be an instance of HTMLCanvasElement')
    }

    const { height, width } = canvas,
        ctx = canvas.getContext('2d'),
        glfx = init(),

        /**
        * @returns {CanvasRenderingContext2D}
        */
        getContext = function() {
            const canvas = document.createElement('canvas'),
                context = canvas.getContext('2d')

            canvas.height = height
            canvas.width = width

            return context
        },

        effectPresets = options => [
            'vignette','lighten','contrast','brightness','opacity',
            'curves','screen','noise','sepia','grayscale','invert',
            'solarize','desaturate'
        ].reduce((effect, k) => {
            effect[k] = options[k]
            return effect
        }, {}),

        createRadialGradient = (w, h, r) => ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r),
        putData = imagedata => ctx.putImageData(imagedata, 0, 0),
        getData = () => ctx.getImageData(0, 0, width, height),
        clsData = () => ctx.clearRect(0, 0, width, height),

        original = getData(),

        vignette = function(alpha) {
            ctx.globalCompositeOperation = 'source-over'

            const radius = sqrt(pow(width / 2, 2) + pow(height / 2, 2)),
                gradient = createRadialGradient(width, height, radius)

            gradient.addColorStop(0,  'rgba(0,0,0,0)')
            gradient.addColorStop(.5, 'rgba(0,0,0,0)')
            gradient.addColorStop(1, `rgba(0,0,0,${alpha})`)

            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)

            return this
        },
        lighten = function(alpha) {
            ctx.globalCompositeOperation = 'lighter'

            const radius = sqrt(pow(width / 2, 2) + pow(height / 2, 2)),
                gradient = createRadialGradient(width, height, radius)

            gradient.addColorStop(0, `rgba(255,255,255,${alpha})`)
            gradient.addColorStop(.5, 'rgba(255,255,255,0)')
            gradient.addColorStop(1, 'rgba(0,0,0,0)')

            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)

            return this
        },

        prepare = function(args) {
            let [x, y, w, h] = args

            h || (h = height)
            w || (w = width)
            x || (x = 0)
            y || (y = 0)

            return [x, y, w, h]
        },
        resize = function(...args) {
            if (!args.length) return this

            const context = getContext(),
                [x, y, w, h] = prepare(args),
                { canvas } = context,
                src = getData()

            clsData()

            canvas.height = max(height, h)
            canvas.width = max(width, w)

            context.putImageData(src, 0, 0)
            ctx.drawImage(canvas, x, y, w, h)

            return this
        },
        crop = function(...args) {
            if (!args.length) return this

            const [x, y, w, h] = prepare(args),
                img = ctx.getImageData(x, y, w, h)

            clsData()
            ctx.putImageData(img, x, y)

            return this
        },
        flip = function(vertical) {
            const src = getData(), dst = clone(src)

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let srcIdx = (y * width + x) << 2,

                        dstIdx = vertical
                            ? ((height - y - 1) * width + x) << 2
                            : (y * width + (width - x - 1)) << 2,

                        { idr: sri, idg: sgi, idb: sbi, ida: sai } = decompose(srcIdx),
                        { idr: dri, idg: dgi, idb: dbi, ida: dai } = decompose(dstIdx)

                    dst.data[dri] = src.data[sri]
                    dst.data[dgi] = src.data[sgi]
                    dst.data[dbi] = src.data[sbi]
                    dst.data[dai] = src.data[sai]
                }
            }

            putData(dst)

            return this
        },
        convolution = function(mX, mY, matrix, div, offset) {
            putData(convolutionFilter(getData(), mX, mY, matrix, div, offset))
            return this
        },
        edge = function() {
            return convolution.call(this, 3, 3, filter.edge)
        },
        emboss = function() {
            return convolution.call(this, 3, 3, filter.emboss)
        },
        enrich = function() {
            return convolution.call(this, 3, 3, filter.enrich, 10, -40)
        },
        blur = function(radius = 1, iterations = 2) {
            const img = getData(), tmp = clone(img)

            while (iterations-- > 0) {
                boxBlur(img.data, tmp.data, width, height, radius)
                boxBlur(tmp.data, img.data, height, width, radius)
            }

            putData(img)

            return this
        },
        /**
        * @param {Number} brightness -100 <= n <= 100
        * @param {Number} contrast -100 <= n <= 100
        */
        brightnessContrast = function(brightness = 0, contrast = 0) {
            brightness = (brightness + 100) / 100
            contrast = (contrast + 100) / 100

            const fn = v => ((v * brightness - 127.5) * contrast + 127.5) + .5 | 0,
                src = getData(), dst = clone(src)

            mapRGB(src, dst, fn)
            putData(dst)

            return this
        },
        /**
        * @param {Number} gamma 0 <= n <= 3
        */
        gamma = function(gamma = 1) {
            const fn = v => rclamp(255 * pow(v / 255, 1 / gamma)),
                src = getData(), dst = clone(src)

            mapRGB(src, dst, fn)
            putData(dst)

            return this
        },
        /**
        * @param {Number} scale 1 <= n <= 2
        */
        scale = function(scale = 1) {
            const src = getData(), dst = clone(src)

            mapRGB(src, dst, v => rclamp(v * scale))
            putData(dst)

            return this
        },
        /**
        * Color matrix transforms
        */
        curves = function(rM = 1, gM = 1, bM = 1, aM = 1, rO = 0, gO = 0, bO = 0, aO = 0)
        {
            putData(colorMatrixFilter(getData(), [
                rM,  0,  0,  0, rO,
                 0, gM,  0,  0, gO,
                 0,  0, bM,  0, bO,
                 0,  0,  0, aM, aO
            ]))

            return this
        },
        /**
        * @param {String} mx
        * @param {Object} rect
        */
        colorMatrix = function(mx = 'rgb', rect = null) {
            const matrix = matrices[mx] || matrices.rgb,
                img = getData()

            putData(colorMatrixFilter(img, matrix, rect))

            return this
        },
        /**
        * @param hue -180 <= n <= 180
        * @param sat -100 <= n <= 100
        * @param lightness -100 <= n <= 100
        */
        hslAdjustment = function(hue, sat, lightness) {
            hue /= 360; sat /= 100; lightness /= 100

            const img = getData()

            // noinspection DuplicatedCode
            for (let h, s, l, hsl, rgb, i = width * height; i >= 0; --i) {
                const { idr, idg, idb } = decompose(i << 2)

                hsl = rgbToHsl(img.data[idr], img.data[idg], img.data[idb])

                // hue
                h = hsl[0] + hue
                while (h < 0) h += 1
                while (h > 1) h -= 1

                // saturation
                s = hsl[1] + hsl[1] * sat
                if (s < 0) {
                    s = 0
                } else if (s > 1) {
                    s = 1
                }

                // lightness
                l = hsl[2]
                if (lightness > 0) {
                    l += (1 - l) * lightness
                } else if (lightness < 0) {
                    l += l * lightness
                }

                rgb = hslToRgb(h, s, l)

                img.data[idr] = rgb[0]
                img.data[idg] = rgb[1]
                img.data[idb] = rgb[2]
            }

            putData(img)

            return this
        },
        heatmap = function() {
            const img = getData()

            for (let i = width * height; i >= 0; --i) {
                let { idr, idg, idb, ida } = decompose(i << 2)

                if (img.data[ida] === 0) continue

                const RGB = color2heat(
                    img.data[idr],
                    img.data[idg],
                    img.data[idb]
                )

                img.data[idr] = RGB.r
                img.data[idg] = RGB.g
                img.data[idb] = RGB.b
            }

            putData(img)

            return this
        },
        /**
        * @param {Number} val 0 <= n <= 1
        */
        desaturate = function(val = 0) {
            const img = getData()

            for (let avg, i = width * height; i >= 0; --i) {
                const { idr, idg, idb } = decompose(i << 2)

                avg = (img.data[idr] + img.data[idg] + img.data[idb]) / 3

                img.data[idr] += ((avg - img.data[idr]) * val)
                img.data[idg] += ((avg - img.data[idg]) * val)
                img.data[idb] += ((avg - img.data[idb]) * val)
            }

            putData(img)

            return this
        },
        sharpen = function(f = 1) {
            return convolution.call(this, 3, 3, [
                -f / 16, -f / 8, -f / 16,
                -f / 8, f * .75 + 1, -f / 8,
                -f / 16, -f / 8, -f / 16
            ])
        },
        sepia = function(f, rect) {
            f || (f = 0)

            // noinspection DuplicatedCode
            putData(colorMatrixFilter(getData(), [
                1.0 - (0.607 * f), 0.769 * f, 0.189 * f, 0, 0,
                0.349 * f, 1.0 - (0.314 * f), 0.168 * f, 0, 0,
                0.272 * f, 0.534 * f, 1.0 - (0.869 * f), 0, 0,
                0, 0, 0, 1, 0
            ], rect))

            return this
        },
        grayscale = function() {
            const img = getData()

            for (let i = width * height; i >= 0; --i) {
                const { idr, idg, idb, ida } = decompose(i << 2)

                if (img.data[ida] === 0) continue

                const gray = intensity(
                    img.data[idr],
                    img.data[idg],
                    img.data[idb]
                )

                img.data[idr] = gray
                img.data[idg] = gray
                img.data[idb] = gray
            }

            putData(img)

            return this
        },
        invert = function() {
            const src = getData(), dst = clone(src)

            mapRGB(src, dst, v => 255 - v)
            putData(dst)

            return this
        },
        /**
        * Alternate curves.call(this, 1, 1, 1, opacity)
        * @param {Number} f 0 <= n <= 1
        */
        opacity = function(f = 1) {
            const img = getData()

            for (let ida, i = width * height; i >= 0; --i) {
                ida = (i << 2) + 3
                img.data[ida] = rclamp(img.data[ida] * f)
            }

            putData(img)

            return this
        },
        /**
        * @param {Number} multiplier 1 <= n <= 3
        */
        solarize = function(multiplier = 2) {
            const src = getData(), dst = clone(src),
                fn = solarFunction(multiplier)

            mapRGB(src, dst, fn)
            putData(dst)

            return this
        },
        /**
        * @param {Number} f 2 <= n <= 100
        */
        posterize = function(f = 16) {
            f = rclamp(f, 2, 100)

            const src = getData(), dst = clone(src)

            let factor = f - 1,
                map = [],
                j = 0,
                k = 0

            for (let i = 0; i < f; i++) {
                map[i] = (255 * i) / factor
            }

            mapRGB(src, dst, () => {
                const ret = map[j]

                k += f

                if (k > 255) {
                    k -= 255
                    j += 1
                }

                return ret
            })

            putData(dst)

            return this
        },
        pixelate = function(block = 1) {
            const rows = ceil(height / block),
                cols = ceil(width / block),
                src = getData()

            let xStart, xEnd, yStart, yEnd,
                x, y, yIndex, index, size,
                r, g, b, a

            for (let row = 0; row < rows; row++) {
                yStart = row * block
                yEnd = yStart + block

                if (yEnd > height) {
                    yEnd = height
                }

                for (let col = 0; col < cols; col++) {
                    xStart = col * block
                    xEnd = xStart + block

                    if (xEnd > width) {
                        xEnd = width
                    }

                    r = g = b = a = 0
                    size = (xEnd - xStart) * (yEnd - yStart)

                    for (y = yStart; y < yEnd; y++) {
                        yIndex = y * width

                        for (x = xStart; x < xEnd; x++) {
                            index = (yIndex + x) << 2

                            r += src.data[index]
                            g += src.data[index + 1]
                            b += src.data[index + 2]
                            a += src.data[index + 3]
                        }
                    }

                    r = (r / size) + .5 | 0
                    g = (g / size) + .5 | 0
                    b = (b / size) + .5 | 0
                    a = (a / size) + .5 | 0

                    for (y = yStart; y < yEnd; y++) {
                        yIndex = y * width

                        for (x = xStart; x < xEnd; x++) {
                            index = (yIndex + x) << 2

                            src.data[index]     = r
                            src.data[index + 1] = g
                            src.data[index + 2] = b
                            src.data[index + 3] = a
                        }
                    }
                }
            }

            putData(src)

            return this
        },
        oil = function(range = 0, f = 1) {
            const src = getData(), dst = clone(src)

            let index = 0,

                i, row, col,
                rowIdx, colIdx, offset, srcIdx,
                sr, sg, sb, idr, idg, idb,

                rh = [], gh = [], bh = [],
                rt = [], gt = [], bt = [],

                r, g, b

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    for (i = 0; i < f; i++) {
                        rh[i] = gh[i] = bh[i] = rt[i] = gt[i] = bt[i] = 0
                    }
                    for (row = -range; row <= range; row++) {
                        rowIdx = y + row

                        if (rowIdx < 0 || rowIdx >= height) {
                            continue
                        }

                        offset = rowIdx * width

                        for (col = -range; col <= range; col++) {
                            colIdx = x + col

                            if (colIdx < 0 || colIdx >= width) {
                                continue
                            }

                            srcIdx = (offset + colIdx) << 2

                            sr = src.data[srcIdx]
                            sg = src.data[srcIdx + 1]
                            sb = src.data[srcIdx + 2]

                            idr = (sr * f) >> 8
                            idg = (sg * f) >> 8
                            idb = (sb * f) >> 8

                            rt[idr] += sr
                            gt[idg] += sg
                            bt[idb] += sb

                            rh[idr] += 1
                            gh[idg] += 1
                            bh[idb] += 1
                        }
                    }

                    r = g = b = 0
                    for (i = 1; i < f; i++) {
                        if (rh[i] > rh[r]) r = i
                        if (gh[i] > gh[g]) g = i
                        if (bh[i] > bh[b]) b = i
                    }

                    dst.data[index]     = rt[r] / rh[r] | 0
                    dst.data[index + 1] = gt[g] / gh[g] | 0
                    dst.data[index + 2] = bt[b] / bh[b] | 0

                    index += 4
                }
            }

            putData(dst)

            return this
        },
        noise = function(f = 7) {
            if (f === 0) return this

            const img = getData()

            for (let i = width * height; i >= 0; --i) {
                const { idr, idg, idb, ida } = decompose(i << 2)

                if (img.data[ida] === 0) continue

                const dx = random(0, f)

                img.data[idr] = rclamp(img.data[idr] + dx)
                img.data[idg] = rclamp(img.data[idg] + dx)
                img.data[idb] = rclamp(img.data[idb] + dx)
            }

            putData(img)

            return this
        },
        drawgrid = function({ x, y }) {
            ctx.lineWidth = 1

            for (let i = x; i < width; i += x) {
                if (x === 0) break

                ctx.strokeStyle = stroke(i, x)

                ctx.beginPath()
                ctx.moveTo(.5 + i, 0)
                ctx.lineTo(.5 + i, height)
                ctx.stroke()
            }
            for (let i = y; i < height; i += y) {
                if (y === 0) break

                ctx.strokeStyle = stroke(i, y)

                ctx.beginPath()
                ctx.moveTo(0, .5 + i)
                ctx.lineTo(width, .5 + i)
                ctx.stroke()
            }

            return this
        },
        blueprint = function(set) {
            convolution(3, 3, filter.edge)

            let context = getContext(), src = getData(), dst = clone(src),
                { canvas: temp } = context

            mapRGB(src, dst, v => rclamp(1.7 * v))

            // noinspection JSCheckFunctionSignatures
            src = glfx.draw(glfx.texture(dst)).denoise(20)
                .update().getImageData()

            putData(src)

            if (set) {
                drawgrid(set)
            }

            context.fillStyle = '#3E7BB5'
            context.fillRect(0, 0, width, height)
            context.globalCompositeOperation = 'screen'
            context.filter = 'grayscale(1)'
            context.drawImage(canvas, 0, 0)

            ctx.drawImage(temp, 0, 0)

            return this
        },
        dotScreen = function(angle = 0, size = 3) {
            let h = floor(height / 2),
                w = floor(width / 2),
                src = getData()

            // noinspection JSCheckFunctionSignatures
            src = glfx.draw(glfx.texture(src))
                .dotScreen(w, h, angle, size)
                .update().getImageData()

            putData(src)

            return this
        },
        flakes = function(level = 7) {
            if (level === 0) return this

            const n = level * width * height / 100,
                color = 200, size = 2

            for (let i = 0; i < n; i++) {
                const power = random(5, 10 + level),
                    x = random(0, width),
                    y = random(0, height)

                ctx.fillStyle = `rgba(${color},${color},${color},${power / 255})`
                ctx.fillRect(x, y, size, size)
            }

            return this
        },

        applyPreset = function(options) {
            if (!options) return this

            let contrast, average, intensity, noise, solar, data,
                img, idr, idg, idb, ida, r, g, b, a,
                effect = effectPresets(options)

            if (effect.contrast) {
                contrast = contrastFactor(effect.contrast)
            }
            if (effect.solarize) {
                solar = solarFunction(effect.solarize)
            }
            if (effect.vignette) {
                vignette(effect.vignette)
            }
            if (effect.lighten) {
                lighten(effect.lighten)
            }

            ({ data } = img = getData())

            for (let i = width * height; i >= 0; i--) {
                ({ idr, idg, idb, ida } = decompose(i << 2))

                // curves (object)
                if (effect.curves) {
                    data[idr] = effect.curves.r ? effect.curves.r[data[idr]] : data[idr]
                    data[idg] = effect.curves.g ? effect.curves.g[data[idg]] : data[idg]
                    data[idb] = effect.curves.b ? effect.curves.b[data[idb]] : data[idb]
                    data[ida] = effect.curves.a ? effect.curves.a[data[ida]] : data[ida]
                }

                // contrast (integer from -255 to 255)
                if (effect.contrast) {
                    data[idr] = contrast * (data[idr] - 128) + 128
                    data[idg] = contrast * (data[idg] - 128) + 128
                    data[idb] = contrast * (data[idb] - 128) + 128
                }

                // brightness (integer from -255 to 255) TV based algorithm
                if (effect.brightness) {
                    data[idr] += effect.brightness
                    data[idg] += effect.brightness
                    data[idb] += effect.brightness
                }

                // opacity (integer from -255 to 255)
                if (effect.opacity) {
                    data[ida] = effect.opacity
                }

                // screen (object)
                if (effect.screen) {
                    ({ r, g, b, a } = effect.screen)

                    data[idr] = 255 - ((255 - data[idr]) * (255 - r * a) / 255)
                    data[idg] = 255 - ((255 - data[idg]) * (255 - g * a) / 255)
                    data[idb] = 255 - ((255 - data[idb]) * (255 - b * a) / 255)
                }

                // noise (integer)
                if (effect.noise) {
                    noise = random(0, effect.noise)

                    data[idr] = rclamp(data[idr] + noise)
                    data[idg] = rclamp(data[idg] + noise)
                    data[idb] = rclamp(data[idb] + noise)
                }

                // solarize (float)
                if (effect.solarize) {
                    data[idr] = solar(data[idr])
                    data[idg] = solar(data[idg])
                    data[idb] = solar(data[idb])
                }

                // sepia (boolean)
                if (effect.sepia) {
                    r = data[idr]
                    g = data[idg]
                    b = data[idb]

                    data[idr] = rclamp(r * .393 + g * .769 + b * .189)
                    data[idg] = rclamp(r * .349 + g * .686 + b * .168)
                    data[idb] = rclamp(r * .272 + g * .534 + b * .131)
                }

                // grayscale (boolean)
                if (effect.grayscale) {
                    intensity = (data[idr] * 19595 + data[idg] * 38470 + data[idb] * 7471) >> 16
                    data[idr] = data[idg] = data[idb] = intensity
                }

                // desaturate (float from 0 to 1)
                if (effect.desaturate) {
                    average = (data[idr] + data[idg] + data[idb]) / 3

                    data[idr] += ((average - data[idr]) * effect.desaturate)
                    data[idg] += ((average - data[idg]) * effect.desaturate)
                    data[idb] += ((average - data[idb]) * effect.desaturate)
                }

                // invert (boolean)
                if (effect.invert) {
                    data[idr] = 255 - data[idr]
                    data[idg] = 255 - data[idg]
                    data[idb] = 255 - data[idb]
                }
            }

            putData(img)

            return this
        }

    if (presets) {
        applyPreset(presets)
    }

    // noinspection JSValidateTypes
    return {
        toURL: (mime, q = 1.0) => canvas.toDataURL(mime, q),
        reset: () => putData(original),
        apply: applyPreset,
        getData,

        brightnessContrast,
        hslAdjustment,
        convolution,
        colorMatrix,
        desaturate,
        grayscale,
        posterize,
        solarize,
        pixelate,
        edge,

        sharpen,
        opacity,
        curves,
        emboss,
        enrich,
        invert,
        gamma,
        scale,
        sepia,
        blur,
        oil,

        vignette,
        lighten,
        flakes,
        noise,
        blueprint,
        drawgrid,
        dotScreen,
        heatmap,
        resize,
        crop,
        flip
    }
}

Effect.fromImageData = function(imageData) {
    let canvas = document.createElement('canvas'),
        { width: w, height: h } = imageData,
        ctx, e

    canvas.height = h
    canvas.width = w

    ctx = canvas.getContext('2d')
    ctx.putImageData(imageData, 0, 0)
    e = Effect(canvas)

    return Promise.resolve(e)
}

Effect.fromImage = function(img) {
    let canvas = document.createElement('canvas'),
        { width: w, height: h } = img,
        ctx, e

    canvas.height = h
    canvas.width = w

    ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)
    e = Effect(canvas)

    return Promise.resolve(e)
}

Effect.fromURL = function(src) {
    return toImage(src).then(({ target }) => Effect.fromImage(target))
}

Effect.fromContext = function(ctx) {
    return Promise.resolve(Effect(ctx.canvas))
}
