/**
* @param {Object} size
* @param {Number} zoom [optional]
* @return {HTMLCanvasElement}
*/
export function createCanvas(size, zoom = 0)
{
    zoom || (zoom = 'getZoom' in size ? size.getZoom() : 1)

    const { width = 640, height = 480 } = size || {},
        c = document.createElement('canvas')

    c.height = Math.floor(height / zoom)
    c.width = Math.floor(width / zoom)

    return c
}
