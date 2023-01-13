/**
 * @see https://www.digitalocean.com/community/tutorials/js-proxy-traps
 * @param {Function} fn
 * @return {Function}
 */
export function createCachedFunction(fn)
{
    const handler = {
        cache: {},

        apply(target, that, args)
        {
            const key = JSON.stringify(args)

            if (!Object.prototype.hasOwnProperty.call(this.cache, key)) {
                this.cache[key] = target(...args)
            }

            return this.cache[key]
        }
    }

    return new Proxy(fn, handler)
}
