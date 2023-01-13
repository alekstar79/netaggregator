/**
 * @param {Function} fn
 * @param {Number} ms
 * @return {function(...[*]=)}
 */
export function debounce(fn, ms = 500)
{
    let timeout, external = this

    return function(...args) {
        timeout && clearTimeout(timeout)

        const context = this || external

        timeout = setTimeout(() => {
            fn.apply(context, args)
        }, ms)
    }
}
