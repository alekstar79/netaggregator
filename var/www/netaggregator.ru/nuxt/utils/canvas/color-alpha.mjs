import { hex2rgb } from './index.mjs'

export function colorToAlpha(src, { color })
{
    color = hex2rgb(color)

    const img = src.getImageData(0, 0, src.canvas.width, src.canvas.height)

    for (let i = 0; i < img.data.length; i += 4) {
        if (img.data[i + 3] === 0) continue // transparent

        // calculate difference from requested color, and change alpha
        const diff = Math.abs(img.data[i] - color.r) + Math.abs(img.data[i + 1] - color.g) + Math.abs(img.data[i + 2] - color.b) / 3

        img.data[i] = Math.ceil((img.data[i] - color.r * (1 - img.data[i + 3] / 255)) / (img.data[i + 3] / 255))
        img.data[i + 1] = Math.ceil((img.data[i + 1] - color.g * (1 - img.data[i + 3] / 255)) / (img.data[i + 3] / 255))
        img.data[i + 2] = Math.ceil((img.data[i + 2] - color.b * (1 - img.data[i + 3] / 255)) / (img.data[i + 3] / 255))
        img.data[i + 3] = Math.round(diff)
    }

    return img
}
