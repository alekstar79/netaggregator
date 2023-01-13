// noinspection JSIncompatibleTypesComparison

/**
* Returns element scroll offsets
* @see fabric.util
* @param {HTMLElement} element Element to operate on
* @return {Object} Object with left/top values
*/
export function getScrollLeftTop(element)
{
    let left = 0,
        top = 0,
        docElement = document.documentElement,
        body = document.body || {
            scrollLeft: 0, scrollTop: 0
        }

    while (element && (element.parentNode || element.host)) {
        // Set element to element parent, or 'host' in case of ShadowDOM
        element = element.parentNode || element.host

        if (element === document) {
            left = body.scrollLeft || docElement.scrollLeft || 0
            top = body.scrollTop ||  docElement.scrollTop || 0
        } else {
            left += element.scrollLeft || 0
            top += element.scrollTop || 0
        }

        if (element.nodeType === 1 && element.style.position === 'fixed') {
            break
        }
    }

    return { left, top }
}

/**
* @see dom_event.js
* @param event
* @return {*}
*/
export function getTouchInfo(event)
{
    const touchProp = event.changedTouches

    if (touchProp && touchProp[0]) {
        return touchProp[0]
    }

    return event
}

/**
* @see fabric.util.getPointer
* @param event
* @return {{x: Number, y: Number}}
*/
export function getPointer(event)
{
    let element = event.target,
        scroll = getScrollLeftTop(element),
        _evt = getTouchInfo(event)

    return {
        x: _evt.clientX + scroll.left,
        y: _evt.clientY + scroll.top
    }
}
