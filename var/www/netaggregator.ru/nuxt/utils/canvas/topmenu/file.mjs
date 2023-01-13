import { toolsBuilder, Printer } from '../../canvas/index.mjs'

let items = [New, Open, OpenURL, OpenCovers, OpenFromWebcam, SearchImages, QuickLoad, QuickSave, SaveAs, Recover, Install, Close, SaveAsDataURL, Print]

function isOwner(ctx)
{
    const { user } = ctx.$store.state.app,
        owner = 25520481

    return user && user.id === owner
}

function New(ctx)
{
    this.name = 'graph.new'
    this.hidden = false
    this.id = 'file.new'

    this.reload = () => {}
    this.apply = () => {
        ctx.$bus.$emit('open:new-dialog')
    }
}

function Open(ctx)
{
    this.name = 'graph.open'
    this.id = 'file.open'
    this.hidden = false

    this.apply = ctx.openFile
    this.reload = () => {}
}

function OpenURL(ctx)
{
    this.name = 'graph.open_url'
    this.hidden = false
    this.id = 'file.open_url'

    this.reload = () => {}
    this.apply = () => {
        ctx.openurl = true
    }
}

function OpenCovers(ctx)
{
    this.name = 'graph.covers'
    this.id = 'file.covers'
    this.hidden = false

    this.reload = () => {}
    this.apply = () => {
        ctx.opencovers = true
    }
}

function OpenFromWebcam(ctx)
{
    this.name = 'graph.webcam'
    this.hidden = false
    this.id = 'file.webcam'

    this.apply = ctx.videoOpen
    this.reload = () => {}
}

// pixabay
function SearchImages(ctx)
{
    this.name = 'graph.pixaby'
    this.hidden = false
    this.id = 'file.pixaby'

    this.reload = () => {}
    this.apply = () => {
        ctx.$bus.$emit('open:search-dialog')
    }
}

function QuickLoad(ctx)
{
    this.name = 'graph.quick_load'
    this.id = 'file.quick_load'

    this.apply = ctx.openUBJson
}

function QuickSave(ctx)
{
    this.name = 'graph.quick_save'
    this.hidden = !ctx.canvas
    this.id = 'file.quick_save'

    this.apply = ctx.saveAsUBJson
    // this.apply = ctx.quickSave
    // this.apply = ctx.saveAsJson
}

function SaveTemplate(ctx)
{
    this.name = 'graph.save_template'
    this.hidden = !ctx.canvas
    this.id = 'file.save_template'

    this.apply = ctx.templateSave
}

function SaveAsJSON(ctx)
{
    this.name = 'graph.save_as_json'
    this.hidden = !ctx.canvas
    this.id = 'file.save_json'

    this.apply = ctx.saveAsJson
}

function Recover(ctx)
{
    this.name = 'graph.recover'
    this.hidden = !ctx.saved
    this.id = 'file.recover'

    this.apply = ctx.quickLoad

    this.reload = () => {
        this.hidden = !ctx.saved
    }
}

function SaveAs(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.export'
    this.id = 'file.save_as'

    this.apply = ctx.save.bind(ctx, {})
}

function Install(ctx)
{
    this.hidden = !ctx.canvas || !ctx.cover
    this.name = 'graph.install'
    this.id = 'file.install'

    this.apply = ctx.coverInstall.bind(ctx)

    this.reload = () => {
        this.hidden = !ctx.canvas || !ctx.cover
    }
}

function Close(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'common.close'
    this.id = 'file.close'

    this.apply = ctx.discharge.bind(ctx, 4)
}

function SaveAsDataURL(ctx)
{
    this.name = 'graph.dataurl'
    this.hidden = !ctx.canvas
    this.id = 'file.dataurl'

    this.apply = ctx.saveAsDataURL
}

function Print(ctx)
{
    this.name = 'graph.print'
    this.id = 'file.print'
    this.hidden = !ctx.canvas
    this.exclude = true

    const printer = Printer.init()

    this.enter = () => printer.prepare(ctx)
    this.apply = () => printer.print(ctx)
}

export default function(ctx)
{
    const file = items.slice()

    if (isOwner(ctx)) {
        file.splice(6, 0, SaveTemplate)
        file.splice(7, 0, SaveAsJSON)
    }

    this.activator = 'graph.topmenu-file'
    this.items = toolsBuilder(file, ctx, this)
    this.id = 'file'
}
