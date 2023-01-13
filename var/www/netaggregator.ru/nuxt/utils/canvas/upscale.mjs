const clamp = (v, l, h) => v > h ? h : v < l ? l : v + .5 | 0

export function upscale(svg, canvas)
{
    let ratio  = svg.height / svg.width,
        scaleX = svg.scaleX,
        scaleY = svg.scaleY,

        maxH = Number.MAX_SAFE_INTEGER,
        maxW = Number.MAX_SAFE_INTEGER,
        minH = 300,
        minW = 300,

        height,
        width,
        z

    if (typeof svg.scaleX === 'undefined') {
        scaleX = svg.scaleX = 1
    }
    if (typeof svg.scaleY === 'undefined') {
        scaleY = svg.scaleY = 1
    }
    if (canvas) {
        z = canvas.getZoom()

        maxH = canvas.height / z
        maxW = canvas.width / z
    }

    minH = clamp(minH, 0, maxH)
    minW = clamp(minW, 0, maxW)

    switch (true) {
        case svg.height < minH:
            while (svg.scaleY * svg.height < minH) {
                svg.scaleY++
            }

            svg.scaleX *= (svg.scaleY / scaleY)
            break

        case svg.width < minW:
            while (svg.scaleX * svg.width < minW) {
                svg.scaleX++
            }

            svg.scaleY *= (svg.scaleX / scaleX)
            break
    }

    height = svg.scaleY * svg.height
    width  = svg.scaleX * svg.width

    return {
        scaleX: svg.scaleX,
        scaleY: svg.scaleY,
        height,
        width,
        ratio
    }
}
