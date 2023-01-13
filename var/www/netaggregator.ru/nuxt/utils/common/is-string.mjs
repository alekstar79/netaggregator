/**
 * @return {boolean}
 */
export function isString(obj)
{
    return Object.prototype.toString.call(obj) === '[object String]'
}

export function rtrim(string, list = '')
{
    return isString(string)
        ? string.replace(new RegExp(`[\\s\\uFEFF\\xA0${list}]+$`, 'g'), '')
        : string
}

export function ltrim(string, list = '')
{
    return isString(string)
        ? string.replace(new RegExp(`^[\\s\\uFEFF\\xA0${list}]+`, 'g'), '')
        : string
}
