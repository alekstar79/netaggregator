/**
* StackBlur - a fast almost Gaussian Blur for Canvas
* Based on algorithm by Mario Klingemann <mario@quasimondo.com>
* @link http://incubator.quasimondo.com/processing/fast_blur_deluxe.php
* @link http://www.quasimondo.com/StackBlurForCanvas
* @also https://github.com/bolknote Evgeny Stepanischev <imbolk@gmail.com>
* @copyright (c) 2010 Mario Klingemann
*/

const mul_table = [
    512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
    454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
    482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
    437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
    497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
    320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
    446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
    329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
    505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
    399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
    324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
    268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
    451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
    385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
    332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
    289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259
]

const shg_table = [
     9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
    17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
    19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24
]

function BlurStack()
{
    this.r = 0
    this.g = 0
    this.b = 0
    this.a = 0

    this.next = null
}

function copy(src, dst)
{
    let srcPixels = src.data,
        srcLength = srcPixels.length,
        dstPixels = dst.data

    while (srcLength--) {
        dstPixels[srcLength] = srcPixels[srcLength]
    }

    return dst
}

function clone(src)
{
    return copy(src, new ImageData(src.width, src.height))
}

export function blur(src, radius)
{
    let srcHeight = src.height,
        srcWidth = src.width,

        dst = clone(src),
        dstPixels = dst.data,

        x, y, i, p, yp, yi, yw,
        r_sum, g_sum, b_sum, a_sum,
        r_out_sum, g_out_sum, b_out_sum, a_out_sum,
        r_in_sum, g_in_sum, b_in_sum, a_in_sum,
        pr, pg, pb, pa, rbs,
        div = radius + radius + 1,
        widthMinus1 = srcWidth - 1,
        heightMinus1 = srcHeight - 1,
        radiusPlus1 = radius + 1,
        sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2,
        stackStart = new BlurStack(),
        stack = stackStart,
        stackIn, stackOut, stackEnd,
        mul_sum = mul_table[radius],
        shg_sum = shg_table[radius]

    for (i = 1; i < div; i += 1) {
        stack = stack.next = new BlurStack()

        if (i === radiusPlus1) {
            stackEnd = stack
        }
    }

    stack.next = stackStart
    yw = yi = 0

    // noinspection DuplicatedCode
    for (y = 0; y < srcHeight; y += 1) {
        r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0

        r_out_sum = radiusPlus1 * (pr = dstPixels[yi])
        g_out_sum = radiusPlus1 * (pg = dstPixels[yi + 1])
        b_out_sum = radiusPlus1 * (pb = dstPixels[yi + 2])
        a_out_sum = radiusPlus1 * (pa = dstPixels[yi + 3])

        r_sum += sumFactor * pr
        g_sum += sumFactor * pg
        b_sum += sumFactor * pb
        a_sum += sumFactor * pa

        stack = stackStart

        for (i = 0; i < radiusPlus1; i += 1) {
            stack.r = pr
            stack.g = pg
            stack.b = pb
            stack.a = pa
            stack = stack.next
        }

        for (i = 1; i < radiusPlus1; i += 1) {
            p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2)
            r_sum += (stack.r = (pr = dstPixels[p])) * (rbs = radiusPlus1 - i)
            g_sum += (stack.g = (pg = dstPixels[p + 1])) * rbs
            b_sum += (stack.b = (pb = dstPixels[p + 2])) * rbs
            a_sum += (stack.a = (pa = dstPixels[p + 3])) * rbs

            r_in_sum += pr
            g_in_sum += pg
            b_in_sum += pb
            a_in_sum += pa

            stack = stack.next
        }

        stackIn = stackStart
        stackOut = stackEnd

        for (x = 0; x < srcWidth; x += 1) {
            dstPixels[yi] = (r_sum * mul_sum) >> shg_sum
            dstPixels[yi + 1] = (g_sum * mul_sum) >> shg_sum
            dstPixels[yi + 2] = (b_sum * mul_sum) >> shg_sum
            dstPixels[yi + 3] = (a_sum * mul_sum) >> shg_sum

            r_sum -= r_out_sum
            g_sum -= g_out_sum
            b_sum -= b_out_sum
            a_sum -= a_out_sum

            r_out_sum -= stackIn.r
            g_out_sum -= stackIn.g
            b_out_sum -= stackIn.b
            a_out_sum -= stackIn.a

            p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2

            r_in_sum += (stackIn.r = dstPixels[p])
            g_in_sum += (stackIn.g = dstPixels[p + 1])
            b_in_sum += (stackIn.b = dstPixels[p + 2])
            a_in_sum += (stackIn.a = dstPixels[p + 3])

            r_sum += r_in_sum
            g_sum += g_in_sum
            b_sum += b_in_sum
            a_sum += a_in_sum

            stackIn = stackIn.next

            r_out_sum += (pr = stackOut.r)
            g_out_sum += (pg = stackOut.g)
            b_out_sum += (pb = stackOut.b)
            a_out_sum += (pa = stackOut.a)

            r_in_sum -= pr
            g_in_sum -= pg
            b_in_sum -= pb
            a_in_sum -= pa

            stackOut = stackOut.next

            yi += 4
        }

        yw += srcWidth
    }

    // noinspection DuplicatedCode
    for (x = 0; x < srcWidth; x += 1) {
        g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0

        yi = x << 2
        r_out_sum = radiusPlus1 * (pr = dstPixels[yi])
        g_out_sum = radiusPlus1 * (pg = dstPixels[yi + 1])
        b_out_sum = radiusPlus1 * (pb = dstPixels[yi + 2])
        a_out_sum = radiusPlus1 * (pa = dstPixels[yi + 3])

        r_sum += sumFactor * pr
        g_sum += sumFactor * pg
        b_sum += sumFactor * pb
        a_sum += sumFactor * pa

        stack = stackStart

        for (i = 0; i < radiusPlus1; i += 1) {
            stack.r = pr
            stack.g = pg
            stack.b = pb
            stack.a = pa
            stack = stack.next
        }

        yp = srcWidth

        for (i = 1; i <= radius; i += 1) {
            yi = (yp + x) << 2

            r_sum += (stack.r = (pr = dstPixels[yi])) * (rbs = radiusPlus1 - i)
            g_sum += (stack.g = (pg = dstPixels[yi + 1])) * rbs
            b_sum += (stack.b = (pb = dstPixels[yi + 2])) * rbs
            a_sum += (stack.a = (pa = dstPixels[yi + 3])) * rbs

            r_in_sum += pr
            g_in_sum += pg
            b_in_sum += pb
            a_in_sum += pa

            stack = stack.next

            if (i < heightMinus1) {
                yp += srcWidth
            }
        }

        yi = x
        stackIn = stackStart
        stackOut = stackEnd

        for (y = 0; y < srcHeight; y += 1) {
            p = yi << 2

            dstPixels[p] = (r_sum * mul_sum) >> shg_sum
            dstPixels[p + 1] = (g_sum * mul_sum) >> shg_sum
            dstPixels[p + 2] = (b_sum * mul_sum) >> shg_sum
            dstPixels[p + 3] = (a_sum * mul_sum) >> shg_sum

            r_sum -= r_out_sum
            g_sum -= g_out_sum
            b_sum -= b_out_sum
            a_sum -= a_out_sum

            r_out_sum -= stackIn.r
            g_out_sum -= stackIn.g
            b_out_sum -= stackIn.b
            a_out_sum -= stackIn.a

            p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * srcWidth)) << 2

            r_sum += (r_in_sum += (stackIn.r = dstPixels[p]))
            g_sum += (g_in_sum += (stackIn.g = dstPixels[p + 1]))
            b_sum += (b_in_sum += (stackIn.b = dstPixels[p + 2]))
            a_sum += (a_in_sum += (stackIn.a = dstPixels[p + 3]))

            stackIn = stackIn.next

            r_out_sum += (pr = stackOut.r)
            g_out_sum += (pg = stackOut.g)
            b_out_sum += (pb = stackOut.b)
            a_out_sum += (pa = stackOut.a)

            r_in_sum -= pr
            g_in_sum -= pg
            b_in_sum -= pb
            a_in_sum -= pa

            stackOut = stackOut.next

            yi += srcWidth
        }
    }

    return dst
}
