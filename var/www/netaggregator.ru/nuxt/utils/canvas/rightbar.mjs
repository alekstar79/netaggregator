import { toolsBuilder, reject, inset, on, off } from './index.mjs'

const list = [MagicWand, Desaturate, Sharpen, Blur, Bulge, Clone, Fill, Pipette]

function MagicWand(ctx)
{
    this.name = 'graph.magic_wand'
    this.icon = 'mdi-magic-wand'
    this.id = 'magicwand'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        if (this.hidden || ctx.freedraw) return reject(ctx)

        if (!ctx.magic.origin) {
            on(ctx, 'magic', ['magicwand','fit','redo','undo'])
        } else {
            off(ctx, 'magic')
        }
    }
}

function Desaturate(ctx)
{
    this.name = 'graph.desaturate'
    this.icon = 'mdi-desaturate'
    this.id = 'desaturate'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        if (this.hidden || ctx.freedraw) return reject(ctx)

        if (!ctx.desaturator.origin) {
            on(ctx, 'desaturate', ['desaturate','fit','redo','undo'])
        } else {
            off(ctx, 'desaturate')
        }
    }
}

function Sharpen(ctx)
{
    this.name = 'graph.sharpen'
    this.icon = 'mdi-sharpen'
    this.id = 'sharpen'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        if (this.hidden || ctx.freedraw) return reject(ctx)

        if (!ctx.sharpen.origin) {
            on(ctx, 'sharpen', ['sharpen','fit','redo','undo'])
        } else {
            off(ctx, 'sharpen')
        }
    }
}

function Blur(ctx)
{
    this.name = 'graph.blur'
    this.icon = 'mdi-blur'
    this.id = 'blur'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        if (this.hidden || ctx.freedraw) return reject(ctx)

        if (!ctx.blurring.origin) {
            on(ctx, 'blur', ['blur','fit','redo','undo'])
        } else {
            off(ctx, 'blur')
        }
    }
}

function Bulge(ctx)
{
    this.name = 'graph.bulge'
    this.icon = 'mdi-bulge'
    this.id = 'bulge'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        if (this.hidden || ctx.freedraw) return reject(ctx)

        if (!ctx.bulge.origin) {
            on(ctx, 'bulge', ['bulge','fit','redo','undo'])
        } else {
            off(ctx, 'bulge')
        }
    }
}

function Clone(ctx)
{
    this.name = 'graph.clone'
    this.icon = 'mdi-clone'
    this.id = 'clone'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        if (this.hidden || ctx.freedraw) return reject(ctx)

        if (!ctx.clone.origin) {
            on(ctx, 'clone', ['clone','fit','redo','undo'])
        } else {
            off(ctx, 'clone')
        }
    }
}

function Fill(ctx)
{
    this.name = 'graph.fill'
    this.icon = 'mdi-fill-color'
    this.id = 'fill'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        if (this.hidden || ctx.freedraw) return reject(ctx)

        if (!ctx.filler.origin) {
            on(ctx, 'fill', ['fill','fit','redo','undo'])
        } else {
            off(ctx, 'fill')
        }
    }
}

function Pipette(ctx)
{
    this.name = 'graph.pipette'
    this.icon = 'mdi-eyedropper'
    this.id = 'pipette'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        if (this.hidden || ctx.freedraw) return reject(ctx)

        if (!ctx.canvas.isDrawingMode) {
            inset(ctx, 'pipette', ['pipette','fit','redo','undo'])
        } else {
            off(ctx, 'pipette')
        }
    }
}

export const rightbar = ctx => toolsBuilder(list, ctx)
