/**
* @param {Object|String} rgba
* @param {Boolean} diff
* @return {String}
*/
export function rgbaStringify(rgba, diff = true)
{
    if (typeof rgba === 'undefined') {
        return 'rgba(0,0,0,1)'
    }
    if (typeof rgba === 'string') {
        if (!rgba.match(/rgba?\((.*)\)/)) {
            rgba = { r: 0, g: 0, b: 0, a: 1 }
        } else {
            return rgba
        }
    }

    rgba.a || (rgba.a = 0.001)

    rgba.a = Number(rgba.a.toFixed(3))

    rgba.a > 1 && (rgba.a /= 255)

    let v = Object.values(rgba)

    return `rgba(${
        v.map(parseFloat)
            .reduce((c, v) => `${c},${v}`, '')
            .slice(1)
    })`
}
