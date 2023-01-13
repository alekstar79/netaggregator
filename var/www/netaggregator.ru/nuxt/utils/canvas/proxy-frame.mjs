import { close, finger, plus } from '../../assets/data/canvas-icons.mjs'
import { debounce } from '../common/debounce.mjs'
import { setControls } from './index.mjs'

function noop() {}

/**
* todo: Work through clipPath! Can be any object, even another image.
*  In this regard, it might be worth revising the releaseClip function.
* @lends default.methods.releaseClip
*/
export function frameAddFunctionality(fabric)
{
    const browser = typeof process === 'undefined' || process.browser

    fabric.Frame = fabric.util.createClass(fabric.Image, { type: 'frame', source: null, frame: null })

    fabric.Frame.prototype.initialize = (function(initialize) {
        return function(element, { source, frame, ...options }) {
            initialize.call(this, element, options)

            this.source = source
            this.frame = frame

            this.on('added', () => {
                this.cornersOn()
            })
        }

    })(fabric.Frame.prototype.initialize)

    fabric.Frame.prototype.toObject = (function(toObject) {
        return function(include) {
            return toObject.call(this, ['source','frame'].concat(include))
        }
    })(fabric.Frame.prototype.toObject)

    fabric.Frame.prototype.imageExtract = function() {
        return new Promise(resolve => {
            const src = this.source

            fabric.Image.fromObject(src, img => {
                this.setSrc(this.frame, () => {
                    this.src = this.frame
                    this.source = null

                    this.canvas.insertTo(img)
                    this.cornersOn()

                    resolve()
                })
            })
        })
    }

    fabric.Frame.prototype.imageInsert = function(img) {
        return new Promise(resolve => {
            const cnv = this.toCanvasElement({ withoutTransform: true }),
                ctx = cnv.getContext('2d')

            ctx.globalCompositeOperation = 'source-in'
            ctx.drawImage(
                img._element,
                0,
                0,
                img._element.width,
                img._element.height,
                0,
                0,
                cnv.width,
                cnv.height
            )

            this.src = cnv.toDataURL()

            this.setSrc(this.src, () => {
                this.source = img.toObject()
                this.canvas.remove(img)
                resolve()
            })
        })
    }

    fabric.Frame.prototype.insert = debounce(function() {
        this.canvas && this.canvas.trigger('frame:composite', this)

    }, 0)

    fabric.Frame.prototype.extract = function() {
        this.imageExtract().catch(() => {
            this.canvas.trigger('canvas:snack', {
                content: 'Extract image error',
                color: 'warning'
            })
        })
    }

    fabric.Frame.prototype.cornersOn = browser
        ? function() {
            setControls(this, {
                tr: {
                    action: (this.source ? this.extract : this.insert).bind(this),
                    cursor: 'pointer'
                }
            },{
                tr: { icon: this.source ? close : plus }
            })
        }
        : noop

    fabric.Frame.prototype.cornersOff = browser
        ? function() {
            setControls(this, {
                bl: { action: null, cursor: 'pointer' },
                br: { action: null, cursor: 'pointer' },
                mb: { action: null, cursor: 'pointer' },
                tr: { action: null, cursor: 'pointer' }
            },{
                tr: { icon: finger }
            })
        }
        : noop

    fabric.Frame.fromURL = function(src, callback, options = {}) {
        fabric.util.loadImage(src, img => {
            if (!img) return callback(null)

            callback(new fabric.Frame(img, {
                ...options,
                source: null,
                frame: src
            }))

        }, null, options.crossOrigin)
    }

    fabric.Frame.fromObject = function(object, callback) {
        const options = fabric.util.object.clone(object)

        fabric.util.loadImage(options.src, (img, error) => {
            if (error) return callback(null, error)

            callback(new fabric.Frame(img, options))

        }, null, options.crossOrigin)
    }

    /* fabric.Frame = new Proxy(fabric.Frame, {
        construct(T, args)
        {
            const target = new T(...args)

            const proxy = new Proxy(target, {
                set(target, prop, value) {
                    return Reflect.set(target, prop, value)
                },
                get(target, prop) {
                    return Reflect.get(target, prop)
                }
            })

            proxy.originalTarget = target

            return proxy
        }
    }) */

    return fabric
}
