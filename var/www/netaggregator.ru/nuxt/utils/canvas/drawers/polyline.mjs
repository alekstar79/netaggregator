import { Fabric } from '../import.mjs'
import { Shape } from './shape.mjs'

export class DPolyline extends Shape
{
    constructor(mode)
    {
        super({ drawingMode: mode, type: 'polyline' })
    }

    make({ x, y }, options)
    {
        const shadow = { color: 'rgba(0,0,0,1)', offsetX: 0, offsetY: 0, blur: 0 }

        return Fabric.resolve().then(fabric => new fabric.Polyline(
            [{ x, y }], Object.assign({ shadow: new fabric.Shadow(shadow), fill: 'transparent' }, options)
        ))
    }

    resize(object, { x, y })
    {
        return Fabric.resolve().then(fabric => {
            object.points.push(new fabric.Point(x, y))

            const { left, top, width, height } = object._calcDimensions(),
                pathOffset = new fabric.Point(left + width / 2, top + height / 2)

            return object.set({ left, top, height, width, dirty: true, pathOffset })
                .setCoords()
        })
    }

    static fromObject(obj)
    {
        return Fabric.resolve()
            .then(fabric => new Promise(resolve => {
                fabric.Polyline.fromObject(obj, resolve)
            }))
    }
}
