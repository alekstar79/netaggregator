import { debounce } from '../common/debounce.mjs'
import { setControls } from './index.mjs'

export function textAddFunctionality(fabric)
{
    const shadow = () => new fabric.Shadow({ color: 'rgba(0,0,0,1)', offsetX: 0, offsetY: 0, blur: 0 }),
        props = ['fontFamily','charSpacing','lineHeight','textAlign','textFill','shadow','strokeWidth'],
        marks = props.reduce((set, p) => ({ ...set, [p]: true }), {}),

        browser = typeof process === 'undefined' || process.browser

    fabric.CText = fabric.util.createClass(fabric.IText, {
        type: 'c-text',

        __skipDimension: false,

        // objectCaching: false,
        // statefullCache: true,
        // noScaleCache: false,

        /* onEditingEntered()
        {
            this._textBoxState = this.toObject()
        }, */

        onEditingCanceled()
        {
            this.set('text', this._textBeforeEdit)
            // this.set(this._textBoxState)
        }
    })

    /**
     * @see https://github.com/fabricjs/fabric.js/issues/4015#issuecomment-309699496
     */
    fabric.CText.prototype.keysMap[27] = 'cancelEditing'
    fabric.CText.prototype.cancelEditing = function() {
        this.exitEditing()
        this.fire('editing:canceled')
    }

    fabric.CText.prototype.initialize = (function(initialize) {
        return function({ text, ...options }) {
            initialize.call(this, text, options)

            // this.on('editing:entered', this.onEditingEntered)
            this.on('editing:canceled', this.onEditingCanceled)
            this.on('added', this.initDimensions)

            fabric.util.clearFabricFontCache()

            browser && setControls(this, {
                tr: {
                    cursor: 'pointer',
                    action: () => {
                        this.stopFix = true
                        this.canvas.trigger('ctext:settings', this)
                        setTimeout(() => {
                            this.stopFix = false
                        }, 100)
                    }
                }
            })
        }

    })(fabric.CText.prototype.initialize)

    fabric.CText.prototype.initDimensions = (function(initDimensions) {
        return function() {
            this.__skipDimension = false
            initDimensions.call(this)
            this.__skipDimension = true

            this.setCoords()
        }
    })(fabric.CText.prototype.initDimensions)

    /* fabric.CText.prototype.requestRender = (function(render) {
        let canvas = null

        return debounce(function() {
            this.canvas && (canvas = this.canvas)
            canvas && render.call(canvas)

        }, 0)

    })(fabric.Canvas.prototype.renderAll) */

    fabric.CText.prototype.onChangeFix = debounce(function() {
        if (this.stopFix || !this.canvas) {
            this.stopFix = false
            return
        }

        this.canvas.trigger('programmatic')
        this.initDimensions()

    }, 0)

    fabric.CText.fromObject = function(object, callback) {
        fabric.Object._fromObject('CText', object, callback)
    }

    fabric.CText = new Proxy(fabric.CText, {
        construct(T, args)
        {
            const target = new T(...args)

            const proxy = new Proxy(target, {
                set(target, prop, value) {
                    switch (prop) {
                        case 'shadow':
                            target.shadow || (target.shadow = shadow())
                            target.dirty = Object.keys(value).every(k => Reflect.set(target[prop], k, value[k]))
                            break

                        case 'fontFamily':
                        case 'strokeWidth':
                        case 'charSpacing':
                        case 'lineHeight':
                        case 'textAlign':
                        case 'fontSize':
                            target.dirty = Reflect.set(target, prop, value)
                            target.initDimensions()
                            break

                        case 'strokeColor':
                            target.dirty = Reflect.set(target, 'stroke', value)
                            break

                        case 'textFill':
                            target.dirty = Reflect.set(target, 'fill', value)
                            break

                        default:
                            Reflect.set(target, prop, value)
                    }

                    if (browser && prop in marks) {
                        target.onChangeFix()
                    }
                    if (browser) {
                        fabric.request()
                    }

                    return true
                },
                get(target, prop) {
                    switch (prop) {
                        case 'shadow':
                            target.shadow || (target.shadow = shadow())
                            break

                        case 'strokeColor':
                            target[prop] = target.stroke
                            break

                        case 'textFill':
                            target[prop] = target.fill
                            break
                    }

                    return target[prop]
                }
            })

            proxy.originalTarget = target

            return proxy
        }
    })

    return fabric
}
