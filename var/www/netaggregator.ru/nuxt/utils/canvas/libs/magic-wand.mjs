/**
* Magic wand tool (fuzzy selection by color) for Javascript
* @see https://github.com/Tamersoul/magic-wand-js
*/

/**
* @typedef {Object} BImageData
* @property {Uint8ClampedArray} data
* @property {Number} width
* @property {Number} height
* @property {Number} bytes
*/

/**
* @typedef {Object} Bounds
* @property {Number} minX
* @property {Number} maxX
* @property {Number} minY
* @property {Number} maxY
*/

/**
* @typedef {Object} Mask
* @property {Uint8ClampedArray} data
* @property {Number} width
* @property {Number} height
* @property {Bounds} bounds
*/

/**
 * Flood fill without borders
 * @param {BImageData} image data (extended by number of color bytes)
 * @param {Number} px coordinate of the reference point
 * @param {Number} py coordinate of the reference point
 * @param colorThreshold tolerant color threshold
 * @param {Uint8ClampedArray} [mask] of visited points (optional)
 * @return {?Mask}
 */
export function floodFillWithoutBorders(image, px, py, colorThreshold, mask = null)
{
    let c, x, newY, el, xr, xl, dy, dyl, dyr, checkY,
        data = image.data,
        h = image.height,
        w = image.width,

        bytes = image.bytes, // number of bytes in the color
        maxX = -1, minX = w + 1, maxY = -1, minY = h + 1,
        i = py * w + px, // start point index in the mask data

        visited = new Uint8ClampedArray((mask || w * h)), // mask of visited points
        result = new Uint8ClampedArray(w * h) // result mask

    if (visited[i] === 1) return null

    i = i * bytes // start point index in the image data
    let sampleColor = [data[i], data[i + 1], data[i + 2], data[i + 3]], // start point color (sample)
        stack = [{ y: py, left: px - 1, right: px + 1, dir: 1 }] // first scanning line

    do {

        el = stack.shift() // get line for scanning
        checkY = false

        // noinspection DuplicatedCode
        for (x = el.left + 1; x < el.right; x++) {
            dy = el.y * w
            i = (dy + x) * bytes // point index in the image data

            if (visited[dy + x] === 1) continue // check whether the point has been visited

            // compare the color of the sample
            c = data[i] - sampleColor[0]        // check by red
            if (c > colorThreshold || c < -colorThreshold) continue
            c = data[i + 1] - sampleColor[1]    // check by green
            if (c > colorThreshold || c < -colorThreshold) continue
            c = data[i + 2] - sampleColor[2]    // check by blue
            if (c > colorThreshold || c < -colorThreshold) continue

            checkY = true // if the color of the new point(x,y) is similar to the sample color need to check minmax for Y

            result[dy + x] = 1 // mark a new point in mask
            visited[dy + x] = 1 // mark a new point as visited

            xl = x - 1

            // walk to left side starting with the left neighbor
            while (xl > -1) {
                dyl = dy + xl
                i = dyl * bytes // point index in the image data

                if (visited[dyl] === 1) break // check whether the point has been visited

                // compare the color of the sample
                c = data[i] - sampleColor[0] // check by red
                if (c > colorThreshold || c < -colorThreshold) break
                c = data[i + 1] - sampleColor[1] // check by green
                if (c > colorThreshold || c < -colorThreshold) break
                c = data[i + 2] - sampleColor[2] // check by blue
                if (c > colorThreshold || c < -colorThreshold) break

                result[dyl] = 1
                visited[dyl] = 1

                xl--
            }

            xr = x + 1

            // walk to right side starting with the right neighbor
            while (xr < w) {
                dyr = dy + xr
                i = dyr * bytes // index point in the image data

                if (visited[dyr] === 1) break // check whether the point has been visited

                // compare the color of the sample
                c = data[i] - sampleColor[0] // check by red
                if (c > colorThreshold || c < -colorThreshold) break
                c = data[i + 1] - sampleColor[1] // check by green
                if (c > colorThreshold || c < -colorThreshold) break
                c = data[i + 2] - sampleColor[2] // check by blue
                if (c > colorThreshold || c < -colorThreshold) break

                result[dyr] = 1
                visited[dyr] = 1

                xr++
            }

            // check minmax for X
            if (xl < minX) minX = xl + 1
            if (xr > maxX) maxX = xr - 1

            newY = el.y - el.dir
            if (newY >= 0 && newY < h) { // add two scanning lines in the opposite direction (y - dir) if necessary
                if (xl < el.left) { // from "new left" to "current left"
                    stack.push({ y: newY, left: xl, right: el.left, dir: -el.dir })
                }
                if (el.right < xr) { // from "current right" to "new right"
                    stack.push({ y: newY, left: el.right, right: xr, dir: -el.dir })
                }
            }

            newY = el.y + el.dir
            if (newY >= 0 && newY < h) { // add the scanning line in the direction (y + dir) if necessary
                if (xl < xr) { // from "new left" to "new right"
                    stack.push({ y: newY, left: xl, right: xr, dir: el.dir })
                }
            }
        }

        // check minmax for Y if necessary
        if (checkY) {
            if (el.y < minY) minY = el.y
            if (el.y > maxY) maxY = el.y
        }
    } while (stack.length > 0)

    return {
        data: result,
        width: image.width,
        height: image.height,
        bounds: {
            minX,
            minY,
            maxX,
            maxY
        }
    }
}

