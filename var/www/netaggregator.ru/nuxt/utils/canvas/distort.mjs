import { debounce } from '../common/debounce.mjs'

/**
* @type {Function}
*/
export const _distort = debounce(function({ canvas, resolve }) {
    const zoom = scale => ({ width: 1590 * scale, height: 530 * scale }),
        inc = () => canvas.setZoom(1.1).setDimensions(zoom(1.1)),
        dec = () => canvas.setZoom(0.9).setDimensions(zoom(0.9)),
        handler = fn => next => { fn(); setTimeout(next, 4) },
        perform = fn => () => new Promise(handler(fn))

    Promise.resolve()
        .then(perform(inc))
        .then(perform(dec))
        .then(() => { canvas.setZoom(1).setDimensions(zoom(1)) })
        .then(() => { canvas.requestRenderAll() })
        .then(resolve)
}, 0)

export function distort(canvas)
{
    return new Promise(resolve => _distort({ canvas, resolve }))
}

export function toBlob(canvas, type = 'image/png', q = 1)
{
    return new Promise(resolve => canvas.toBlob(resolve, type, q))
}
