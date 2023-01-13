const hex = x => ('0' + parseInt(x).toString(16)).slice(-2)

export function rgbToHex(r, g, b)
{
    if (r > 255 || g > 255 || b > 255) {
        throw new Error('Invalid color component')
    }

    const tmp = ((r << 16) | (g << 8) | b).toString(16)

    return '#' + tmp.padStart(6, '0')
}

export function rgb2hex(rgb)
{
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i)
    return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3])
}

export function hex2rgb(hex)
{
    if (hex[0] === '#') hex = hex.substr(1)

    if (hex.length === 3) {
        const temp = /^([a-f0-9])([a-f0-9])([a-f0-9])$/i.exec(hex).slice(1)

        hex = ''
        for (let i = 0; i < 3; i++) {
            hex += temp[i] + temp[i]
        }
    }

    const triplets = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1)

    return {
        r: parseInt(triplets[0], 16),
        g: parseInt(triplets[1], 16),
        b: parseInt(triplets[2], 16),
        a: 255
    }
}

export function rgbToHsl(r, g, b)
{
    r /= 255; g /= 255; b /= 255

    let cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        chroma = cMax - cMin,
        l = (cMin + cMax) / 2,
        h = 0,
        s = 0

    if (chroma !== 0) {
        if (r === cMax) {
            h = (g - b) / chroma + (g < b ? 6 : 0)
        } else if (g === cMax) {
            h = (b - r) / chroma + 2
        } else {
            h = (r - g) / chroma + 4
        }
        h /= 6

        s = l > .5 ? chroma / (2 - cMax - cMin) : chroma / (cMax + cMin)
    }

    return [h, s, l]
}

export function hslToRgb(h, s, l)
{
    let r, g, b, rgb = []

    if (s === 0) {
        r = g = b = l * 255 + .5 | 0
        rgb = [r, g, b]
    } else {
        let m2 = l <= .5 ? l * (s + 1) : l + s - l * s,
            m1 = l * 2 - m2,
            hue = h + 1 / 3

        for (let tmp, i = 0; i < 3; i++) {
            if (hue < 0) {
                hue += 1
            } else if (hue > 1) {
                hue -= 1
            }
            if (hue < 1 / 6) {
                tmp = m1 + (m2 - m1) * hue * 6
            } else if (hue < 1 / 2) {
                tmp = m2
            } else if (hue < 2 / 3) {
                tmp = m1 + (m2 - m1) * (2 / 3 - hue) * 6
            } else {
                tmp = m1
            }

            rgb[i] = tmp * 255 + .5 | 0
            hue -= 1 / 3
        }
    }

    return rgb
}
