// noinspection ES6PreferShortImport

import { widgets } from '../../../mixins/canvas/core.mjs'
import { toolsBuilder } from '../../canvas/index.mjs'

let items = [Info, ZoomIncrease, ZoomDecrease, OriginalSize, FitWindow, Rotate, VFlip, HFlip, Opacity, Grid]

function Info(ctx)
{
    const tool = 'graph-popup-info'

    this.hidden = !ctx.canvas
    this.name = 'graph.info'

    this.apply = () => {
        ctx.toolInset(tool)
    }
}

function ZoomIncrease(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.zoom+'

    this.apply = () => {
        ctx.zoom(+.1)
    }
}

function ZoomDecrease(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.zoom-'

    this.apply = () => {
        ctx.zoom(-.1)
    }
}

function OriginalSize(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.original_size'

    this.apply = () => {
        ctx.fitToOrigin(ctx.origin).catch(() => {})
    }
}

function FitWindow(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.fit_window'

    this.apply = () => {
        ctx.fitToWindow(ctx.origin).catch(() => {})
    }
}

function Rotate(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.rotate'

    this.apply = ctx.rotate
}

function VFlip(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.v_flip'

    this.apply = ctx.vFlip
}

function HFlip(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.h_flip'

    this.apply = ctx.hFlip
}

function Opacity(ctx)
{
    const tool = 'graph-popup-opacity'

    this.hidden = !ctx.canvas
    this.name = 'graph.opacity'

    this.apply = () => {
        if (!ctx.active.length) {
            ctx.selectAll(null, widgets)
        }
        if (ctx.suppressWidgetsAndDynamic()) {
            ctx.toolInset(tool)
        }
    }
}

function Grid(ctx)
{
    const tool = 'graph-popup-snap-grid'

    this.hidden = !ctx.canvas
    this.name = 'graph.grid'
    this.grid = false

    this.reload = () => {
        this.hidden = !ctx.canvas
    }

    this.apply = () => {
        ctx.toolInset(tool)
    }
}

export default function(ctx)
{
    this.activator = 'graph.topmenu-image'
    this.items = toolsBuilder(items, ctx, this)
    this.id = 'image'
}