/**
 * Flood fill with borders
 * @param {BImageData} image data (extended by number of color bytes)
 * @param {Number} px coordinate of the reference point
 * @param {Number} py coordinate of the reference point
 * @param {Number} colorThreshold tolerant color threshold
 * @param {Uint8ClampedArray=} [mask] of visited points (optional)
 * @return {?Mask}
 */
export function floodFillWithBorders(image, px, py, colorThreshold, mask = null)
{
    let c, x, newY, el, xr, xl, dy, dyl, dyr, checkY,
        data = image.data,
        h = image.height,
        w = image.width,

        bytes = image.bytes, // number of bytes in the color
        maxX = -1, minX = w + 1, maxY = -1, minY = h + 1,
        i = py * w + px, // start point index in the mask data

        visited = new Uint8ClampedArray((mask || w * h)), // mask of visited points
        result = new Uint8ClampedArray(w * h) // result mask

    if (visited[i] === 1) return null

    i = i * bytes // start point index in the image data
    let sampleColor = [data[i], data[i + 1], data[i + 2], data[i + 3]], // start point color (sample)
        stack = [{ y: py, left: px - 1, right: px + 1, dir: 1 }] // first scanning line

    do {

        el = stack.shift() // get line for scanning
        checkY = false

        // noinspection DuplicatedCode
        for (x = el.left + 1; x < el.right; x++) {
            dy = el.y * w
            i = (dy + x) * bytes // point index in the image data

            if (visited[dy + x] === 1) continue // check whether the point has been visited

            checkY = true // if the color of the new point(x,y) is similar to the sample color need to check minmax for Y

            result[dy + x] = 1 // mark a new point in mask
            visited[dy + x] = 1 // mark a new point as visited

            // compare the color of the sample
            c = data[i] - sampleColor[0] // check by red
            if (c > colorThreshold || c < -colorThreshold) continue
            c = data[i + 1] - sampleColor[1] // check by green
            if (c > colorThreshold || c < -colorThreshold) continue
            c = data[i + 2] - sampleColor[2] // check by blue
            if (c > colorThreshold || c < -colorThreshold) continue

            xl = x - 1

            // walk to left side starting with the left neighbor
            while (xl > -1) {
                dyl = dy + xl
                i = dyl * bytes // point index in the image data

                if (visited[dyl] === 1) break // check whether the point has been visited

                result[dyl] = 1
                visited[dyl] = 1
                xl--

                // compare the color of the sample
                c = data[i] - sampleColor[0] // check by red
                if (c > colorThreshold || c < -colorThreshold) break
                c = data[i + 1] - sampleColor[1] // check by green
                if (c > colorThreshold || c < -colorThreshold) break
                c = data[i + 2] - sampleColor[2] // check by blue
                if (c > colorThreshold || c < -colorThreshold) break
            }

            xr = x + 1

            // walk to right side starting with the right neighbor
            while (xr < w) {
                dyr = dy + xr
                i = dyr * bytes // index point in the image data

                if (visited[dyr] === 1) break // check whether the point has been visited

                result[dyr] = 1
                visited[dyr] = 1
                xr++

                // compare the color of the sample
                c = data[i] - sampleColor[0] // check by red
                if (c > colorThreshold || c < -colorThreshold) break
                c = data[i + 1] - sampleColor[1] // check by green
                if (c > colorThreshold || c < -colorThreshold) break
                c = data[i + 2] - sampleColor[2] // check by blue
                if (c > colorThreshold || c < -colorThreshold) break
            }

            // check minmax for X
            if (xl < minX) minX = xl + 1
            if (xr > maxX) maxX = xr - 1

            newY = el.y - el.dir
            if (newY >= 0 && newY < h) { // add two scanning lines in the opposite direction (y - dir) if necessary
                if (xl < el.left) { // from "new left" to "current left"
                    stack.push({ y: newY, left: xl, right: el.left, dir: -el.dir })
                }
                if (el.right < xr) { // from "current right" to "new right"
                    stack.push({ y: newY, left: el.right, right: xr, dir: -el.dir })
                }
            }

            newY = el.y + el.dir
            if (newY >= 0 && newY < h) { // add the scanning line in the direction (y + dir) if necessary
                if (xl < xr) { // from "new left" to "new right"
                    stack.push({ y: newY, left: xl, right: xr, dir: el.dir })
                }
            }
        }

        // check minmax for Y if necessary
        if (checkY) {
            if (el.y < minY) minY = el.y
            if (el.y > maxY) maxY = el.y
        }
    } while (stack.length > 0)

    return {
        data: result,
        width: image.width,
        height: image.height,
        bounds: {
            minX,
            minY,
            maxX,
            maxY
        }
    }
}

