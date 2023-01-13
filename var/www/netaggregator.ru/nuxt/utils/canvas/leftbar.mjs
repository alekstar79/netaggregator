import { toolsBuilder, reject, on, off } from './index.mjs'

const list = [DrawMode, ShapeMode, Text, VFlip, HFlip, Rotate, EraseMode, Crop]

function init(tool, remove, exclude, ctx)
{
    this.lock = false
    this.hidden = this.lock || !ctx.canvas
    this.on = false

    this.toggle = () => this.on ? ctx.disableTools(exclude) : ctx.enableTools()
    this.reload = () => {
        this.on = !!ctx.tools.find(t => t === tool)
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        this.on = !this.on

        remove && ctx.toolInset(remove, true)
        ctx.toolInset(tool)

        this.toggle()
    }
}

function DrawMode(ctx)
{
    init.call(this, 'graph-popup-pencil', null, ['brush'], ctx)

    this.name = 'graph.draw'
    this.icon = 'mdi-brush'
    this.id = 'brush'
}

function ShapeMode(ctx)
{
    init.call(this, 'graph-popup-draw', 'graph-popup-draw-settings', ['freemode'], ctx)

    this.name = 'graph.shape'
    this.icon = 'mdi-shape'
    this.id = 'freemode'
}

function Text(ctx)
{
    init.call(this, 'graph-popup-text', 'graph-popup-text-settings', ['text'], ctx)

    this.name = 'graph.text'
    this.icon = 'mdi-text'
    this.id = 'text'
}

function VFlip(ctx)
{
    this.name = 'graph.v_flip'
    this.icon = 'mdi-reflect-vertical'
    this.id = 'vflip'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        ctx.vFlip()
    }
}

function HFlip(ctx)
{
    this.name = 'graph.h_flip'
    this.icon = 'mdi-reflect-horizontal'
    this.id = 'hflip'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        ctx.hFlip()
    }
}

function Rotate(ctx)
{
    this.name = 'graph.rotate'
    this.icon = 'mdi-rotate-right'
    this.id = 'rotate'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = ctx.rotate
}

function EraseMode(ctx)
{
    this.name = 'graph.erase'
    this.icon = 'mdi-eraser'
    this.id = 'eraser'

    this.lock = false
    this.hidden = this.lock || !ctx.canvas

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        if (this.hidden || ctx.freedraw) return reject(ctx)

        if (!ctx.eraser.erasedObject) {
            on(ctx, 'erase', ['eraser','fit'])
        } else {
            off(ctx, 'erase')
        }
    }
}

function Crop(ctx)
{
    this.name = 'graph.crop'
    this.icon = 'mdi-crop'
    this.id = 'crop'

    this.crop = false
    this.lock = false

    this.hidden = this.lock || !ctx.canvas

    const finish = () => {
        this.crop = false
    }

    const init = () => {
        this.crop = true
    }

    ctx.$on('crop:init', init)
    ctx.$on('crop:reset', finish)
    ctx.$on('crop:end', finish)

    this.reload = () => {
        this.hidden = this.lock || !ctx.canvas
    }

    this.handler = () => {
        ctx.crop.toggle()
    }
}

export const leftbar = ctx => toolsBuilder(list, ctx)
