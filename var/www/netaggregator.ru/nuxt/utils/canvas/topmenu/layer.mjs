import { toolsBuilder } from '../../canvas/index.mjs'
import { createImage } from '../../common/image.mjs'

const items = [Manager, Duplicate, ShowHide, Rename, ConvertToRaster, Merge, Delete, MoveUp, MoveDown]

function choose(ctx, content = 'Выберете слой')
{
    ctx.$bus.$emit('snack', { content, color: 'warning' })
}

function makeDuplicate(ctx)
{
    ctx.copier.copy().then(() => ctx.copier.paste())
}

function removeLayer(ctx, obj)
{
    ctx.canvas.remove(obj)
}

function toggleVisible(ctx, obj)
{
    obj.set('visible', !obj.visible)
    ctx.canvas.requestRenderAll()
}

function Manager(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.layers'

    this.apply = () => {
        ctx.toolInset('graph-popup-manager')
    }
}

function Duplicate(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.duplicate'

    this.apply = () => {
        const obj = ctx.canvas.getActiveObject()

        obj
            ? makeDuplicate(ctx)
            : choose(ctx)
    }
}

function ShowHide(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.show_hide'

    this.apply = () => {
        const obj = ctx.canvas.getActiveObject()

        obj
            ? toggleVisible(ctx, obj)
            : choose(ctx)
    }
}

function Rename(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.rename'

    this.apply = () => ({
        call: 'graph-rename-dialogue'
    })
}

function ConvertToRaster(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.raster'

    this.apply = () => {
        const obj = ctx.canvas.getActiveObject()

        if (obj && obj.type !== 'image') {
            createImage(obj).then(img => {
                ctx.leaveEvents([])

                ctx.canvas.insertAt(img, ctx.getId(obj))
                ctx.canvas.remove(obj)

                ctx.restoreEvents([])
                ctx.canvas.trigger('programmatic')
            })
        }
    }
}

function Merge(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.merge'

    this.apply = () => {
        ctx.canvas.merger.make()
    }
}

function Delete(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.delete'

    this.apply = () => {
        const obj = ctx.canvas.getActiveObject()

        obj
            ? removeLayer(ctx, obj)
            : choose(ctx)
    }
}

function MoveUp(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.move_up'

    this.apply = ctx.increaseLayer
}

function MoveDown(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.move_down'

    this.apply = ctx.decreaseLayer
}

export default function(ctx)
{
    this.activator = 'graph.topmenu-layer'
    this.items = toolsBuilder(items, ctx, this)
    this.id = 'layer'
}
