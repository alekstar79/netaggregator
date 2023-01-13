import { Fabric } from '../import.mjs'
import { Shape } from './shape.mjs'

export class DLine extends Shape
{
    constructor(mode)
    {
        super({ drawingMode: mode, type: 'line' })
    }

    async make({ x, y }, options)
    {
        this.origX = x
        this.origY = y

        const shadow = { color: 'rgba(0,0,0,1)', offsetX: 0, offsetY: 0, blur: 0 }

        return Fabric.resolve().then(fabric => new fabric.Line(
            [x, y], Object.assign({ shadow: new fabric.Shadow(shadow) }, options)
        ))
    }

    adjust(x2, y2, custom)
    {
        if (!custom) return { x2, y2 }

        let max, deg, x, y

        x = x2 - this.origX
        y = y2 - this.origY

        deg = Math.atan2(y, x) * 180 / Math.PI
        deg = deg < 0 ? 360 + deg : deg

        switch (true) {
            case (deg > 0 && deg < 22.5) || deg > 337.5:
            case deg > 157.5 && deg < 202.5:
                x2 = this.origX + x
                y2 = this.origY
                break

            case deg >  22.5 && deg <  67.5:
            case deg > 205.5 && deg < 247.5:
                max = Math.max(x, y)

                x2 = this.origX + max
                y2 = this.origY + max
                break

            case deg > 112.5 && deg < 157.5:
                max = Math.max(x, y)

                x2 = this.origX - max
                y2 = this.origY + max
                break

            case deg > 292.5 && deg < 337.5:
                max = Math.max(x, y)

                x2 = this.origX + max
                y2 = this.origY - max
                break

            case deg >  67.5 && deg < 112.5:
            case deg > 247.5 && deg < 292.5:
                y2 = this.origY + y
                x2 = this.origX
                break
        }

        return { x2, y2 }
    }

    resize(object, { x: x2, y: y2 }, custom = false)
    {
        return new Promise(resolve => resolve(object.set(this.adjust(x2, y2, custom)).setCoords()))
    }

    static async fromObject(obj)
    {
        return Fabric.resolve()
            .then(fabric => new Promise(resolve => {
                fabric.Line.fromObject(obj, resolve)
            }))
    }
}
