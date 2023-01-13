import { Fabric } from './import.mjs'

export class Clip
{
    constructor(ctx)
    {
        Object.assign(this, { currentCursor: 'crosshair', defaultCursor: null, object: null, clip: false, ctx })

        this.performClip = this.performClip.bind(this)
        this.offClip = this.offClip.bind(this)
        this.onClip = this.onClip.bind(this)
        this.toggle = this.toggle.bind(this)
    }

    async performClip({ path })
    {
        try {

            await this.ctx.toolApply({ payload: { path, object: this.object }, tool: 'clipto' })

        } catch (e) {
        }

        await this.offClip()
    }

    async toggle()
    {
        this.clip ? await this.offClip() : await this.onClip()
    }

    async onClip()
    {
        if (!(this.object = this.ctx.canvas.getActiveObject())) {
            return this.ctx.$bus.$emit('snack', { content: 'graph.select_image', color: 'warning' })
        }

        const fabric = await Fabric.resolve()

        this.ctx.canvas.on('path:created', this.performClip)

        this.defaultCursor = this.ctx.canvas.freeDrawingCursor
        this.ctx.canvas.freeDrawingCursor = this.currentCursor

        this.ctx.canvas.freeDrawingBrush = new fabric.PencilBrush(this.ctx.canvas)
        this.ctx.canvas.freeDrawingBrush.color = 'black'
        this.ctx.canvas.freeDrawingBrush.width = 1

        this.ctx.canvas.isDrawingMode = true
        this.ctx.canvas.selection = false

        this.ctx.leaveEvents([])
        this.ctx.lockEventsSet = true
        this.clip = true
    }

    async offClip()
    {
        await new Promise(resolve => setTimeout(resolve))

        this.ctx.canvas.off('path:created', this.performClip)

        this.ctx.canvas.defaultCursor = this.defaultCursor
        this.ctx.canvas.isDrawingMode = false
        this.ctx.canvas.selection = true

        this.object = null
        this.clip = false
    }
}