/**
 * Create a border index array of boundary points of the mask with radius-neighbors
 * @param {Mask} mask
 * @param {Number} radius of blur
 * @param {Uint8ClampedArray} [visited] mask of visited points (optional)
 * @return {Array} boundary points array with radius-neighbors (only points need for blur)
 */
function createBorderForBlur(mask, radius, visited)
{
    let x, i, j, y, k, k1, k2,
        data = mask.data,
        h = mask.height,
        w = mask.width,

        minX = mask.bounds.minX,
        maxX = mask.bounds.maxX,
        minY = mask.bounds.minY,
        maxY = mask.bounds.maxY,

        len = w * h,

        visitedData = new Uint8ClampedArray(data),
        temp = new Uint8ClampedArray(len), // auxiliary array to check uniqueness
        border = [], // only border points

        x0 = Math.max(minX, 1),
        x1 = Math.min(maxX, w - 2),
        y0 = Math.max(minY, 1),
        y1 = Math.min(maxY, h - 2)

    if (visited && visited.length > 0) {
        // copy visited points (only "black")
        for (k = 0; k < len; k++) {
            if (visited[k] === 1) visitedData[k] = 1
        }
    }

    // walk through inner values except points on the boundary of the image
    for (y = y0; y < y1 + 1; y++) {
        for (x = x0; x < x1 + 1; x++) {
            k = y * w + x

            if (data[k] === 0) continue // "white" point isn't the border
            k1 = k + w // y + 1
            k2 = k - w // y - 1

            // check if any neighbor with a "white" color
            if (visitedData[k + 1] === 0 || visitedData[k - 1] === 0 ||
                visitedData[k1] === 0 || visitedData[k1 + 1] === 0 || visitedData[k1 - 1] === 0 ||
                visitedData[k2] === 0 || visitedData[k2 + 1] === 0 || visitedData[k2 - 1] === 0) {
                border.push(k)
            }
        }
    }

    // walk through points on the boundary of the image if necessary
    // if the "black" point is adjacent to the boundary of the image, it is a border point
    if (minX === 0) {
        for (y = minY; y < maxY + 1; y++) {
            if (data[y * w] === 1) {
                border.push(y * w)
            }
        }
    }
    if (maxX === w - 1) {
        for (y = minY; y < maxY + 1; y++) {
            if (data[y * w + maxX] === 1) {
                border.push(y * w + maxX)
            }
        }
    }
    if (minY === 0) {
        for (x = minX; x < maxX + 1; x++) {
            if (data[x] === 1) {
                border.push(x)
            }
        }
    }
    if (maxY === h - 1) {
        for (x = minX; x < maxX + 1; x++) {
            if (data[maxY * w + x] === 1) {
                border.push(maxY * w + x)
            }
        }
    }

    let result = [], // border points with radius-neighbors
        start, end,
        endX = radius + w,
        endY = radius + h,
        n = radius * 2 + 1 // size of the pattern for radius-neighbors (from -r to +r with the center point)

    len = border.length

    // walk through radius-neighbors of border points and add them to the result array
    for (j = 0; j < len; j++) {
        k = border[j] // index of the border point
        temp[k] = 1 // mark border point
        result.push(k) // save the border point
        x = k % w // calc x by index
        y = (k - x) / w // calc y by index
        start = radius - x > 0 ? radius - x : 0
        end = endX - x < n ? endX - x : n // Math.min((((w - 1) - x) + radius) + 1, n);
        k1 = k - radius

        // walk through x-neighbors
        for (i = start; i < end; i++) {
            k2 = k1 + i

            if (temp[k2] === 0) { // check the uniqueness
                temp[k2] = 1
                result.push(k2)
            }
        }

        start = radius - y > 0 ? radius - y : 0
        end = endY - y < n ? endY - y : n // Math.min((((h - 1) - y) + radius) + 1, n);
        k1 = k - radius * w

        // walk through y-neighbors
        for (i = start; i < end; i++) {
            k2 = k1 + i * w

            if (temp[k2] === 0) { // check the uniqueness
                temp[k2] = 1
                result.push(k2)
            }
        }
    }

    return result
}

