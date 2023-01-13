import { clearNodes, hide } from './clear-nodes.mjs'

const nodes = []

export function removeNodes()
{
    nodes.forEach(el => el.parentNode && el.parentNode.removeChild(el))
    nodes.splice(0, nodes.length)
}

/**
* @param {String} link
* @param {Function} fallback
* @return {HTMLIFrameElement}
* @see https://stackoverflow.com/a/66876525/6399083
* @see https://stackoverflow.com/a/62293201/6399083
*/
export function redirect(link, fallback)
{
    removeNodes()
    clearNodes()

    const html = `<body><script>window.top.location.replace('${link}')</script></body>`,
        blob = new Blob([html], { type: 'text/html' }),
        iframe = document.createElement('iframe')

    iframe.style.display = 'none'
    iframe.setAttribute('sandbox', 'allow-popups allow-scripts allow-top-navigation')
    iframe.setAttribute('id', 'top_level_redirect')

    iframe.addEventListener('load', function() {
        setTimeout(() => {
            this.remove()
            fallback()

        }, 1400)
    })

    iframe.src = window.URL.createObjectURL(blob)

    document.body.appendChild(iframe)

    nodes.push(iframe)

    return iframe
}

/**
* @param {String} link
* @param {String} target
*/
export function openLink(link, target = '_blank')
{
    removeNodes()
    clearNodes()

    const a = document.createElement('a'),
        click = new MouseEvent('click', {
            cancelable: true,
            bubbles: true,
            view: window
        })

    a.setAttribute('target', target || '_blank')
    a.setAttribute('href', link)

    hide(a)

    document.body.appendChild(a)
    nodes.push(a)

    a.dispatchEvent(click)
}

/**
* @param {String} type
* @param {Boolean} multiple
* @param {Boolean} capture
* @return {Promise<(String|Blob)>}
*/
export function openFile(type, multiple = false, capture = false)
{
    removeNodes()
    clearNodes()

    return new Promise(resolve => {
        const input = document.createElement('input'),
            click = new MouseEvent('click', {
                cancelable: true,
                bubbles: true,
                view: window
            })

        input.multiple = multiple
        input.accept = type
        input.type = 'file'

        if (capture) {
            input.capture = 'camera'
        }

        hide(input)

        input.addEventListener('change', () => {
            const files = Array.from(input.files)
            multiple ? resolve(files) : resolve(files[0])
        }, false)

        document.body.appendChild(input)
        nodes.push(input)

        input.dispatchEvent(click)
    })
}
