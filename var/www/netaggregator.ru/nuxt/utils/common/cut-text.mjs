import { stripHash, stripTags } from './strip.mjs'

export function cutText(text = '', words = 0, chars = 0)
{
    text = stripHash(stripTags(text))

    const array = text.split(' ')

    if (words > 0 && array.length > words) {
        text = array.slice(0, words + 1).join(' ')
    }
    if (chars > 0 && text.length > chars) {
        text = text.slice(0, chars + 1)
    }

    return text.trim() + '…'
}
