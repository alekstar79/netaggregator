// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    const browser = typeof process === 'undefined' || process.browser,

        { debounce } = await import('../common/debounce.mjs'),
        { setControls } = await import('./index.mjs')

    fabric.Merge = fabric.util.createClass(fabric.Group, {
        type: 'merge',

        composite: 'source-over',

        // source-over
        // source-in
        // source-out
        // source-atop
        // destination-over
        // destination-in
        // destination-out
        // destination-atop
        // lighter
        // copy
        // xor
        // multiply
        // screen
        // overlay
        // darken
        // lighten
        // color-dodge
        // color-burn
        // hard-light
        // soft-light
        // difference
        // exclusion
        // hue
        // saturation
        // color
        // luminosity

        initialize(objects, options)
        {
            this.callSuper('initialize', objects, options)

            browser && setControls(this, {
                tr: {
                    cursor: 'pointer',
                    action: () => {
                        this.stopFix = true
                        this.canvas.trigger('merge:settings', this)
                        setTimeout(() => {
                            this.stopFix = false
                        }, 100)
                    }
                }
            })
        },

        ungroup()
        {
            this.canvas.merger.restore(this)
        },

        setComposite(composite)
        {
            this.globalCompositeOperation = composite

            this._objects.forEach(o => {
                o.globalCompositeOperation = composite
            })
        },

        applyCompositeOperation(value)
        {
            if (this._objects[0].setComposite) {
                this._objects[0].setComposite('source-over')
            } else {
                this._objects[0].globalCompositeOperation = 'source-over'
            }

            this._objects.slice(1).forEach(o => {
                if (o.setComposite) {
                    o.setComposite(value)
                } else {
                    o.globalCompositeOperation = value
                }
            })
        },

        toObject(include = [])
        {
            return this.callSuper('toObject', ['composite'].concat(include))
        }
    })

    fabric.Merge.prototype.onChangeFix = debounce(function() {
        if (this.stopFix || !this.canvas) {
            this.stopFix = false
            return
        }

        this.canvas.trigger('programmatic')

    }, 0)

    fabric.Merge.async = true

    fabric.Merge.fromObject = function({ objects, ...options }, callback) {
        options = fabric.util.object.clone(options, true)

        fabric.util.enlivenObjects(objects, function(enlivened) {
            callback(new fabric.Merge(enlivened, options))
        })
    }

    /* fabric.Merge.fromGroup = function({ _objects, ...options }, callback) {
        callback(new fabric.Merge(_objects, options, true))
    }

    fabric.Merge.fromObject = function(object, callback) {
        queueMicrotask(() => {
            fabric.Group.fromObject(object, group => {
                fabric.Merge.fromGroup(group, callback)
            })
        })
    } */

    fabric.Merge = new Proxy(fabric.Merge, {
        construct(T, args)
        {
            const target = new T(...args)

            const proxy = new Proxy(target, {
                set(target, prop, value) {
                    switch (prop) {
                        case 'composite':
                            target.dirty = Reflect.set(target, prop, value)
                            target.applyCompositeOperation(value)
                            break

                        default:
                            Reflect.set(target, prop, value)
                    }

                    if (prop === 'composite') {
                        target.onChangeFix()
                    }
                    if (target.dirty) {
                        fabric.request()
                    }

                    return true
                }
            })

            proxy.originalTarget = target

            return proxy
        }
    })

    fabric.Merger = (function () {
        function Merger(canvas)
        {
            this.canvas = canvas
        }

        Merger.prototype.restore = function(merge) {
            const objects = merge._objects.slice()

            this.canvas.manager.locked = true

            merge.setComposite('source-over')
            objects.forEach(merge.removeWithUpdate.bind(merge))
            objects.forEach(o => this.canvas.insertTo(o))

            this.canvas.remove(merge)
            this.canvas.manager.locked = false

            this.canvas.trigger('programmatic')
        }

        Merger.prototype.make = function() {
            let group, active = this.canvas.getActiveObjects()

            if (active.length > 1) {
                group = new fabric.Merge()

                this.canvas.manager.locked = true
                this.canvas.discardActiveObject()

                active.forEach(group.addWithUpdate.bind(group))

                this.canvas.remove(...active)
                this.canvas.insertTo(group)

                this.canvas.setActiveObject(group)
                this.canvas.manager.locked = false

                this.canvas.trigger('programmatic')
            }
        }

        Merger.init = function(canvas) {
            canvas.merger = new Merger(canvas)
        }

        return Merger

    })()

    return fabric
}
