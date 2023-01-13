export function createToolButton(callback, className = 'download-btn')
{
    let canvas, span = document.createElement('span')

    span.classList.add(className)
    span.addEventListener('click', ({ target }) => {
        if ((canvas = target.parentNode.querySelector('.viewer-canvas'))) {
            callback(canvas.getElementsByTagName('img')[0])
        }
    })

    return span
}
