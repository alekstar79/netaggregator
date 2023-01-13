import { range } from '~/utils/common/range.mjs'

const vintage = (function() {
    const rgb = x => -12 * Math.sin(x * 2 * Math.PI / 255) + x,
        r = x => -.2 * (255 * x) ** .5 * Math.sin(Math.PI * (-.0000195 * x ** 2 + .0125 * x)) + x,
        g = x => -.001045244139166791 * x ** 2 + 1.2665372554875318 * x,
        b = x => .57254902 * x + 53

    return range(256).reduce((c, i) => {
        c.r[i] = r(rgb(i))
        c.g[i] = g(rgb(i))
        c.b[i] = b(rgb(i))
        return c

    }, { r: [], g: [], b: [] })
}())

const curves = (function() {
    const rgb = x => -12 * Math.sin(x * 2 * Math.PI / 255) + x

    return range(256).reduce((c, i) => {
        c.r[i] = rgb(i)
        c.g[i] = rgb(i)
        c.b[i] = rgb(i)
        return c

    }, { r: [], g: [], b: [] })
}())

export const presets = {
    vintage: {
        screen: { r: 227, g: 12, b: 169, a: .15 },
        curves: vintage,
        vignette: .7
    },
    sepia: {
        sepia: true,
        curves
    },
    greenish: {
        screen: { r: 0, g: 255, b: 0, a: .15 },
        vignette: .6,
        lighten: .1,
        curves
    },
    reddish: {
        screen: { r: 255, g: 0, b: 0, a: .15 },
        vignette: .6,
        lighten: .1,
        curves
    }
}
