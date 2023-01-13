import { readFile } from '../../common/read-file.mjs'
import { Fabric } from '../import.mjs'
import { Shape } from './shape.mjs'

export class DImage extends Shape
{
    constructor(mode)
    {
        super({ drawingMode: mode, type: 'image' })
    }

    make({ x: left, y: top }, { img: { src, width, height } })
    {
        this.origX = left
        this.origY = top

        this.hypot = Math.hypot(width, height)

        return Fabric.resolve().then(fabric => new Promise(resolve => {
            const config = { color: 'rgba(0,0,0,1)', offsetX: 0, offsetY: 0, blur: 0 },
                shadow = new fabric.Shadow(config),
                scale = 10 / this.hypot,
                scaleX = scale,
                scaleY = scale

            fabric.Image.fromURL(src, img => {
                resolve(img.set({ scaleX, scaleY, shadow, left, top, height, width }))
            })
        }))
    }

    resize(object, { x, y })
    {
        const { originX, originY } = this.origin(x, y),
            { scaleX, scaleY } = this.scale(x, y)

        return new Promise(resolve => resolve(
            object.set({ originX, originY, scaleX, scaleY }).setCoords()
        ))
    }

    apply()
    {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input')

            input.accept = 'image/*'
            input.multiple = false
            input.onerror = reject
            input.type = 'file'

            input.onchange = ({ target }) => {
                const file = target.files[0]

                if (file.type.match('image/*')) {
                    return readFile(file).then(({ target: { result } }) => {
                        const image = new Image()

                        image.onload = ({ target }) => {
                            resolve(target)
                        }

                        image.onerror = reject
                        image.src = result
                    })
                }

                reject()
            }

            input.click()
        })
    }

    static fromObject(obj)
    {
        return Fabric.resolve()
            .then(fabric => new Promise(resolve => {
                fabric.Image.fromObject(obj, resolve)
            }))
    }
}
