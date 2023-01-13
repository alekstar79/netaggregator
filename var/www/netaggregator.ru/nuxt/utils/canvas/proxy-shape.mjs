import { cog as icon } from '../../assets/data/canvas-icons.mjs'
import { debounce } from '../common/debounce.mjs'
import { setControls } from './index.mjs'

export function shapeAddFunctionality(Shape, fabric)
{
    const shadow = () => new fabric.Shadow({ color: 'rgba(0,0,0,1)', offsetX: 0, offsetY: 0, blur: 0 }),
        props = ['lineType','shapeFill','strokeColor','strokeWidth','shadowColor','shadow','offsetX','offsetY','blur','radius'],
        marks = props.reduce((set, p) => ({ ...set, [p]: true }), {}),

        browser = typeof process === 'undefined' || process.browser

    Shape.prototype.initialize = (function(initialize) {
        return function(...args) {
            initialize.call(this, ...args)

            browser && setControls(this, {
                tr: {
                    cursor: 'pointer',
                    action: () => {
                        this.stopFix = true
                        this.canvas.trigger('shape:settings', this)
                        setTimeout(() => {
                            this.stopFix = false
                        }, 100)
                    }
                }
            }, {
                tr: { icon }
            })
        }

    })(Shape.prototype.initialize)

    Shape.prototype.toObject = (function(toObject) {
        return function(include = []) {
            const keys = props.filter(p => p !== 'shapeFill'),
                obj = this.originalTarget || this

            return toObject.call(obj, keys.concat(include))
        }

    })(Shape.prototype.toObject)

    /* Shape.prototype.requestRender = (function(render) {
        let canvas = null

        return debounce(function() {
            this.canvas && (canvas = this.canvas)
            canvas && render.call(canvas)

        }, 0)

    })(fabric.Canvas.prototype.renderAll) */

    Shape.prototype.onChangeFix = debounce(function() {
        if (this.stopFix || !this.canvas) {
            this.stopFix = false
            return
        }

        this.canvas.trigger('programmatic')

    }, 0)

    Shape.prototype.setLineType = function() {
        const k = this.strokeWidth > 3 ? 2 : 1,
            options = {}

        switch (this.lineType) {
            case 'solid':
                options.strokeDashArray = null
                options.strokeLineCap = 'butt'
                break
            case 'dotted':
                options.strokeDashArray = [1, this.strokeWidth * 3]
                options.strokeLineCap = 'round'
                break
            case 'dashed':
                options.strokeLineCap = 'butt'
                options.strokeDashArray = [
                    this.strokeWidth * 2.3 * k,
                    this.strokeWidth * 1.7 * k
                ]
        }

        this.set(options)
    }

    Shape.prototype.setPattern = function(src, repeat) {
        return new fabric.Pattern({
            crossOrigin: 'anonymous',
            source: src,
            repeat

        }, fill => {
            this.set({ fill })
            fabric.request()
        })
    }

    return new Proxy(Shape, {
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

                        case 'shadowColor':
                        case 'offsetX':
                        case 'offsetY':
                        case 'blur':
                            target.shadow || (target.shadow = shadow())
                            prop in target.shadow || (prop = 'color')
                            target.dirty = Reflect.set(target.shadow, prop, value)
                            break

                        case 'radius':
                            target.dirty = Reflect.set(target, prop, value)

                            target.set({
                                rx: value / (target.scaleX || 1),
                                ry: value / (target.scaleY || 1)
                            })
                            break

                        case 'strokeColor':
                            target.dirty = Reflect.set(target, 'stroke', value)
                            break

                        case 'shapeFill':
                            target.dirty = Reflect.set(target, 'fill', value)
                            break

                        case 'strokeWidth':
                            target.dirty = Reflect.set(target, prop, value)
                            break

                        case 'lineType':
                            target.dirty = Reflect.set(target, prop, value)
                            target.setLineType()
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

                        case 'shadowColor':
                        case 'offsetX':
                        case 'offsetY':
                        case 'blur':
                            target.shadow || (target.shadow = shadow())
                            target[prop] = target.shadow[prop] || target.shadow.color
                            break

                        case 'radius':
                            target.radius || (target.radius = 0)
                            break

                        case 'strokeColor':
                            target[prop] = target.stroke
                            break

                        case 'shapeFill':
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
}
