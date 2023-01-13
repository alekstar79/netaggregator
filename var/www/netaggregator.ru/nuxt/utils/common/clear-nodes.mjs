export function clearNodes(selectors)
{
    selectors || (selectors = 'input[type="file"], a[target="_blank"], a[download]')

    document.body.querySelectorAll(selectors).forEach(el => el.parentNode.removeChild(el))
}

/**
 * @param {HTMLElement} el
 */
export function hide(el)
{
    el.style.visibility = 'hidden'
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    el.style.top = '-9999px'
}
