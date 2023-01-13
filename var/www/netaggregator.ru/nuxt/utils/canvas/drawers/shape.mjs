export class Shape
{
    constructor(options)
    {
        this.drawingMode = options.drawingMode
        this.type = options.type
    }

    origin(x, y)
    {
        return {
            originX: this.origX > x ? 'right' : 'left',
            originY: this.origY > y ? 'bottom' : 'top'
        }
    }

    scale(x, y)
    {
        const height = Math.abs(this.origY - y),
            width = Math.abs(this.origX - x),

            hypot = Math.hypot(width, height),
            scale = hypot / this.hypot

        return {
            scaleX: scale,
            scaleY: scale
        }
    }

    equal(object, { x, y }, equal)
    {
        let { originX, originY } = this.origin(x, y),
            height = Math.abs(this.origY - y),
            width = Math.abs(this.origX - x)

        if (equal) {
            height = width = Math.max(height, width)
        }

        return new Promise(resolve => resolve(
            object.set({ originX, originY, height, width }).setCoords()
        ))
    }

    apply()
    {
        return Promise.resolve({})
    }

    toJson()
    {
        return { drawingMode: this.drawingMode, type: this.type }
    }
}
