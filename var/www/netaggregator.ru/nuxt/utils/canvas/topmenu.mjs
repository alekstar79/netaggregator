import { rndstring } from '../common/symbols.mjs'

import image from './topmenu/image.mjs'
import layer from './topmenu/layer.mjs'
import tool from './topmenu/tools.mjs'
import file from './topmenu/file.mjs'
import edit from './topmenu/edit.mjs'
import help from './topmenu/help.mjs'

const list = [file, edit, image, layer, tool, help]

export function on(listeners)
{
    const is = action => typeof action === 'function'

    Object.keys(listeners).forEach(action => {
        const fn = listeners[action]

        listeners[action] = e => {
            this.reload()
            is(fn) && fn(e)
        }
    })

    return listeners
}

export function menu(ctx)
{
    return list.map(B => {
        const block = new B(ctx)

        block.on = on.bind(block)
        block.key = rndstring()
        block.state = false

        block.reload = function(...args) {
            this.items.forEach(t => t.reload(...args))
        }

        return block
    })
}