/**
 * Create a compressed mask with a "white" border (1px border with zero values) for the contour tracing
 * @param {Mask} mask
 * @return {{data: Uint8ClampedArray, offset: {x: number, y: number}, width: number, height: number}}
 */
function prepareMask(mask)
{
    let x, y, w = mask.width, data = mask.data,

        minX = mask.bounds.minX,
        maxX = mask.bounds.maxX,
        minY = mask.bounds.minY,
        maxY = mask.bounds.maxY,

        rw = maxX - minX + 3, // bounds size +1 px on each side (a "white" border)
        rh = maxY - minY + 3,
        result = new Uint8ClampedArray(rw * rh) // reduced mask (bounds size)

    // walk through inner values and copy only "black" points to the result mask
    for (y = minY; y < maxY + 1; y++) {
        for (x = minX; x < maxX + 1; x++) {
            if (data[y * w + x] === 1) {
                result[(y - minY + 1) * rw + (x - minX + 1)] = 1
            }
        }
    }

    return {
        data: result,
        width: rw,
        height: rh,
        offset: { x: minX - 1, y: minY - 1 }
    }
}

/**
 * Create a binary mask on the image by color threshold
 * @algorithm: Scanline flood fill (http://en.wikipedia.org/wiki/Flood_fill)
 * @param {BImageData} image data (extended by number of color bytes)
 * @param {Number} px of start pixel
 * @param {Number} py of start pixel
 * @param {Number} colorThreshold tolerant color threshold
 * @param {Uint8ClampedArray} [mask] of visited points (optional)
 * @param {Boolean} [includeBorders] indicate whether to include borders pixels
 * @return {Mask} mask
 */
export function floodFill(image, px, py, colorThreshold, mask, includeBorders)
{
    return includeBorders
        ? floodFillWithBorders(image, px, py, colorThreshold, mask)
        : floodFillWithoutBorders(image, px, py, colorThreshold, mask)
}

/**
 * Apply the gauss-blur filter to binary mask
 * @algorithm: http://blog.ivank.net/fastest-gaussian-blur.html
 * @see http://elynxsdk.free.fr/ext-docs/Blur/Fast_box_blur.pdf
 * @see http://www.librow.com/articles/article-9
 * @param {Mask} mask
 * @param {int} radius of blur
 */
