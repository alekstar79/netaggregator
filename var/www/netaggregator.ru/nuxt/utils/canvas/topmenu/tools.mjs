import { Fabric, toolsBuilder } from '../../canvas/index.mjs'

let items = [Filters, AdjustColor, DecreaseColor, ColorCorrection, ColorToAlpha, ColorZoom, ColorReplace, Crop, Dynamic, QRCode, Curved, Clip, Shadow],
    group = type => type === 'activeSelection' || type === 'group'

function dynamicBar(ctx)
{
    this.opened = ctx.tools.includes('graph-popup-dynamic')
}

function choose(ctx, content = 'graph.select_image')
{
    ctx.$bus.$emit('snack', { content, color: 'warning' })
}

function imageIsset({ type, _objects } = {})
{
    return group(type) ? _objects.some(o => o.type === 'image') : type === 'image'
}

function apply(tool)
{
    const obj = this.canvas.getActiveObject()

    obj && imageIsset(obj) ? this.toolInset(tool) : choose(this)
}

function Filters(ctx)
{
    this.name = 'graph.filters'
    this.hidden = !ctx.canvas

    this.apply = apply.bind(ctx, 'graph-popup-filter')
}

function AdjustColor(ctx)
{
    this.name = 'graph.adjust_color'
    this.hidden = !ctx.canvas

    this.apply = () => {
        const obj = ctx.canvas.getActiveObject()

        obj && imageIsset(obj)
            ? ctx.autoAdjust()
            : choose(ctx)
    }
}

function DecreaseColor(ctx)
{
    this.name = 'graph.decrease_color'
    this.hidden = !ctx.canvas

    this.apply = apply.bind(ctx, 'graph-popup-decrease')
}

function ColorCorrection(ctx)
{
    this.name = 'graph.color_correction'
    this.hidden = !ctx.canvas

    this.apply = apply.bind(ctx, 'graph-popup-correction')
}

function ColorToAlpha(ctx)
{
    this.name = 'graph.toalpha'
    this.hidden = !ctx.canvas

    this.apply = apply.bind(ctx, 'graph-popup-to-alpha')
}

function ColorZoom(ctx)
{
    this.name = 'graph.color_heat'
    this.hidden = !ctx.canvas

    this.apply = apply.bind(ctx, 'graph-popup-zoom')
}

function ColorReplace(ctx)
{
    this.name = 'graph.replace_color'
    this.hidden = !ctx.canvas

    this.apply = apply.bind(ctx, 'graph-popup-replace')
}

function Crop(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.crop'

    this.crop = false

    const finish = () => {
        this.crop = false
    }

    const init = () => {
        this.crop = true
    }

    ctx.$on('crop:init', init)
    ctx.$on('crop:reset', finish)
    ctx.$on('crop:end', finish)

    this.apply = () => {
        ctx.crop.toggle()
    }
}

function QRCode(ctx)
{
    this.name = 'graph.qrcode'
    this.hidden = !ctx.canvas

    this.apply = () => {
        Fabric.resolve().then(fabric => {
            fabric.QrCode.create(ctx).then(o => {
                ctx.canvas.insertTo(o)
            })
        })
    }
}

function Dynamic(ctx)
{
    this.name = 'graph.dynamic'
    this.hidden = !ctx.canvas

    dynamicBar.call(this, ctx)

    this.reload = () => {
        this.hidden = !ctx.canvas
    }

    this.apply = () => {
        Fabric.resolve().then(fabric => {
            if (!ctx.isDynamicTool()) {
                ctx.canvas.insertAt(fabric.DynamicBackground.create(ctx), 0)
            }
            if (!ctx.tools.includes('graph-popup-dynamic')) {
                ctx.toolInset('graph-popup-dynamic', false)

            } else if (this.opened) {
                ctx.toolInset('graph-popup-dynamic', true)
            }

            dynamicBar.call(this, ctx)
        })
    }
}

function Curved(ctx)
{
    this.name = 'graph.curved'
    this.hidden = !ctx.canvas

    this.apply = () => {
        Fabric.resolve().then(fabric => {
            fabric.CurvedText.create(ctx).then(o => {
                ctx.canvas.insertTo(o)
            })
        })
    }
}

function Clip(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.clipto'

    this.apply = () => {
        ctx.clip.toggle()
    }
}

function Shadow(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.shadow'

    const tool = 'graph-popup-shadow-settings'

    this.apply = () => {
        const obj = ctx.canvas.getActiveObject()

        switch (true) {
            case !obj:
                choose(ctx, 'graph.no_obj_shadowing')
                break
            case /widget/.test(obj.type):
                choose(ctx, 'graph.not_applicable')
                break
            case group(obj.type):
                choose(ctx, 'graph.select_one')
                break

            default:
                ctx.toolInset(tool)
        }
    }
}

export default function(ctx)
{
    this.activator = 'graph.topmenu-tools'
    this.items = toolsBuilder(items, ctx, this)
    this.id = 'tools'
}
