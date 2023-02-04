/** @see https://fooobar.com/questions/119514/how-to-compress-an-image-via-javascript-in-the-browser */

// Needed for Safari https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value(callback, type, quality) {
            const binStr = atob(this.toDataURL(type, quality).split(',')[1]),
                len = binStr.length,
                arr = new Uint8Array(len)

            for (let i = 0; i < len; i++) {
                arr[i] = binStr.charCodeAt(i)
            }

            callback(new Blob([arr], { type: type || 'image/png' }))
        }
    })
}

// Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// -2 = not jpeg, -1 = no data, 1..8 = orientations
export function getExifOrientation(file, callback)
{
    // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
    if (file.slice) {
        file = file.slice(0, 131072)
    } else if (file.webkitSlice) {
        file = file.webkitSlice(0, 131072)
    }

    const reader = new FileReader()

    reader.onload = ({ target: { result } }) => {
        // noinspection JSCheckFunctionSignatures
        const view = new DataView(result)

        if (view.getUint16(0, false) !== 0xFFD8) {
            callback(-2)
            return
        }

        let length = view.byteLength,
            offset = 2

        while (offset < length) {
            const marker = view.getUint16(offset, false)

            offset += 2

            if (marker === 0xFFE1) {
                if (view.getUint32(offset += 2, false) !== 0x45786966) {
                    callback(-1)
                    return
                }

                const little = view.getUint16(offset += 6, false) === 0x4949
                offset += view.getUint32(offset + 4, little)

                const tags = view.getUint16(offset, little)
                offset += 2

                for (let i = 0; i < tags; i++) {
                    if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                        callback(view.getUint16(offset + (i * 12) + 8, little))
                        return
                    }
                }
            } else if ((marker & 0xFF00) !== 0xFF00) {
                break

            } else {
                offset += view.getUint16(offset, false)
            }
        }

        callback(-1)
    }

    reader.readAsArrayBuffer(file)
}

// Derived from https://stackoverflow.com/a/40867559, cc by-sa
// Rotating picture if orientation > 1
export function imgToCanvasWithOrientation(img, rawW, rawH, orientation)
{
    const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d')

    if (orientation > 4) {
        canvas.height = rawW
        canvas.width = rawH
    } else {
        canvas.height = rawH
        canvas.width = rawW
    }

    switch (orientation) {
        case 2: ctx.transform(-1, 0,  0,  1, rawW, 0   ); break
        case 3: ctx.transform(-1, 0,  0, -1, rawW, rawH); break
        case 4: ctx.transform(1,  0,  0, -1, 0,    rawH); break
        case 5: ctx.transform(0,  1,  1,  0, 0,    0   ); break
        case 6: ctx.transform(0,  1, -1,  0, rawH, 0   ); break
        case 7: ctx.transform(0, -1, -1,  0, rawH, rawW); break
        case 8: ctx.transform(0, -1,  1,  0, 0,    rawW); break
    }

    ctx.drawImage(img, 0, 0, rawW, rawH)

    return canvas
}

const defaultQuality = [
    // { size: 1000 * 1024, quality: .5  },
    { size:  500 * 1024, quality: .5  },
    { size:  400 * 1024, quality: .6  },
    { size:  300 * 1024, quality: .7  },
    { size:  150 * 1024, quality: .9  }
]

function calc(hash, size)
{
    let q = 1

    hash.some(item => {
        if (item.size < size) {
            q = item.quality
            return true
        }

        return false
    })

    return q
}

export function calcQuality(size, quality)
{
    return calc(quality || defaultQuality, size)
}

/**
 * If file size > 150kB reduce quality (e.g. to .6)
 * and optionally change the max size (e.g. maxWidth 800)
 */
export function reduceFileSize({
   file,
   quality    = defaultQuality,
   acceptSize = 150 * 1024,
   maxWidth   = Infinity,
   maxHeight  = Infinity
}) {

    return new Promise((resolve, reject) => {
        if (file.size <= acceptSize) {
            resolve(file)
            return
        }

        const img = new Image()

        img.onerror = function() {
            URL.revokeObjectURL(/** @type string */this.src)
            reject(new Error('Error file loading'))
        }

        img.onload = function() {
            URL.revokeObjectURL(/** @type string */this.src)

            getExifOrientation(file, orientation => {
                let w = img.width, h = img.height,

                    scale = orientation > 4
                        ? Math.min(maxHeight / w, maxWidth / h, 1)
                        : Math.min(maxWidth / w, maxHeight / h, 1)

                h = Math.round(h * scale)
                w = Math.round(w * scale)

                let q, canvas = imgToCanvasWithOrientation(img, w, h, orientation)

                switch (typeof quality) {
                    case 'function':
                        q = quality(img, w, h, orientation)
                        break

                    case 'object':
                        q = calc(quality, file.size)
                        break

                    case 'number':
                        q = quality
                        break

                    default:
                        q = .7
                }

                canvas.toBlob(resolve, file.type, q)
            })
        }

        img.src = URL.createObjectURL(file)
    })
}
