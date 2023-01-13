/**
 * @param {String} data
 * @return {{data: String|null, type: String|null}}
 */
export function dataURLMime(data)
{
    const decompose = { type: null, data: null },
        regexp = /data:(image\/.+);base64,/

    decompose.data = data.replace(regexp, (h, t) => {
        decompose.type = t
        return ''
    })

    return decompose
}
