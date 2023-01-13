import { color as icon } from '../../assets/data/canvas-icons.mjs'
import { debounce } from '../common/debounce.mjs'
import { setControls } from './index.mjs'

export function svgAddFunctionality(fabric)
{
    const shadow = () => new fabric.Shadow({ color: 'rgba(0,0,0,1)', offsetX: 0, offsetY: 0, blur: 0 }),
        props = ['pathFill','shadowColor','shadow','offsetX','offsetY','blur'],
        marks = props.reduce((set, p) => ({ ...set, [p]: true }), {}),

        browser = typeof process === 'undefined' || process.browser

    fabric.SvgShape = fabric.util.createClass(fabric.Group, {
        type: 'svg-shape',

        setComposite(composite)
        {
            this.globalCompositeOperation = composite

            this._objects.forEach(o => {
                o.globalCompositeOperation = composite
            })
        }
    })

    fabric.SvgShape.prototype.initialize = (function(initialize) {
        return function(...args) {
            initialize.call(this, ...args)

            // this.on('removed', this.requestRender)
            // this.on('added', this.requestRender)

            browser && setControls(this, {
                tr: {
                    cursor: 'pointer',
                    action: () => {
                        this.stopFix = true
                        this.canvas.trigger('path:colorize', this)
                        setTimeout(() => {
                            this.stopFix = false
                        }, 100)
                    }
                }

            }, { tr: { icon } })
        }

    })(fabric.SvgShape.prototype.initialize)

    fabric.SvgShape.prototype.toObject = (function(toObject) {
        return function(include = []) {
            return toObject.call(this, props.concat(include))
        }

    })(fabric.SvgShape.prototype.toObject)

    /* fabric.SvgShape.prototype.requestRender = (function(renderAll) {
        return function() {
            renderAll.call(this.canvas)
        }

    })(fabric.Canvas.prototype.renderAll) */

    fabric.SvgShape.prototype.onChangeFix = debounce(function() {
        if (this.stopFix || !this.canvas) {
            this.stopFix = false
            return
        }

        this.canvas.trigger('programmatic')

    }, 0)

    fabric.SvgShape.fromObject = function({ objects, path, ...options }, callback) {
        options = fabric.util.object.clone(options, true)

        switch (true) {
            case typeof objects !== 'undefined':
                fabric.util.enlivenObjects(objects, enlivened => {
                    callback(new fabric.SvgShape(enlivened, options))
                })
                break

            case typeof path !== 'undefined':
                callback(new fabric.SvgShape(
                    [new fabric.Path(path, options)],
                    options
                ))
        }
    }

    fabric.SvgShape = new Proxy(fabric.SvgShape, {
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

                        case 'pathFill':
                            target.dirty = Reflect.set(target, 'fill', value)
                            target._objects.forEach(o => {
                                o.set('fill', value)
                            })
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

                        case 'pathFill':
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
