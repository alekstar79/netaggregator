import { brushesUtils, patternBrush, circleBrush, pencilBrush, sprayBrush } from './brushes/index.mjs'

import { stateManagerAddFunctionality } from './state-manager.mjs'
import { renderManagerAddFunctionality } from './render-stack.mjs'

import { createTool as curved } from './curved-text.mjs'
import { createTool as qrcode } from './qrcode.mjs'
import { createTool as merger } from './merge.mjs'
import { createTool as promo  } from './promo.mjs'

import { createTool as dynamicBackground } from './dynamic.mjs'
import { createTool as desaturateTool } from './desaturate.mjs'
import { createTool as sharpenTool } from './sharpen.mjs'
import { createTool as cloneTool } from './clone.mjs'
import { createTool as bulgeTool } from './bulge.mjs'
import { createTool as eraseTool } from './erase.mjs'
import { createTool as magicTool } from './magic.mjs'
import { createTool as blurTool  } from './blur.mjs'
import { createTool as fillTool  } from './fill.mjs'

import { setCornersControls  } from './controls.mjs'
import { injectFunctionality } from './extend.mjs'
import { extendFunctionality } from './grid.mjs'
import { setFilters } from './filters.mjs'
import { setTools   } from './toolbox.mjs'
import { Widgets    } from './widgets.mjs'

import { queueMicrotask } from '../callbacks.mjs'

async function init()
{
    let { fabric } = await import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m),
        client = typeof process === 'undefined' || process.browser

    fabric.GridLine = fabric.util.createClass(fabric.Line)
    fabric.WRect = fabric.util.createClass(fabric.Rect)

    fabric = await renderManagerAddFunctionality({ fabric })

    if (client) {
        await import(/* webpackChunkName: "webrtc" */ 'webrtc-adapter')

        fabric = await stateManagerAddFunctionality({ fabric })
        fabric = await setCornersControls({ fabric })

        fabric = await desaturateTool({ fabric })
        fabric = await sharpenTool({ fabric })
        fabric = await cloneTool({ fabric })
        fabric = await bulgeTool({ fabric })
        fabric = await eraseTool({ fabric })
        fabric = await magicTool({ fabric })
        fabric = await blurTool({ fabric })
        fabric = await fillTool({ fabric })
        fabric = await setTools({ fabric })
    }

    fabric = await injectFunctionality({ fabric })
    fabric = await extendFunctionality({ fabric })
    fabric = await dynamicBackground({ fabric })
    fabric = await setFilters({ fabric })
    fabric = await curved({ fabric })
    fabric = await qrcode({ fabric })
    fabric = await merger({ fabric })

    fabric = brushesUtils({ fabric })
    fabric = patternBrush({ fabric })
    fabric = circleBrush({ fabric })
    fabric = pencilBrush({ fabric })
    fabric = sprayBrush({ fabric })

    client && await Widgets.create(fabric)

    return promo({ fabric })
}

export class Fabric
{
    static _fabric = null

    static get instance()
    {
        Fabric._fabric || (Fabric._fabric = init())

        return Fabric._fabric
    }

    static _perform(resolve, reject)
    {
        queueMicrotask(() => (Fabric.instance).then(resolve).catch(reject))
    }

    static resolve(resolver = null, rejecter = null)
    {
        rejecter || (rejecter = () => {})

        return typeof resolver === 'function'
            ? Fabric._perform(resolver, rejecter)
            : new Promise(Fabric._perform)
    }
}
