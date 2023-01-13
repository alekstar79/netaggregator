/**
 * @param {number} ms
 * @param {*=} args
 * @return {Promise<unknown>}
 */
export function delay(ms = 1e3, ...args)
{
    return new Promise(resolve => setTimeout(resolve, ms, ...args))
}
