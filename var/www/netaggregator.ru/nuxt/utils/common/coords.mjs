export function getCoords(el)
{
    const box = el.getBoundingClientRect(),
        docEl = document.documentElement,
        body = document.body

    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft,
        scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop

    const clientLeft = docEl.clientLeft || body.clientLeft || 0,
        clientTop = docEl.clientTop || body.clientTop || 0

    const left = box.left + scrollLeft - clientLeft,
        top  = box.top +  scrollTop - clientTop;

    return {
        left: Math.round(left),
        top: Math.round(top),
        height: box.height,
        width: box.width
    }
}
