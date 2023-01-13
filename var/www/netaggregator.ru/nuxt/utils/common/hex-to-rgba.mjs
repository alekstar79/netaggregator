/**
 * @param {String} hex
 * @param {Number=} [alpha] (optional)
 * @typedef {String} p
 * @return {{r: number, g: number, b: number, a: number}|{[p]: number}}
 * @see https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
 */
export function hexToRgbA(hex, alpha = 1)
{
    const rgba = { r: 0, g: 0, b: 0, a: alpha }

    if (/^#[A-Fa-f0-9]{3,}$/.test(hex)) {
        let int, c = hex.substring(1).split('')

        if (c.length === 3 || c.length > 6) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]]
        }

        int = parseInt(c.join(''), 16)
        rgba.r = (int >> 16) & 255
        rgba.g = (int >> 8) & 255
        rgba.b = int & 255
        rgba.a = alpha
    }

    return rgba
}
