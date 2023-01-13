// noinspection DuplicatedCode

import { PropsArray, TAU, fadeIn, fadeInOut, rand, angle } from '../../toolkit.mjs'

const baseHue = rand(360)
const rangeHue = 180

export class Tentacle
{
    constructor(x, y, segmentNum, baseLength, baseDirection, ctx)
    {
        this.position = [x, y]
        this.segmentNum = segmentNum
        this.baseLength = baseLength
        this.baseDirection = baseDirection
        this.segmentProps = ['x1', 'y1', 'x2', 'y2', 'l', 'd', 'h']
        this.follow = false
        this.ctx = ctx

        this.segments = new PropsArray(segmentNum, this.segmentProps)

        let i = this.segments.length - this.segmentProps.length
        let x1, y1, x2, y2, l, d, h

        l = this.baseLength
        d = this.baseDirection

        for (; i >= 0; i -= this.segmentProps.length) {
            x1 = x2 || this.position[0]
            y1 = y2 || this.position[1]

            x2 = x1 + l * Math.cos(d)
            y2 = y1 + l * Math.sin(d)

            d += .1
            l *= .98

            h = baseHue + fadeIn(i, this.segments.length) * rangeHue

            this.segments.set([x1, y1, x2, y2, l, d, h], i)
        }
    }

    setCtx(ctx)
    {
        this.ctx = ctx
    }

    setTarget(target)
    {
        this.target = target
    }

    async update(tick, simplex)
    {
        let target = [this.target[0], this.target[1]],
            i = this.segments.length - this.segmentProps.length,
            x1, y1, x2, y2, l, d, h, n, t, tn,

            promises = []

        for (; i >= 0; i -= this.segmentProps.length) {
            promises.push(new Promise(resolve => {
                [x1, y1, x2, y2, l, d, h] = this.segments.get(i)

                if (i === 0) {
                    this.position = [x2, y2]
                }

                x1 = target[0]
                y1 = target[1]

                t = angle(x1, y1, x2, y2)

                n = simplex.noise3D((i + x1) * .005, (i + y1) * .005, (i + tick) * .005)

                tn = t + n * TAU * .0125
                x2 = x1 + l * Math.cos(tn)
                y2 = y1 + l * Math.sin(tn)
                d = t

                target = [x2, y2]

                this.segments.set([x1, y1, x2, y2, l, d], i)
                this.drawSegment(x1, y1, x2, y2, h, n, i)

                resolve()
            }))
        }

        await Promise.all(promises)
    }

    drawSegment(x1, y1, x2, y2, h, n, i)
    {
        if (!this.ctx) return

        const fn = fadeInOut(1 + n, 2)
        const fa = fadeIn(i, this.segments.length)
        const a = .25 * (fn + fa)

        this.ctx.beginPath()
        this.ctx.strokeStyle = `hsla(${h}, 50%, 50%, ${a})`
        this.ctx.moveTo(x2, y2)
        this.ctx.lineTo(x1, y1)
        this.ctx.stroke()
        this.ctx.closePath()

        this.ctx.beginPath()
        this.ctx.strokeStyle = `hsla(${h}, 50%, 50%, ${a + .5})`
        this.ctx.arc(x1, y1, fn * 3, 0, TAU)
        this.ctx.stroke()
        this.ctx.closePath()
    }
}
