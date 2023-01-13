/**
 * @param {Object} event
 * @return {string}
 */
export function getText(event)
{
    if (event.text) return event.text

    let text = ''
    for (const a of event.attachments) {
        if ((text = a[a.type].title || a[a.type].text || a[a.type].description)) {
            break
        }
    }

    return text
}
