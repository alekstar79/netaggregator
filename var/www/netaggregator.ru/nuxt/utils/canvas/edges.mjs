/**
* @see https://coderoad.ru/45866873/%D0%9E%D0%B1%D1%80%D0%B5%D0%B7%D0%BA%D0%B0-HTML-canvas-%D0%B4%D0%BE-%D1%88%D0%B8%D1%80%D0%B8%D0%BD%D1%8B-%D0%B2%D1%8B%D1%81%D0%BE%D1%82%D1%8B-%D0%B5%D0%B3%D0%BE-%D0%B2%D0%B8%D0%B4%D0%B8%D0%BC%D1%8B%D1%85-%D0%BF%D0%B8%D0%BA%D1%81%D0%B5%D0%BB%D0%B5%D0%B9-%D1%81%D0%BE%D0%B4%D0%B5%D1%80%D0%B6%D0%B8%D0%BC%D0%BE%D0%B3%D0%BE#45873660
* @param {CanvasRenderingContext2D} ctx
* @param {CanvasRenderingContext2D} output
*/
export function trimCanvas(ctx, output = null)
{
    let x, y, w, h, top, left, right, bottom, data, idx1, idx2, found, imgData

    h = ctx.canvas.height
    w = ctx.canvas.width

    if (!w && !h) return undefined

    imgData = ctx.getImageData(0, 0, w, h)
    data = new Uint32Array(imgData.data.buffer)
    idx1 = 0
    idx2 = w * h - 1
    found = false

    // search from top and bottom to find first rows containing a non transparent pixel
    for (y = 0; y < h && !found; y++) {
        for (x = 0; x < w; x++) {
            if (data[idx1++] && !top) {
                top = y + 1

                if (bottom) { // found then stop the search
                    found = true
                    break
                }
            }
            if (data[idx2--] && !bottom) {
                bottom = h - y - 1

                if (top) { // found then stop the search
                    found = true
                    break
                }
            }
        }

        // image is completely blank so do nothing
        if (y > h - y && !top && !bottom) return undefined
    }

    top -= 1 // correct top
    found = false

    // search from left and right to find first column containing a non transparent pixel
    for (x = 0; x < w && !found; x++) {
        idx1 = top * w + x
        idx2 = top * w + (w - x - 1)

        for (y = top; y <= bottom; y++) {
            if (data[idx1] && !left) {
                left = x + 1

                if (right) { // found then stop the search
                    found = true
                    break
                }
            }
            if (data[idx2] && !right) {
                right = w - x - 1

                if (left) { // found then stop the search
                    found = true
                    break
                }
            }

            idx1 += w
            idx2 += w
        }
    }

    left -= 1 // correct left

    // no need to crop if no change in size
    if (w === right - left + 1 && h === bottom - top + 1) {
        return undefined
    }

    w = right - left + 1
    h = bottom - top + 1

    output || (output = ctx)

    output.canvas.height = h
    output.canvas.width = w

    // output.putImageData(imgData, -left, -top)

    return { left, top, w, h }
}

/**
* @see https://progi.pro/metod-javascript-dlya-opredeleniya-oblasti-png-kotoraya-ne-yavlyaetsya-prozrachnoy-2671712
* @see https://overcoder.net/q/1371226/%D0%BC%D0%B5%D1%82%D0%BE%D0%B4-javascript-%D0%B4%D0%BB%D1%8F-%D0%BE%D0%B1%D0%BD%D0%B0%D1%80%D1%83%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F-%D0%BD%D0%B5%D0%BF%D1%80%D0%BE%D0%B7%D1%80%D0%B0%D1%87%D0%BD%D0%BE%D0%B9-%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D0%B8-png#4205053
* @see https://coderoad.ru/23255825/%D0%9A%D0%B0%D0%BA-%D0%BE%D0%BF%D1%80%D0%B5%D0%B4%D0%B5%D0%BB%D0%B8%D1%82%D1%8C-%D1%84%D0%BE%D1%80%D0%BC%D1%83-%D0%BD%D0%B0-%D0%BF%D1%80%D0%BE%D0%B7%D1%80%D0%B0%D1%87%D0%BD%D0%BE%D0%BC-canvas#23256220
* @param {CanvasRenderingContext2D} ctx
* @param {CanvasRenderingContext2D} output
*/
export function scanEdge(ctx, output = null)
{
    let imgData, buffer32, height, width, x1, y1, x2, y2, x, y

    height = ctx.canvas.height
    width = ctx.canvas.width

    if (!width && !height) return undefined

    imgData = ctx.getImageData(0, 0, width, height)
    buffer32 = new Uint32Array(imgData.data.buffer)
    x1 = width
    y1 = height
    x2 = 0
    y2 = 0

      // get top edge
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            if (buffer32[x + y * width] > 0) {
                if (y < y1) y1 = y
            }
        }
    } // get bottom edge
    for (y = height; y >= 0; y--) {
        for (x = 0; x < width; x++) {
            if (buffer32[x + y * width] > 0) {
                if (y > y2) y2 = y
            }
        }
    } // get left edge
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            if (buffer32[x + y * width] > 0) {
                if (x < x1) x1 = x
            }
        }
    } // get right edge
    for (x = width; x >= 0; x--) {
        for (y = 0; y < height; y++) {
            if (buffer32[x + y * width] > 0) {
                if (x > x2) x2 = x
            }
        }
    }

    const w = x2 - x1, h = y2 - y1

    output || (output = ctx)

    output.canvas.height = h
    output.canvas.width = w

    // output.drawImage(ctx.canvas, x1, y1, w, h, 0, 0, w, h)

    return { left: x1, top: y1, w, h }
}
