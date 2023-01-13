import { Fabric } from '../import.mjs'
import { Shape } from './shape.mjs'

export class DEllipse extends Shape
{
    constructor(mode)
    {
        super({ drawingMode: mode, type: 'ellipse' })
    }

    make({ x, y }, options, rx, ry)
    {
        this.origX = x
        this.origY = y

        const shadow = { color: 'rgba(0,0,0,1)', offsetX: 0, offsetY: 0, blur: 0 }

        return Fabric.resolve().then(fabric => new fabric.Ellipse(
            Object.assign({
                shadow: new fabric.Shadow(shadow),
                fill: 'transparent',
                left: x,
                top: y,
                rx,
                ry
            }, options)
        ))
    }

    resize(object, { x, y }, circle)
    {
        let originX, originY, rx, ry

        originX = this.origX > x ? 'right' : 'left'
        originY = this.origY > y ? 'bottom' : 'top'

        rx = Math.abs(x - object.left) / 2
        ry = Math.abs(y - object.top) / 2

        if (circle) {
            rx = ry = Math.max(rx, ry)
        }

        return new Promise(resolve => resolve(
            object.set({ originX, originY, rx, ry }).setCoords()
        ))
    }

    static fromObject(obj)
    {
        return Fabric.resolve()
            .then(fabric => new Promise(resolve => {
                fabric.Ellipse.fromObject(obj, resolve)
            }))
    }
}
