import { Fabric } from '../import.mjs'
import { Shape } from './shape.mjs'

export class DText extends Shape
{
    constructor(mode)
    {
        super({ drawingMode: mode, type: 'c-text' })
    }

    make({ x: left, y: top }, options)
    {
        const shadow = { color: 'rgba(0,0,0,1)', offsetX: 0, offsetY: 0, blur: 0 }

        return Fabric.resolve().then(fabric => new Promise(resolve => {
            options = Object.assign({
                shadow: new fabric.Shadow(shadow),
                fontFamily: this.fontFamily,
                textFill: 'rgba(0,0,0,1)',
                text: 'Tap and type',
                textAlign: 'left',
                fontSize: 40,
                left,
                top
            }, options)

            options.shadow.color = options.fill

            const ctext = new fabric.CText(options),
                hypot = Math.hypot(ctext.width, ctext.height),
                scale = 10 / hypot,
                scaleX = scale,
                scaleY = scale

            this.hypot = hypot
            this.origX = left
            this.origY = top

            resolve(ctext.set({ scaleX, scaleY }))
        }))
    }

    resize(object, { x, y })
    {
        const { originX, originY } = this.origin(x, y),
            { scaleX, scaleY } = this.scale(x, y)

        return new Promise((resolve, reject) => {
            if (object) {
                resolve(object.set({ originX, originY, scaleX, scaleY }).setCoords())
            } else {
                reject()
            }
        })
    }

    apply(font)
    {
        this.fontFamily = font.family

        return Promise.resolve({})
    }

    static fromObject(obj)
    {
        return Fabric.resolve()
            .then(fabric => new Promise(resolve => {
                fabric.CText.fromObject(obj, resolve)
            }))
    }
}
