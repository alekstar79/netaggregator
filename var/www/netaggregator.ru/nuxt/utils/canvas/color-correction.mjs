import { rgbToHsl, hslToRgb } from './index.mjs'
import { mapRGB } from './libs/effect/index.mjs'

const createImageData = ({ width, height }) => new ImageData(width, height)

export function brightnessContrast(src, brightness, contrast)
{
    const dst = createImageData(src)

    brightness = (brightness + 100) / 100
    contrast = (contrast + 100) / 100

    mapRGB(src, dst, value => {
        value *= brightness
        value = (value - 127.5) * contrast + 127.5
        return value + .5 | 0
    })

    return dst
}

export function colorTransformFilter(src, r, g, b)
{
    const dst = createImageData(src)

    for (let v, i = 0; i < src.data.length; i += 4) {
        dst.data[i]     = (v = src.data[i]     + r) > 255 ? 255 : v < 0 ? 0 : v
        dst.data[i + 1] = (v = src.data[i + 1] + g) > 255 ? 255 : v < 0 ? 0 : v
        dst.data[i + 2] = (v = src.data[i + 2] + b) > 255 ? 255 : v < 0 ? 0 : v
        dst.data[i + 3] = (v = src.data[i + 3] + 1) > 255 ? 255 : v < 0 ? 0 : v
    }

    return dst
}

export function hslAdjustment(src, hue, sat, lightness)
{
    hue /= 360; sat /= 100; lightness /= 100

    const dst = createImageData(src)

    // noinspection DuplicatedCode
    for (let h, s, l, hsl, rgb, i = 0; i < src.data.length; i += 4) {
        hsl = rgbToHsl(src.data[i], src.data[i + 1], src.data[i + 2])

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

        dst.data[i]     = rgb[0]
        dst.data[i + 1] = rgb[1]
        dst.data[i + 2] = rgb[2]
        dst.data[i + 3] = src.data[i + 3]
    }

    return dst
}

export function doCorrections(src, { brightness, contrast, r, g, b, h, s, l })
{
    const img = src.getImageData(0, 0, src.canvas.width, src.canvas.height)

    let filtered = brightness || contrast
        ? brightnessContrast(img, brightness, contrast)
        : img

    filtered = r || g || b
        ? colorTransformFilter(filtered, r, g, b)
        : filtered

    return h || s || l
        ? hslAdjustment(filtered, h, s, l)
        : filtered
}
