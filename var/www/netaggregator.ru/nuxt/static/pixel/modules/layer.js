export class Layer
{
    get w() {
        return this.canvas.width
    }

    get h() {
        return this.canvas.height
    }

    constructor(container)
    {
        container.appendChild(this.createLayer())

        this.fitToContainer = this.fitToContainer.bind(this)

        addEventListener('resize', this.fitToContainer, false)

        this.fitToContainer()
    }

    createLayer()
    {
        this.canvas = document.createElement('canvas')
        this.context = this.canvas.getContext('2d')

        return this.canvas
    }

    fitToContainer()
    {
        this.canvas.height = this.canvas.offsetHeight
        this.canvas.width = this.canvas.offsetWidth
    }
}
