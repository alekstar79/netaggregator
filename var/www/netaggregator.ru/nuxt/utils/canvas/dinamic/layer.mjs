export class Layer
{
    get w() {
        return this.canvas.width
    }

    get h() {
        return this.canvas.height
    }

    constructor(canvas)
    {
        this.context = canvas.getContext('2d')
        this.canvas = canvas
    }
}
