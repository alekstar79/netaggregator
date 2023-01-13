function whiteThresholdCheck(imgData, white)
{
    let count = 0

    for (let i = 0; i < imgData.length; i += 4) {
        if (imgData[i + 3] === 0) continue // transparent

        if ((imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3 > white) {
            count++
        }
    }

    return count
}

function blackThresholdCheck(imgData, black)
{
    let count = 0

    for (let i = 0; i < imgData.length; i += 4) {
        if (imgData[i + 3] === 0) continue // transparent

        if ((imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3 < black) {
            count++
        }
    }

    return count
}

export function getAdjustData(src)
{
    const img = src.getImageData(0, 0, src.canvas.width, src.canvas.height)

    let imgData = img.data,

        white = 240,        // white color min
        black = 30,         // black color max
        targetWhite = 1,    // how much % white colors should take
        targetBlack = .5,   // how much % black colors should take
        cyclesCount = 10,   // how much iteration to change colors
        modify = 1.1,       // color modify strength

        nValid,
        target,
        done,

        n = imgData.length / 4,
        x

    // make sure we have white
    nValid = whiteThresholdCheck(imgData, white)
    target = targetWhite
    done = false

    for (let j = 0; j < cyclesCount; j++) {
        if (nValid * 100 / n >= target) {
            done = true
        }
        if (done === true) {
            break
        }

        // adjust
        for (let i = 0; i < imgData.length; i += 4) {
            if (imgData[i + 3] === 0) continue // transparent

            for (let c = 0; c < 3; c++) {
                x = i + c

                if (imgData[x] < 10) continue

                // increase white
                imgData[x] *= modify
                imgData[x] = Math.round(imgData[x])

                if (imgData[x] > 255) {
                    imgData[x] = 255
                }
            }
        }

        // recheck
        nValid = whiteThresholdCheck(imgData, white)
    }

    // make sure we have black
    nValid = blackThresholdCheck(imgData, black)
    target = targetBlack
    done = false

    for (let j = 0; j < cyclesCount; j++) {
        if (nValid * 100 / n >= target) {
            done = true
        }
        if (done === true) {
            break
        }

        // adjust
        for (let i = 0; i < imgData.length; i += 4) {
            if (imgData[i + 3] === 0) continue // transparent

            for (let c = 0; c < 3; c++) {
                x = i + c

                if (imgData[x] > 240) continue

                // increase black
                imgData[x] -= (255 - imgData[x]) * modify - (255 - imgData[x])
                imgData[x] = Math.round(imgData[x])
            }
        }

        // recheck
        nValid = blackThresholdCheck(imgData, black)
    }

    return img
}