export function gaussBlur(mask, radius)
{
    let i, k, k1, x, y, val, start, end,
        n = radius * 2 + 1, // size of the pattern for radius-neighbors (from -r to +r with the center point)
        s2 = radius * radius,
        wg = new Float32Array(n), // weights
        total = 0, // sum of weights(used for normalization)

        data = mask.data,
        h = mask.height,
        w = mask.width,

        minX = mask.bounds.minX,
        maxX = mask.bounds.maxX,
        minY = mask.bounds.minY,
        maxY = mask.bounds.maxY

    // calc gauss weights
    for (i = 0; i < radius; i++) {
        let dsq = (radius - i) * (radius - i)
        let ww = Math.exp(-dsq / (2.0 * s2)) / (2 * Math.PI * s2)
        wg[radius + i] = wg[radius - i] = ww
        total += 2 * ww
    }

    // normalization weights
    for (i = 0; i < n; i++) {
        wg[i] /= total
    }

    let result = new Uint8ClampedArray(w * h), // result mask
        endX = radius + w,
        endY = radius + h

    // walk through all source points for blur
    for (y = minY; y < maxY + 1; y++)
        for (x = minX; x < maxX + 1; x++) {
            val = 0
            k = y * w + x // index of the point
            start = radius - x > 0 ? radius - x : 0
            end = endX - x < n ? endX - x : n // Math.min((((w - 1) - x) + radius) + 1, n);
            k1 = k - radius

            // walk through x-neighbors
            for (i = start; i < end; i++) {
                val += data[k1 + i] * wg[i]
            }

            start = radius - y > 0 ? radius - y : 0
            end = endY - y < n ? endY - y : n // Math.min((((h - 1) - y) + radius) + 1, n);
            k1 = k - radius * w

            // walk through y-neighbors
            for (i = start; i < end; i++) {
                val += data[k1 + i * w] * wg[i]
            }

            result[k] = val > 0.5 ? 1 : 0
        }

    return {
        data: result,
        width: w,
        height: h,
        bounds: {
            minX,
            minY,
            maxX,
            maxY
        }
    }
}

/**
 * Apply the gauss-blur filter ONLY to border points with radius-neighbors
 * @algorithm: http://blog.ivank.net/fastest-gaussian-blur.html
 * @see http://elynxsdk.free.fr/ext-docs/Blur/Fast_box_blur.pdf
 * @see http://www.librow.com/articles/article-9
 * @param {Mask} mask
 * @param {int} radius of blur
 * @param {Uint8ClampedArray=} [visited] mask of visited points (optional)
 * @return {Mask}
 */
export function gaussBlurOnlyBorder(mask, radius, visited)
{
    let border = createBorderForBlur(mask, radius, visited), // get border points with radius-neighbors
        ww, dsq, i, j, k, k1, x, y, val, start, end,
        n = radius * 2 + 1, // size of the pattern for radius-neighbors (from -r to +r with center point)
        s2 = 2 * radius * radius,
        wg = new Float32Array(n), // weights
        total = 0, // sum of weights(used for normalization)
        len = border.length,

        data = mask.data,
        h = mask.height,
        w = mask.width,

        minX = mask.bounds.minX,
        maxX = mask.bounds.maxX,
        minY = mask.bounds.minY,
        maxY = mask.bounds.maxY

    // calc gauss weights
    for (i = 0; i < radius; i++) {
        dsq = (radius - i) * (radius - i)
        ww = Math.exp(-dsq / s2) / Math.PI
        wg[radius + i] = wg[radius - i] = ww
        total += 2 * ww
    }
    // normalization weights
    for (i = 0; i < n; i++) {
        wg[i] /= total
    }

    let result = new Uint8ClampedArray(data), // copy the source mask
        endX = radius + w,
        endY = radius + h

    // walk through all border points for blur
    for (i = 0; i < len; i++) {
        k = border[i] // index of the border point
        val = 0
        x = k % w // calc x by index
        y = (k - x) / w // calc y by index
        start = radius - x > 0 ? radius - x : 0
        end = endX - x < n ? endX - x : n // Math.min((((w - 1) - x) + radius) + 1, n);
        k1 = k - radius

        // walk through x-neighbors
        for (j = start; j < end; j++) {
            val += data[k1 + j] * wg[j]
        }

        if (val > 0.5) {
            result[k] = 1
            // check minmax
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
            continue
        }

        start = radius - y > 0 ? radius - y : 0
        end = endY - y < n ? endY - y : n // Math.min((((h - 1) - y) + radius) + 1, n);
        k1 = k - radius * w

        // walk through y-neighbors
        for (j = start; j < end; j++) {
            val += data[k1 + j * w] * wg[j]
        }

        if (val > 0.5) {
            result[k] = 1
            // check minmax
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
        } else {
            result[k] = 0
        }
    }

    return {
        data: result,
        width: w,
        height: h,
        bounds: {
            minX,
            minY,
            maxX,
            maxY
        }
    }
}

