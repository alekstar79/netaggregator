import { Fabric } from '../import.mjs'
import { Shape } from './shape.mjs'

export class DRectangle extends Shape
{
    constructor(mode)
    {
        super({ drawingMode: mode, type: 'rect' })
    }

    make({ x, y }, options, width, height)
    {
        this.origX = x
        this.origY = y

        const shadow = { color: 'rgba(0,0,0,1)', offsetX: 0, offsetY: 0, blur: 0 }

        return Fabric.resolve().then(fabric => new fabric.Rect(
            Object.assign({
                shadow: new fabric.Shadow(shadow),
                fill: 'transparent',
                left: x,
                top: y,
                height,
                width
            }, options)
        ))
    }

    resize(object, { x, y }, square)
    {
        return this.equal(object, { x, y }, square)
    }

    static fromObject(obj)
    {
        return Fabric.resolve()
            .then(fabric => new Promise(resolve => {
                fabric.Rect.fromObject(obj, resolve)
            }))
    }
}
