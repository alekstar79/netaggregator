/**
 * @param {Number} bytes
 * @param {Number} decimals
 * @return {string}
 */
export function format(bytes, decimals = 2)
{
    if (bytes === 0) return '0 B'

    const dim = ['B','KB','MB','GB','TB','PB','EB','ZB','YB'],
        d = decimals < 0 ? 0 : decimals,
        k = 1024,

        i = Math.floor(Math.log(bytes) / Math.log(k)),
        size = parseFloat((bytes / k ** i)
            .toFixed(d))

    return size + ' ' + dim[i]
}
