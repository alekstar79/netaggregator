import { hex2rgb, rgbToHsl, hslToRgb } from './index.mjs'

export function replaceColor(src, { target, replacement, power, alpha, mode })
{
    const img = src.getImageData(0, 0, src.canvas.width, src.canvas.height)

    let target_rgb = hex2rgb(target)
    let target_hsl = rgbToHsl(target_rgb.r, target_rgb.g, target_rgb.b)
    let target_normalized = hslToRgb(target_hsl[0], target_hsl[1], .5)

    let replacement_rgb = hex2rgb(replacement)
    let replacement_hsl = rgbToHsl(
        replacement_rgb.r,
        replacement_rgb.g,
        replacement_rgb.b
    )

    for (let i = 0; i < img.data.length; i += 4) {
        if (img.data[i + 3] === 0) continue // transparent

        if (mode === 'Simple') {
            // calculate difference from requested color, and change alpha
            let diff = (Math.abs(img.data[i] - target_rgb.r) +
                Math.abs(img.data[i + 1] - target_rgb.g) +
                Math.abs(img.data[i + 2] - target_rgb.b)) / 3

            if (diff > power) continue

            img.data[i]     = replacement_rgb.r
            img.data[i + 1] = replacement_rgb.g
            img.data[i + 2] = replacement_rgb.b

            if (alpha < 255) {
                img.data[i + 3] = alpha
            }
        } else { // advanced replace using HSL
            let hsl = rgbToHsl(img.data[i], img.data[i + 1], img.data[i + 2]),
                normalized = hslToRgb(hsl[0], hsl[1], .5)

            let diff = (Math.abs(normalized[0] - target_normalized[0]) +
                Math.abs(normalized[1] - target_normalized[1]) +
                Math.abs(normalized[2] - target_normalized[2])) / 3

            if (diff > power) continue

            // change to new color with existing luminance
            let normalized_final = hslToRgb(
                replacement_hsl[0],
                replacement_hsl[1],
                hsl[2] * (replacement_hsl[2])
            )

            img.data[i]     = normalized_final[0]
            img.data[i + 1] = normalized_final[1]
            img.data[i + 2] = normalized_final[2]

            if (alpha < 255) {
                img.data[i + 3] = alpha
            }
        }
    }

    return img
}
