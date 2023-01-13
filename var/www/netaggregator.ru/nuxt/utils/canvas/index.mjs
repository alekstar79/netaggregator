import { cog, down, remove, up } from '../../assets/data/canvas-icons.mjs'

export { createBorderMask, floodFill, concatMasks, gaussBlur, gaussBlurOnlyBorder, getBorderIndices, traceContours, simplifyContours } from './libs/magic-wand.mjs'
export { queueMicrotask, nextTick, nextFrame, cancelFrame, requestIdleCallback, cancelIdleCallback, running, fulfill, carryOut } from '../callbacks.mjs'
export { Effect, toImage, mapRGB, colorMatrixFilter, convolutionFilter, color2heat } from './libs/effect/index.mjs'
export { hex2rgb, rgb2hex, rgbToHex, hslToRgb, rgbToHsl } from './colors.mjs'
export { circleCursor, squareCursor, pipetteCursor } from './cursors.mjs'

export { WebGLImageFilter, getImageData } from './libs/webgl/index.mjs'
export { init, createWebGLContext       } from './libs/glfx/index.mjs'
export { reduceFileSize, calcQuality    } from './libs/imgreduce.mjs'

export { getAdjustData   } from './color-adjust.mjs'
export { doCorrections   } from './color-correction.mjs'
export { getDecreaseData } from './color-decrease.mjs'
export { replaceColor    } from './color-replace.mjs'
export { colorToAlpha    } from './color-alpha.mjs'
export { colorZoom       } from './color-zoom.mjs'

export { rightbar     } from './rightbar.mjs'
export { leftbar      } from './leftbar.mjs'
export { menu         } from './topmenu.mjs'
export { lock, unlock } from './locker.mjs'

export { Printer      } from './printer.mjs'
export { Widgets      } from './widgets.mjs'
export { Fabric       } from './import.mjs'
export { Copier       } from './copier.mjs'
export { Brush        } from './brush.mjs'
export { Crop         } from './crop.mjs'
export { Clip         } from './clip.mjs'

export { screenfull } from '../screenfull.mjs'
export { drawers  } from './drawers/index.mjs'
export { cropzone } from './cropzone.mjs'
export { compress } from './compress.mjs'
export { upscale  } from './upscale.mjs'

function noop() {}

export function toolsBuilder(list, ctx, container)
{
    const hasOwn = Object.prototype.hasOwnProperty

    return list.map(T => {
        T.prototype.attrs = {}

        T.prototype.reload = function() {
            for (const prop in this) {
                if (hasOwn.call(this, prop) && prop === 'hidden') {
                    this[prop] = !ctx.canvas
                }
            }
        }

        return new T(ctx, container)
    })
}

export function setControls(obj, controls = {}, icons = {})
{
    if (typeof process !== 'undefined' && !process.browser) return

    obj.customiseControls({
        mtr: { action: null, cursor: 'crosshair' },
        mr: { action: null, cursor: 'resize' },
        mt: { action: null, cursor: 'resize' },
        tl: { action: null, cursor: 'resize' },
        bl: { action: 'remove',   cursor: 'pointer' },
        br: { action: 'moveUp',   cursor: 'pointer' },
        mb: { action: 'moveDown', cursor: 'pointer' },
        tr: { action: () => {},   cursor: 'pointer' },
        ...controls
    })

    obj.customiseCornerIcons({
        settings: {
            borderColor: '#0094dd',
            cornerBackgroundColor: '#0094dd',
            cornerShape: 'rect',
            cornerPadding: 5,
            cornerSize: 17
        },

        tr:  { icon: cog  },
        mb:  { icon: down },
        br:  { icon: up },
        bl:  { icon: remove },
        ...icons
    })
}

export function promisify(fabricClass, setCallback, getCallback)
{
    return new Proxy(fabricClass, {
        construct(T, args)
        {
            const target = new T(...args)

            const proxy = new Proxy(target, {
                set(t, prop, value) {
                    t.dirty = Reflect.set(t, prop, value)

                    if (prop !== 'canvas' && prop in t.context) {
                        t.context[prop] = value

                        if (typeof setCallback === 'function') {
                            setCallback.call(t, prop, value)
                        }
                    }

                    return t.dirty
                },
                get(t, prop) {
                    if (prop !== 'canvas' && prop in t.context) {
                        t[prop] = t.context[prop]

                        if (typeof getCallback === 'function') {
                            getCallback.call(t, prop)
                        }
                    }

                    return t[prop]
                }
            })

            proxy.originalTarget = target

            return proxy
        }
    })
}

const clip = ['group', 'activeSelection', 'widget', 'dynamic-background', 'curved-text', 'qr-code']

export function choose(ctx)
{
    ctx.$bus.$emit('snack', { content: 'graph.select_object', color: 'warning' })
}

export function reject(ctx)
{
    ctx.$bus.$emit('snack', { content: 'graph.unavailable', color: 'warning' })
}

export function inset(ctx, tool, exclude)
{
    ctx.toolInset(`graph-popup-${tool}`)

    ctx.disableTools(exclude).catch(noop)
}

export function off(ctx, tool)
{
    ctx.toolInset(`graph-popup-${tool}`, true)

    ctx.enableTools().catch(noop)
}

export function on(ctx, tool, exclude)
{
    const obj = ctx.canvas.getActiveObject()

    if (obj && !clip.some(t => obj.type.includes(t))) {
        inset(ctx, tool, exclude)
    } else {
        choose(ctx)
    }
}
