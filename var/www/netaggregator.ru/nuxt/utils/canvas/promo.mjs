// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(createTool)

export async function createTool({ fabric })
{
    let lock = ['lockRotation','lockScalingX','lockScalingY','lockUniScaling','lockScalingFlip','lockSkewingX','lockSkewingY'].reduce((c, k) => ({ ...c, [k]: true }), {}),
        controlls = ['hasControls','hasBorders','hasRotatingPoint'].reduce((c, k) => ({ ...c, [k]: false }), {}),

        { nextTick } = await import(/* webpackChunkName: "callbacks" */ '../callbacks.mjs'),
        { preventMove, preventScale } = await import('./prevent.mjs'),
        { debounce } = await import('../common/debounce.mjs'),
        { loadFont } = await import('./fonts/loader.mjs'),

        node = typeof process !== 'undefined' && !process.browser,
        text = ' vk.com/netaggregator ',
        type = 'promo-link',
        fontFamily = 'Casper-Bold',
        perform = false,
        options = null,
        reset = null,
        update = {},

        resolve = () => node ? Promise.resolve() : loadFont({ fontFamily }),
        catcher = () => {}

    function emptyLines()
    {
        return {
            topline:    { o: { x: 0, y: 0 }, d: { x: 0, y: 0 } },
            rightline:  { o: { x: 0, y: 0 }, d: { x: 0, y: 0 } },
            bottomline: { o: { x: 0, y: 0 }, d: { x: 0, y: 0 } },
            leftline:   { o: { x: 0, y: 0 }, d: { x: 0, y: 0 } }
        }
    }

    function preventSelection({ target })
    {
        if (target.type !== 'activeSelection') return

        if (target._objects.some(o => /widget/.test(o.type))) {
            target.on('scaling', preventScale)
            target.on('moving', preventMove)
        } else {
            target.off('scaling', preventScale)
            target.off('moving', preventMove)
        }
    }

    Array.prototype.isProxy = function() { return false }

    fabric.request = () => {}

    fabric.PromoLink = fabric.util.createClass(fabric.Text/*box*/, {
        type,
        text,

        track: { left: 0, top: 0 },
        editable: false,

        /*text*/backgroundColor: 'rgba(255,255,255,.6)',
        fill: '#000000',

        textAlign: 'center',
        originX: 'center',
        originY: 'center',

        charSpacing: 1.1,
        lineHeight: 1,
        fontSize: 30,
        fontFamily,

        width: 310,

        ...controlls,
        ...lock,

        initialize(options)
        {
            this.on('moving', preventMove)
            this.on('added', () => {
                preventMove.call(this)

                this.initDimensions()
                this.setCoords()
            })

            this.callSuper('initialize', text, options)
        },
    })

    fabric.PromoLink.prototype.toObject = (function(/* toObject */) {
        return function(/* include = [] */) {
            options = { type, left: this.left, top: this.top }

            return options
        }
    })(fabric.PromoLink.prototype.toObject)

    fabric.PromoLink.fromObject = function(options, callback) {
        nextTick(async () => {
            try {

                await resolve()

            } catch (e) {
                catcher(e)
            }

            callback(new fabric.PromoLink(options))
        })
    }

    fabric.PromoLink.create = function({ canvas: c }, force) {
        return new Promise(_resolve => {
            perform = true

            if (force || !c.promo) {
                return nextTick(async () => {
                    const z = c.getZoom()

                    try {

                        await resolve()

                    } catch (e) {
                        catcher(e)
                    }

                    _resolve(new fabric.PromoLink({
                        left: c.width / 2 / z,
                        top: c.height / 2 / z
                    }))
                })
            }

            _resolve(c.promo)
        })
    }

    fabric.PromoLink.async = true

    fabric.util.coverDetect = function({ width: w, height: h }) {
        return Math.round(w) === 1590 && Math.round(h) === 530
    }

    fabric.Canvas.prototype.initialize = (function(initialize) {
        return function(el, options) {
            initialize.call(this, el, options)

            this.on('selection:created', preventSelection)
            this.on('selection:updated', preventSelection)

            if (fabric.RenderManager) {
                fabric.RenderManager.init(this)
            }
            if (fabric.StateManager) {
                fabric.StateManager.init(this, 90, () => {
                    this.trigger('drawingtool:history')
                })
            }
            if (fabric.Merger) {
                fabric.Merger.init(this)
            }
        }
    })(fabric.Canvas.prototype.initialize)

    fabric.Canvas.prototype.reload = (function(initialize) {
        return function(el, options) {
            initialize.call(this, el, options)

            if (!node) {
                this.manager.clearStack()
                this.render.stop()
            }

            return true
        }
    })(fabric.Canvas.prototype.initialize)

    fabric.Object.prototype._getImageLines = (function(_getImageLines) {
        return function(oCoords) {
            try {

                if (oCoords || (oCoords = this.calcCoords())) {
                    return _getImageLines.call(this, oCoords)
                }

            } catch (e) {
            }

            return emptyLines()
        }
    })(fabric.Object.prototype._getImageLines)

    fabric.util.object.extend(fabric.Canvas.prototype, {
        stackManagerStop: false,
        promo: false,

        active: [],

        forcePromo({ caller, method } = update)
        {
            this.onPromo(true, () => {
                if (caller && method in caller) {
                    caller[method](this._objects)
                    update.caller = caller
                    update.method = method
                }
            })
        },

        onPromo: debounce(function(force = false, callback)
        {
            const proxy = this._objects.isProxy(),
                canvas = this

            return (perform || proxy ? Promise.reject('throttle') : Promise.resolve())
                .then(fabric.PromoLink.create.bind(fabric.PromoLink, { canvas }, force))
                .then(promo => {
                    canvas.stackManagerStop = true

                    if (force) {
                        canvas.promo = false
                        canvas._objects.forEach((o, i) => {
                            if (o.type === type) {
                                canvas._objects.splice(i, 1)
                            }
                        })
                    }

                    canvas.insetPromo(promo)

                    if (typeof callback === 'function') {
                        callback()
                    }

                    canvas.proxifyObjects()
                })
                .catch(() => {
                    this.checkPromo()
                })
                .finally(() => {
                    canvas.stackManagerStop = false
                    perform = false
                })
        }, 0),

        adjustPromo()
        {
            const dump = []

            for (let i = this._objects.length - 1; i > -1; --i) {
                if (this._objects[i].type === type) {
                    dump.push(this._objects.splice(i, 1)[0])
                }
            }

            if (dump.length) {
                this._objects.push(dump[0])
            }
        },

        checkPromo()
        {
            const idx = this._objects.indexOf(this.promo),
                count = this._objects.length - 1

            if (this.promo && idx < count) {
                this.insetPromo(this.promo)
            }
        },

        insetPromo(promo)
        {
            if (options) {
                promo.set({ ...options, canvas: this })
            }

            this.promo = promo

            if (!this._objects.includes(promo)) {
                this.insertTo(promo)
            }
            if ((this._objects[this._objects.length - 1] || {}).type !== type) {
                this.promo.bringToFront()
            }

            fabric.request()
        },

        cleanPromo()
        {
            if (this._objects.findIndex(o => o.type === type) < 0) return

            for (let i = this._objects.length - 1; i > -1; --i) {
                if (this._objects[i].type === type) {
                    this._objects.splice(i, 1)
                }
            }
        },

        proxifyObjects()
        {
            let originalTarget, canvas = this, objects = []

            for (const item of [].concat(this._objects.originalTarget || this._objects)) {
                objects.push(item)
            }

            originalTarget = objects.slice()

            reset && reset()

            /**
            * @see https://www.digitalocean.com/community/tutorials/js-proxy-traps
            */
            const { proxy, revoke } = Proxy.revocable(objects, {
                get(t, prop)
                {
                    if (canvas.stackManagerStop || prop === 'findIndex' || typeof t[prop] !== 'function') return t[prop]

                    return prop === 'isProxy'
                        ? function(force) { return !force }
                        : function() {
                            const ret = Array.prototype[prop].apply(t, arguments)

                            if (canvas.promo && (t[t.length - 1] || {}).type !== type) {
                                canvas.stackManagerStop = true
                                canvas.promo.bringToFront()
                                canvas.stackManagerStop = false
                            }

                            return ret
                        }
                }
            })

            proxy.originalTarget = originalTarget
            reset = revoke

            this.set('_object', proxy)
        },

        /* fixDevicePixelRatio(obj)
        {
            console.log(`height: ${obj.height}, width: ${obj.width}, scaleX: ${obj.scaleX}, scaleY: ${obj.scaleY}`)

            obj.set({
                scaleX: obj.scaleX * fabric.devicePixelRatio,
                scaleY: obj.scaleY * fabric.devicePixelRatio,
                height: obj.height * fabric.devicePixelRatio,
                width:  obj.width  * fabric.devicePixelRatio
            })

            console.log(`height: ${obj.height}, width: ${obj.width}, scaleX: ${obj.scaleX}, scaleY: ${obj.scaleY}`)
        }, */

        insertTo(obj)
        {
            // this.fixDevicePixelRatio(obj)
            let idx = this._objects.length - 1

            if (this.promo && idx > -1) {
                let isset = this._objects[idx].type === type

                if (obj.type === type) {
                    if (isset) return

                } else if (isset) {
                    this.insertAt(obj, -1)
                    return
                }
            }

            this.add(obj)

            this.adjustPromo()

            return true
        },

        swap(oldIdx, newIdx)
        {
            const last = this._objects.length - 1,
                obj = this._objects[oldIdx],

                isAffected = oldIdx === last || newIdx === last,
                isPromo = !!this.promo

            this.stackManagerStop = isPromo && (obj.type === type || isAffected)

            obj.moveTo(newIdx)

            this.stackManagerStop = false
        },

        coverDetect()
        {
            const { width, height, viewportTransform: v } = this

            return fabric.util.coverDetect({
                height: height / v[0],
                width: width / v[0]
            })
        },

        adjustObjects()
        {
            this.forEachObject(o => {
                if (options && o.type === type) o.set(options)

                if ('initDimensions' in o) {
                    o.initDimensions()
                }

                o.setCoords()
            })

            return this
        },

        finalize: debounce(function(promo)
        {
            if (promo) {
                this.onPromo(false, this.adjustObjects.bind(this))
            } else {
                this.cleanPromo()
                this.adjustObjects()
            }

        }, 0)
    })

    return fabric
}
