const grey = (data, i) => Math.round(.2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2])

export function getDecreaseData(src, { colors, greyscale = false })
{
    const { width: W, height: H } = src.canvas

    let canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),

        data = src.getImageData(0, 0, W, H),
        imgData = data.data,
        blockSize = 10,
        palette = [],

        bW = Math.ceil(W / blockSize),
        bH = Math.ceil(H / blockSize)

    canvas.height = H
    canvas.width = W

    // collect top colors
    ctx.drawImage(src.canvas, 0, 0, bW, bH)
    let imgP = ctx.getImageData(0, 0, bW, bH),
        imgDataP = imgP.data

    ctx.clearRect(0, 0, W, H)

    for (let i = 0; i < imgDataP.length; i += 4) {
        if (imgDataP[i + 3] === 0) continue // transparent

        palette.push([
            imgDataP[i],
            imgDataP[i + 1],
            imgDataP[i + 2],
            grey(imgDataP, i)
        ])
    }

    // calculate weights
    let greyPalette = []
    for (let i = 0; i < 256; i++) {
        greyPalette[i] = 0
    }
    for (let i = 0; i < palette.length; i++) {
        greyPalette[palette[i][3]]++
    }

    // remove similar colors
    for (let max = 10 * 3; max < 100 * 3; max = max + 10 * 3) {
        if (palette.length <= colors) break

        for (let i = 0; i < palette.length; i++) {
            if (palette.length <= colors) break

            let valid = true
            for (let j = 0; j < palette.length; j++) {
                if (palette.length <= colors) break
                if (i === j) continue

                if (Math.abs(palette[i][0] - palette[j][0]) +
                    Math.abs(palette[i][1] - palette[j][1]) +
                    Math.abs(palette[i][2] - palette[j][2]) < max) {
                    if (greyPalette[palette[i][3]] > greyPalette[palette[j][3]]) {
                        palette.splice(j, 1) // remove color
                        j--
                    } else {
                        valid = false
                        break
                    }
                }
            }
            // remove color
            if (valid === false) {
                palette.splice(i, 1)
                i--
            }
        }
    }

    palette = palette.slice(0, colors)

    // change
    let k, pl = palette.length
    for (let j = 0; j < H; j++) {
        for (let min, mid, idx, i = 0; i < W; i++) {
            k = (j * W * 4) + (i * 4)

            if (imgData[k + 3] === 0) continue // transparent

            // find closest color
            min = 999999
            idx = 0

            for (let m = 0; m < pl; m++) {
                let diff = Math.abs(palette[m][0] - imgData[k]) +
                    Math.abs(palette[m][1] - imgData[k + 1]) +
                    Math.abs(palette[m][2] - imgData[k + 2])

                if (diff < min) {
                    min = diff
                    idx = m
                }
            }

            imgData[k]     = palette[idx][0]
            imgData[k + 1] = palette[idx][1]
            imgData[k + 2] = palette[idx][2]

            if (greyscale === true) {
                mid = grey(imgData, k)

                imgData[k]     = mid
                imgData[k + 1] = mid
                imgData[k + 2] = mid
            }
        }
    }

    return data
}
