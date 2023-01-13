import { rclamp } from '../common/clamp.mjs'

export function colorZoom(src, { zoom, center })
{
    const img = src.getImageData(0, 0, src.canvas.width, src.canvas.height)

    for (let grey, i = 0; i < img.data.length; i += 4) {
        if (img.data[i + 3] === 0) continue // transparent

        grey = Math.round(.2126 * img.data[i] + .7152 * img.data[i + 1] + .0722 * img.data[i + 2])

        for (let k, j = 0; j < 3; j++) {
            k = i + j

            if (grey > center) {
                img.data[k] += (img.data[k] - center) * zoom
            } else if (grey < center) {
                img.data[k] -= (center - img.data[k]) * zoom
            }

            img.data[k] = rclamp(img.data[k])
        }
    }

    return img
}
