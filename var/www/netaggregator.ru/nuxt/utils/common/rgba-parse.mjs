/**
* @param {String|Object} c
* @return {{r: number, g: number, b: number, a: number}}
*/
export function rgbaParse(c)
{
    if (typeof c === 'undefined') {
        return { r: 0, g: 0, b: 0, a: 1 }
    }
    if (typeof c === 'object') {
        return !('r' in c && 'g' in c && 'b' in c)
            ? { r: 0, g: 0, b: 0, a: 1 }
            : c
    }

    let raw

    if ((raw = c.match(/rgba?\((.*)\)/) || []).length) {
        raw = raw[1].split(',').map(parseFloat)
    }
    if (typeof raw[3] === 'undefined') {
        raw[3] = 1
    }
    if (raw[3] <= .001) {
        raw[3] = .001
    }

    return {
        r: raw[0] || 0,
        g: raw[1] || 0,
        b: raw[2] || 0,
        a: raw[3]
    }
}