/**
 * Сoncatenate of masks
 * @see https://github.com/Tamersoul/ol-magic-wand/blob/master/src/MagicWand.js#L1110
 * @see http://jsfiddle.net/Tamersoul/dr7Dw
 * @param {Mask} mask
 * @param {Mask} old
 * @return {Mask}
 */
export function concatMasks(mask, old)
{
    let data1 = old.data,
        data2 = mask.data,

        w1 = old.width,
        w2 = mask.width,

        b1 = old.bounds,
        b2 = mask.bounds,

        b = {
            minX: Math.min(b1.minX, b2.minX),
            minY: Math.min(b1.minY, b2.minY),
            maxX: Math.max(b1.maxX, b2.maxX),
            maxY: Math.max(b1.maxY, b2.maxY)
        },

        w = old.width, // size for new mask
        h = old.height,

        result = new Uint8ClampedArray(w * h),

        i, j, k, k1, k2, len

    // copy all old mask
    len = b1.maxX - b1.minX + 1
    i = b1.minY * w + b1.minX
    k1 = b1.minY * w1 + b1.minX
    k2 = b1.maxY * w1 + b1.minX + 1

    // walk through rows (Y)
    for (k = k1; k < k2; k += w1) {
        result.set(data1.subarray(k, k + len), i) // copy row
        i += w
    }

    // copy new mask (only "black" pixels)
    len = b2.maxX - b2.minX + 1
    i = b2.minY * w + b2.minX
    k1 = b2.minY * w2 + b2.minX
    k2 = b2.maxY * w2 + b2.minX + 1

    // walk through rows (Y)
    for (k = k1; k < k2; k += w2) {
        // walk through cols (X)
        for (j = 0; j < len; j++) {
            if (data2[k + j] === 1) result[i + j] = 1
        }
        i += w
    }

    return {
        data: result,
        bounds: b,
        height: h,
        width: w
    }
}

/**
 * Create a border mask (only boundary points)
 * @param {Mask} mask
 * @return {{data: Uint8ClampedArray, offset: {x: *, y: *}, width: number, height: number}}
 */
export function createBorderMask(mask)
{
    let x, y, k, k1, k2,
        w = mask.width,
        h = mask.height,
        data = mask.data,
        minX = mask.bounds.minX,
        maxX = mask.bounds.maxX,
        minY = mask.bounds.minY,
        maxY = mask.bounds.maxY,
        rw = maxX - minX + 1, // bounds size
        rh = maxY - minY + 1,
        result = new Uint8ClampedArray(rw * rh), // reduced mask (bounds size)
        x0 = Math.max(minX, 1),
        x1 = Math.min(maxX, w - 2),
        y0 = Math.max(minY, 1),
        y1 = Math.min(maxY, h - 2)

    // walk through inner values except points on the boundary of the image
    for (y = y0; y < y1 + 1; y++)
        for (x = x0; x < x1 + 1; x++) {
            k = y * w + x
            if (data[k] === 0) continue // "white" point isn't the border
            k1 = k + w // y + 1
            k2 = k - w // y - 1
            // check if any neighbor with a "white" color
            if (data[k + 1] === 0 || data[k - 1] === 0 ||
                data[k1] === 0 || data[k1 + 1] === 0 || data[k1 - 1] === 0 ||
                data[k2] === 0 || data[k2 + 1] === 0 || data[k2 - 1] === 0) {
                // if (data[k + 1] + data[k - 1] +
                //    data[k1] + data[k1 + 1] + data[k1 - 1] +
                //    data[k2] + data[k2 + 1] + data[k2 - 1] == 8) continue
                result[(y - minY) * rw + (x - minX)] = 1
            }
        }

    // walk through points on the boundary of the image if necessary
    // if the "black" point is adjacent to the boundary of the image, it is a border point
    if (minX === 0) {
        for (y = minY; y < maxY + 1; y++) {
            if (data[y * w] === 1) {
                result[(y - minY) * rw] = 1
            }
        }
    }
    if (maxX === w - 1) {
        for (y = minY; y < maxY + 1; y++) {
            if (data[y * w + maxX] === 1) {
                result[(y - minY) * rw + (maxX - minX)] = 1
            }
        }
    }
    if (minY === 0) {
        for (x = minX; x < maxX + 1; x++) {
            if (data[x] === 1) {
                result[x - minX] = 1
            }
        }
    }
    if (maxY === h - 1) {
        for (x = minX; x < maxX + 1; x++) {
            if (data[maxY * w + x] === 1) {
                result[(maxY - minY) * rw + (x - minX)] = 1
            }
        }
    }

    return {
        data: result,
        width: rw,
        height: rh,
        offset: { x: minX, y: minY }
    }
}

