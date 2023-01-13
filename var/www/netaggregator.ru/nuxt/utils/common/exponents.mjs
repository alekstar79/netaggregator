export function noExponents(num = null)
{
    num || (num = this)

    const data = String(num).split(/[eE]/)

    if (data.length === 1) {
        return data[0]
    }

    let sign = num < 0 ? '-' : '',
        str = data[0].replace('.', ''),
        mag = Number(data[1]) + 1,
        z = ''

    if (mag < 0) {
        z = sign + '0.'
        while (mag++) z += '0'
        return z + str.replace(/^\\-/,'')
    }

    mag -= str.length
    while (mag--) z += '0'

    return str + z
}
