import { toolsBuilder } from '../../canvas/index.mjs'

const items = [Undo, Redo, CutSelection, CopySelection, Paste, SelectAll, DeselectAll, toNewCanvas]

function Undo(ctx)
{
    this.hidden = (!ctx.canvas?.manager || ctx.canvas.manager.undoBtnDisabled)
    this.name = 'graph.undo'

    this.apply = ctx.undo

    this.reload = () => {
        this.hidden = !ctx.canvas?.manager || ctx.canvas.manager.undoBtnDisabled
    }
}

function Redo(ctx)
{
    this.hidden = (!ctx.canvas?.manager || ctx.canvas.manager.redoBtnDisabled)
    this.name = 'graph.redo'

    this.apply = ctx.redo

    this.reload = () => {
        this.hidden = !ctx.canvas?.manager || ctx.canvas.manager.redoBtnDisabled
    }
}

function CutSelection(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.cut_selection'

    this.apply = () => {
        ctx.copier.cut().then(() => {
            ctx.canvas.trigger('programmatic')
        })
    }
}

function CopySelection(ctx)
{
    this.hidden = !ctx.canvas

    this.apply = ctx.copier.copy.bind(ctx.copier)
    this.name = 'graph.copy_selection'
}

function Paste(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.paste'

    this.apply = () => {
        window.dispatchEvent(new Event('paste'))
        /* ctx.copier.paste().then(() => {
            ctx.canvas.trigger('programmatic')
        }) */
    }
}

function SelectAll(ctx)
{
    this.hidden = !ctx.canvas

    this.apply = ctx.selectAll
    this.name = 'graph.select_all'
}

function DeselectAll(ctx)
{
    this.hidden = !ctx.canvas

    this.apply = ctx.discardActive
    this.name = 'graph.deselect_all'
}

function toNewCanvas(ctx)
{
    this.name = 'graph.to_new_canvas'
    this.hidden = !ctx.canvas
    this.id = 'file.to_new'

    this.apply = ctx.toNewCanvas
}

export default function(ctx)
{
    this.activator = 'graph.topmenu-edit'
    this.items = toolsBuilder(items, ctx, this)
    this.id = 'edit'
}
