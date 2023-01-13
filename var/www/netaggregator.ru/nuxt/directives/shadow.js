// https://github.com/2A5F/shadow

/**
 * @param {ShadowRoot} shadowRoot
 * @param {NodeList|Iterable} childNodes
 */
function putDomIntoShadow(shadowRoot, childNodes)
{
    const fragment = document.createDocumentFragment()

    for (const node of childNodes) {
        fragment.appendChild(node)
    }

    shadowRoot.appendChild(fragment)
}

/**
 * @param {Element} root
 * @param {NodeList|Iterable} childNodes
 * @return {ShadowRoot}
 */
export function makeShadowRaw(root, childNodes)
{
    try {

        let shadowRoot

        if (root.shadowRoot) {
            console.error('[shadow]: Attach shadow multiple times', root, childNodes, root.shadowRoot)

        } else {
            shadowRoot = root.attachShadow({ mode: 'open' })

            if (childNodes) {
                putDomIntoShadow(shadowRoot, childNodes)
            }

            return shadowRoot
        }

    } catch (e) {
        console.group('[shadow]: Make shadow-root failed')
        console.error(root, childNodes, e)
        console.groupEnd()
    }
}

/**
 * @param {Element} root
 * @return {Element}
 */
export function replaceChildrenWithShadowDom(root)
{
    try {

        let newRoot, shadowRoot

        if (root.shadowRoot) {
            console.error('[shadow]: Attach shadow multiple times', root, root.shadowRoot)

        } else {
            newRoot = root.cloneNode()
            shadowRoot = newRoot.attachShadow({ mode: 'open' })

            while (root.hasChildNodes()) {
                shadowRoot.appendChild(root.firstChild)
            }

            root.parentElement?.replaceChild(newRoot, root)

            return newRoot
        }

    } catch (e) {
        console.group('[shadow]: Make shadow-root failed')
        console.error(root, e)
        console.groupEnd()
    }
}

/**
 * @param {Element} root
 * @return {Node}
 */
export function removeShadow(root)
{
    const newroot = root.cloneNode()

    while (root.hasChildNodes()) {
        newroot.appendChild(root.firstChild)
    }

    root.parentElement?.replaceChild(newroot, root)

    return newroot
}

/**
 * @param {Element} el
 */
export function makeShadow(el)
{
    makeShadowRaw(el, el.childNodes)
}

export const shadow = {
    inserted: replaceChildrenWithShadowDom
}