/**
 * Create a border index array of boundary points of the mask
 * @param {Mask} mask
 * @return {Array} boundary points array of the mask
 */
export function getBorderIndices(mask)
{
    let x, y, k, p, k1, k2,
        data = mask.data,
        h = mask.height,
        w = mask.width,

        border = [], // only border points
        x1 = w - 1,
        y1 = h - 1

    // walk through inner values except points on the boundary of the image
    for (y = 1; y < y1; y++) {
        for (x = 1; x < x1; x++) {
            k = y * w + x

            // "white" point isn't the border
            if (data[k] === 0) continue
            k1 = k + w // y + 1
            k2 = k - w // y - 1

            // check if any neighbor with a "white" color
            if (data[k + 1] === 0 || data[k - 1] === 0 ||
                data[k1] === 0 || data[k1 + 1] === 0 || data[k1 - 1] === 0 ||
                data[k2] === 0 || data[k2 + 1] === 0 || data[k2 - 1] === 0) {
                border.push(k)
            }
        }
    }

    // walk through points on the boundary of the image if necessary
    // if the "black" point is adjacent to the boundary of the image, it is a border point
    for (y = 0; y < h; y++) {
        p = y * w

        if (data[p] === 1) {
            border.push(p)
        }
    }

    for (x = 0; x < w; x++) {
        if (data[x] === 1) {
            border.push(x)
        }
    }

    k = w - 1
    for (y = 0; y < h; y++) {
        p = y * w + k

        if (data[p] === 1) {
            border.push(p)
        }
    }

    k = (h - 1) * w
    for (x = 0; x < w; x++) {
        if (data[k + x] === 1) {
            border.push(k + x)
        }
    }

    return border
}

/**
 * Create a contour array for the binary mask
 * @algorithm: https://www.sciencedirect.com/science/article/abs/pii/S1077314203001401
 * @param {Mask} mask
 * @return {Array} contours
 */
export function traceContours(mask)
{
    let m = prepareMask(mask),
        h = m.height,
        w = m.width,
        w2 = w * 2,

        src = m.data,

        dx = m.offset.x,
        dy = m.offset.y,

        contours = [],
        label = 0,

        dest = new Uint8ClampedArray(src), // label matrix
        i, j, x, y, k, k1, c, inner, dir, first, second, current, previous, next, d

    // all [dx,dy] pairs (array index is the direction)
    // 5 6 7
    // 4 X 0
    // 3 2 1

    const directions = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]

    for (y = 1; y < h - 1; y++)
        for (x = 1; x < w - 1; x++) {
            k = y * w + x
            if (src[k] === 1) {
                for (i = -w; i < w2; i += w2) { // k - w: outer tracing (y - 1), k + w: inner tracing (y + 1)
                    if (src[k + i] === 0 && dest[k + i] === 0) { // need contour tracing
                        inner = i === w // is inner contour tracing ?
                        label++ // label for the next contour

                        c = []
                        dir = inner ? 2 : 6 // start direction
                        current = previous = first = { x, y }
                        second = null

                        while (true) {
                            dest[current.y * w + current.x] = label // mark label for the current point
                            // bypass all the neighbors around the current point in a clockwise
                            for (j = 0; j < 8; j++) {
                                dir = (dir + 1) % 8
                                // get the next point by new direction
                                d = directions[dir] // index as direction
                                next = { x: current.x + d[0], y: current.y + d[1] }
                                k1 = next.y * w + next.x

                                // black boundary pixel
                                if (src[k1] === 1) {
                                    dest[k1] = label // mark a label
                                    break
                                }

                                dest[k1] = -1 // mark a white boundary pixel
                                next = null
                            }

                            // no neighbours (one-point contour)
                            if (next === null) break
                            current = next

                            if (second) {
                                if (previous.x === first.x && previous.y === first.y && current.x === second.x && current.y === second.y) {
                                    break // creating the contour completed when returned to original position
                                }
                            } else {
                                second = next
                            }

                            c.push({ x: previous.x + dx, y: previous.y + dy })
                            previous = current
                            dir = (dir + 4) % 8 // next dir (symmetrically to the current direction)
                        }

                        if (next != null) {
                            c.push({ x: first.x + dx, y: first.y + dy }) // close the contour
                            contours.push({ inner, label, points: c }) // add contour to the list
                        }
                    }
                }
            }
        }

    return contours
}

