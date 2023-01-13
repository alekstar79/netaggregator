/* eslint-disable object-property-newline */

const { max, pow, sqrt, sin, cos, PI } = Math,

    k = {
        8: .016, 9: .022, 10: .026, 11: .03, 12: .036, 13: .038, 14: .042, 15: .046, 16: .048, 17: .05,
        18: .054, 19: .058, 20: .06, 21: .064, 22: .068, 23: .072, 24: .074, 25: .078, 26: .08, 27: .082,
        28: .084, 29: .086, 30: .088, 31: .09, 32: .094, 33: .096, 34: .098, 35: .099, 36: .1
    }

export class Octopus
{
    constructor({ layer: { w, h } })
    {
        this.mouse = { on: false, x: null, y: null }
        this.background = '#2b2b2b'

        this.m = 2  // shade repetitions default 4
        this.n = 8  // shades default 8
        this.p = 22 // dots on each branch default 32
        this.t = 0

        this.step = 1 / 60

        this.w = w
        this.h = h
    }

    setColor(hex)
    {
        // this.color = hex
    }

    setBackground(hex)
    {
        this.background = hex
    }

    update(correction, app)
    {
        this.mouse = { ...this.mouse, ...app.mouse }
    }

    render(ctx)
    {
        ctx.globalCompositeOperation = 'source-over'

        ctx.fillStyle = this.background
        ctx.fillRect(0, 0, this.w, this.h)

        let beta, gamma, hue, x0, y0, x1, y1, r

        for (let i = 0; i < this.n * this.m; i++) {
            beta = i * 2 * PI / (this.n * this.m)
            x0 = 0

            ctx.beginPath()
            hue = i * 360 / this.n
            ctx.translate(this.w / 2, this.h / 2)
            ctx.rotate(this.t / 3)

            /* only need to set the fillstyle once up here now */
            ctx.fillStyle = `hsl(${hue}, 100%, 65%)`

            for (let j = 0; j < this.p; j++) {
                gamma = j * 2 * PI / this.p
                r = max(1, pow(2 * (j * (this.p - j)), (2 * sqrt(this.p) / this.p) + k[this.p]) - 10)

                x0 += 3.4 * r
                y0 = x0 * sin(gamma + 2 * this.t + x0 / 99) / 5
                x1 = x0 * cos(beta) - y0 * sin(beta)
                y1 = x0 * sin(beta) + y0 * cos(beta)

                /*
                * move it to the position of the arc
                * remove this for a cool effect ;)
                */
                ctx.moveTo(x1, y1)

                ctx.arc(x1, y1, r, 0, 2 * PI)
            }

            ctx.closePath()
            ctx.fill()

            /*
            * reason for moving the fill out of the inner loop:
            * see https://twitter.com/loktar00/status/420369245378076672
            */
            ctx.rotate(-this.t / 3)
            ctx.translate(-this.w / 2, -this.h / 2)
        }

        this.t += this.step
    }
}
