/**
 * @return {boolean}
 */
export function isObject(obj)
{
    return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * @return {boolean}
 */
export function isExist(key, obj)
{
    return isObject(obj) && key in obj
}