/**
 * Simplify contours
 * @algorithm: http://psimpl.sourceforge.net/douglas-peucker.html
 * @see https://neerc.ifmo.ru/wiki/index.php?title=%D0%A3%D0%BF%D1%80%D0%BE%D1%89%D0%B5%D0%BD%D0%B8%D0%B5_%D0%BF%D0%BE%D0%BB%D0%B8%D0%B3%D0%BE%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B9_%D1%86%D0%B5%D0%BF%D0%B8
 * @param {Array} contours
 * @param {number} simplifyTolerant simplify tolerant
 * @param {number} simplifyCount simplify count: min number of points when the contour is simplified
 */
export function simplifyContours(contours, simplifyTolerant, simplifyCount)
{
    let i, j, k, c, points, len, resPoints, lst, stack, ids,
        maxd, maxi, dist, r1, r2, r12, dx, dy, pi, pf, pl,
        lenContours = contours.length,
        result = []

    // walk through all contours
    for (j = 0; j < lenContours; j++) {
        c = contours[j]
        points = c.points
        len = c.points.length

        if (len < simplifyCount) { // contour isn't simplified
            resPoints = []

            for (k = 0; k < len; k++) {
                resPoints.push({ x: points[k].x, y: points[k].y })
            }

            result.push({ inner: c.inner, label: c.label, points: resPoints, initialCount: len })

            continue
        }

        lst = [0, len - 1] // always add first and last points
        stack = [{ first: 0, last: len - 1 }] // first processed edge

        do {

            ids = stack.shift()

            // no intermediate points
            if (ids.last <= ids.first + 1) continue

            maxd = -1.0 // max distance from point to current edge
            maxi = ids.first // index of maximally distant point

            // bypass intermediate points in edge
            for (i = ids.first + 1; i < ids.last; i++) {
                // calc the distance from current point to edge
                pi = points[i]
                pf = points[ids.first]
                pl = points[ids.last]
                dx = pi.x - pf.x
                dy = pi.y - pf.y
                r1 = Math.sqrt(dx * dx + dy * dy)
                dx = pi.x - pl.x
                dy = pi.y - pl.y
                r2 = Math.sqrt(dx * dx + dy * dy)
                dx = pf.x - pl.x
                dy = pf.y - pl.y
                r12 = Math.sqrt(dx * dx + dy * dy)

                if (r1 >= Math.sqrt(r2 * r2 + r12 * r12)) {
                    dist = r2
                } else if (r2 >= Math.sqrt(r1 * r1 + r12 * r12)) {
                    dist = r1
                } else {
                    dist = Math.abs((dy * pi.x - dx * pi.y + pf.x * pl.y - pl.x * pf.y) / r12)
                }
                if (dist > maxd) {
                    maxi = i // save the index of maximally distant point
                    maxd = dist
                }
            }

            // if the max "deviation" is larger than allowed then...
            if (maxd > simplifyTolerant) {
                lst.push(maxi) // add index to the simplified list
                stack.push({ first: ids.first, last: maxi }) // add the left part for processing
                stack.push({ first: maxi, last: ids.last }) // add the right part for processing
            }

        } while (stack.length > 0)

        resPoints = []
        len = lst.length

        // restore index order
        lst.sort((a, b) => a - b)

        for (k = 0; k < len; k++) {
            resPoints.push({ x: points[lst[k]].x, y: points[lst[k]].y }) // add result points to the correct order
        }

        result.push({ inner: c.inner, label: c.label, points: resPoints, initialCount: c.points.length })
    }

    return result
}
