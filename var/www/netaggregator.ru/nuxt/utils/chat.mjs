import saveAs from 'file-saver'
import axios from 'axios'

const zeroPad = (num, pad) => String(num).padStart(pad, '0')

export function parseTimestamp(timestamp, format = '')
{
    if (!timestamp) return

    const date = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : timestamp

    if (format === 'HH:mm') {
        return `${zeroPad(date.getHours(), 2)}:${zeroPad(date.getMinutes(), 2)}`
    } else if (format === 'DD MMMM YYYY') {
        const options = { month: 'long', year: 'numeric', day: 'numeric' }
        return `${new Intl.DateTimeFormat('en-GB', options).format(date)}`
    } else if (format === 'DD/MM/YY') {
        const options = { month: 'numeric', year: 'numeric', day: 'numeric' }
        return `${new Intl.DateTimeFormat('en-GB', options).format(date)}`
    } else if (format === 'DD MMMM, HH:mm') {
        const options = { month: 'long', day: 'numeric' }
        return `${new Intl.DateTimeFormat('en-GB', options).format(
            date
        )}, ${zeroPad(date.getHours(), 2)}:${zeroPad(date.getMinutes(), 2)}`
    }

    return date
}

/**
* @param {Date} d1
* @param {Date} d2
* @return {boolean}
*/
export function isSameDay(d1, d2)
{
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

/**
* @param {String} url
* @param {String} name
* @see xyz-notes/firebase.md
*/
export function download(url, name)
{
    axios({ url, method: 'GET', responseType: 'blob' })
        .then(response => saveAs(new Blob([response.data]), name))
        .catch(() => {})
}
