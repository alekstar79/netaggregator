// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(setCornersControls)

export async function setCornersControls({ fabric })
{
    const /** @see https://github.com/pixolith/fabricjs-customise-controls-extension/tree/next */

        { blank } = await import(/* webpackChunkName: "corners-assets" */ '../../assets/data/canvas-icons.mjs'),

        cursorOffset = {
            mt: 0, // n-resize
            tr: 1, // ne-resize
            mr: 2, // e-resize
            br: 3, // se-resize
            mb: 4, // s-resize
            bl: 5, // sw-resize
            ml: 6, // w-resize
            tl: 7  // nw-resize
        },

        corners = ['bl','br','tl','tr','ml','mb','mr','mt'],
        cursor = 'resize',
        action = null,

        preventControls = {
            ...corners.reduce((set, c) => ({ ...set, [c]: { cursor, action } }), {}),
            mtr: { cursor: null, action }
        },

        preventIcons = {
            ...corners.reduce((set, c) => ({ ...set, [c]: { icon: blank } }), {}),
            mtr: { icon: blank },

            settings: {
                borderColor: '#0094dd',
                cornerBackgroundColor: '#0094dd',
                cornerShape: 'rect',
                cornerSize: 10
            }
        }

    function customiseCornerIcons(obj)
    {
        this.prevent && (obj = preventIcons)

        if ('settings' in obj) {
            this.useCustomIcons = true

            Object.keys(obj.settings).forEach(k => {
                this[k] = obj.settings[k]
            })
        }

        Object.keys(obj).filter(k => obj[k].icon).forEach(k => {
            const cornerConfig = {}

            cornerConfig.icon = obj[k].icon

            if (obj[k].settings !== undefined) {
                cornerConfig.settings = obj[k].settings
            }

            this.loadIcon(k, cornerConfig)
        })
    }

    function loadIcon(corner, { icon, settings })
    {
        const img = new Image()

        img.onerror = () => {}
        img.onload = () => {
            this[corner + 'Icon'] = img

            if (settings) {
                this[corner + 'Settings'] = settings
            }
            if (this.canvas) {
                this.canvas.renderAll()
            }
        }

        img.crossOrigin = 'anonymous'
        img.src = icon
    }

    function drawControls(ctx)
    {
        if (!this.hasControls) return this

        let wh = this._calculateCurrentDimensions(),
            width = wh.x,
            height = wh.y,
            scaleOffset = this.cornerSize,
            left = -(width + scaleOffset) / 2,
            top = -(height + scaleOffset) / 2,
            methodName

        if (!this.useCustomIcons) {
            ctx.lineWidth = 1
            ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1
            ctx.strokeStyle = ctx.fillStyle = this.cornerColor

            if (!this.transparentCorners) {
                ctx.strokeStyle = this.cornerStrokeColor
            }

            methodName = this.transparentCorners ? 'stroke' : 'fill'
        } else {
            methodName = 'drawImage'
        }

        ctx.save()
        this._setLineDash(ctx, this.cornerDashArray, null)

        // top-left
        this._drawControl('tl', ctx, methodName,
            left,
            top,
            this.tlIcon,
            this.tlSettings
        )

        // top-right
        this._drawControl('tr', ctx, methodName,
            left + width,
            top,
            this.trIcon,
            this.trSettings
        )

        // bottom-left
        this._drawControl('bl', ctx, methodName,
            left,
            top + height,
            this.blIcon,
            this.blSettings
        )

        // bottom-right
        this._drawControl('br', ctx, methodName,
            left + width,
            top + height,
            this.brIcon,
            this.brSettings
        )

        if (!this.get('lockUniScaling')) {
            // middle-top
            this._drawControl('mt', ctx, methodName,
                left + width / 2,
                top,
                this.mtIcon,
                this.mtSettings
            )

            // middle-bottom
            this._drawControl('mb', ctx, methodName,
                left + width / 2,
                top + height,
                this.mbIcon,
                this.mbSettings
            )

            // middle-right
            this._drawControl('mr', ctx, methodName,
                left + width,
                top + height / 2,
                this.mrIcon,
                this.mrSettings
            )

            // middle-left
            this._drawControl('ml', ctx, methodName,
                left,
                top + height / 2,
                this.mlIcon,
                this.mlSettings
            )
        }

        // middle-top-rotate
        if (this.hasRotatingPoint) {
            this._drawControl('mtr', ctx, methodName,
                left + width / 2,
                top - this.rotatingPointOffset,
                this.mtrIcon,
                this.mtrSettings
            )
        }

        ctx.restore()

        return this
    }

    function _drawControl(control, ctx, methodName, left, top, icon, settings)
    {
        if (!this.isControlVisible(control)) return

        let size = this.cornerSize,
            cornerStroke = this.cornerStrokeColor || 'transparent',
            cornerBG = this.cornerBackgroundColor || 'black',
            cornerShape = this.cornerShape || 'rect',
            cornerPadding = typeof this.cornerPadding === 'number'
                ? this.cornerPadding
                : 10

        if (settings) {
            if (settings.cornerSize) {
                left = left + size / 2 - settings.cornerSize / 2
                top = top + size / 2 - settings.cornerSize / 2
                size = settings.cornerSize
            }

            cornerShape = settings.cornerShape || cornerShape
            cornerBG = settings.cornerBackgroundColor || cornerBG
            cornerStroke = settings.cornerStrokeColor || cornerStroke
            cornerPadding = typeof settings.cornerPadding === 'number'
                ? settings.cornerPadding
                : cornerPadding
        }
        if (this.useCustomIcons) {
            if (cornerShape) {
                ctx.strokeStyle = cornerStroke
                ctx.fillStyle = cornerBG
                ctx.globalAlpha = 1
                ctx.lineWidth = 1

                switch (cornerShape) {
                    case 'rect':
                        ctx.fillRect(left, top, size, size)

                        if (cornerStroke) {
                            ctx.strokeRect(left, top, size, size)
                        }

                        break
                    case 'circle':
                        ctx.beginPath()
                        ctx.arc(left + size / 2, top + size / 2, size / 2, 0, 2 * Math.PI)
                        ctx.fill()

                        if (cornerStroke) {
                            ctx.stroke()
                        }

                        ctx.closePath()
                }
                if (icon !== undefined) {
                    ctx[methodName](
                        icon,
                        left + cornerPadding / 2,
                        top + cornerPadding / 2,
                        size - cornerPadding,
                        size - cornerPadding
                    )
                }
            } else if (icon !== undefined) {
                ctx[methodName](icon, left, top, size, size)
            }
        } else {
            if (typeof G_vmlCanvasManager !== 'undefined' || this.transparentCorners) {
                ctx.clearRect(left, top, size, size)
            }

            ctx[methodName + 'Rect'](left, top, size, size)

            if (!this.transparentCorners && cornerStroke) {
                ctx.strokeRect(left, top, size, size)
            }
        }
    }

    function customiseControls(obj)
    {
        this.prevent && (obj = preventControls)

        for (const setting in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, setting)) {
                if (obj[setting].action !== undefined) {
                    this.overwriteActions = true
                    this.setCustomAction(setting, obj[setting].action)
                }
                if (obj[setting].cursor !== undefined) {
                    this.fixedCursors = true
                    this.setCustomCursor(setting, obj[setting].cursor)
                }
            }
        }
    }

    function setCustomAction(corner, action)
    {
        this[corner + 'Action'] = action
    }

    function setCustomCursor(corner, cursorUrl)
    {
        this[corner + 'cursorIcon'] = cursorUrl
    }

    function getAction(corner, e, object)
    {
        object || (object = this)

        const key = e[this.altActionKey]

        switch (corner) {
            case 'mtr':
                return object[corner + 'Action'] || 'rotate'
            case 'ml':
            case 'mr':
                return key ? 'skewY' : object[corner + 'Action'] || 'scaleX'
            case 'mt':
            case 'mb':
                return key ? 'skewX' : object[corner + 'Action'] || 'scaleY'

            default:
                return object[corner + 'Action'] || 'scale'
        }
    }

    function _getActionFromCorner(alreadySelected, corner, e, target)
    {
        if (!corner || !alreadySelected) return 'drag'

        if (target.overwriteActions) {
            return getAction.call(this, corner, e, target)
        } else if (this.overwriteActions) {
            return getAction.call(this, corner, e)
        }

        switch (corner) {
            case 'mtr':
                return 'rotate'
            case 'ml':
            case 'mr':
                return e[this.altActionKey] ? 'skewY' : 'scaleX'
            case 'mt':
            case 'mb':
                return e[this.altActionKey] ? 'skewX' : 'scaleY'

            default:
                return 'scale'
        }
    }

    function _setupCurrentTransform(e, target, alreadySelected)
    {
        if (!target) return

        let pointer = this.getPointer(e, false),
            corner = target._findTargetCorner(this.getPointer(e, true)),
            action = this._getActionFromCorner(alreadySelected, corner, e, target),
            origin = this._getOriginFromCorner(target, corner)

        if (typeof action === 'function') {
            action.call(this, e, target)
            /*
            * as of fabric 1.7.11 object cache will try to slice the action
            * to check for scale so we need to convert this to a string
            */
            action = 'void'
        }

        this._currentTransform = {
            target,
            action,
            corner,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            skewX: target.skewX,
            skewY: target.skewY,
            offsetX: pointer.x - target.left,
            offsetY: pointer.y - target.top,
            originX: origin.x,
            originY: origin.y,
            ex: pointer.x,
            ey: pointer.y,
            lastX: pointer.x,
            lastY: pointer.y,
            left: target.left,
            top: target.top,
            theta: fabric.util.degreesToRadians(target.angle),
            width: target.width * target.scaleX,
            mouseXSign: 1,
            mouseYSign: 1,
            shiftKey: e.shiftKey,
            altKey: e[this.centeredKey]
        }

        this._currentTransform.original = {
            left: target.left,
            top: target.top,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            skewX: target.skewX,
            skewY: target.skewY,
            originX: origin.x,
            originY: origin.y
        }

        if (action === 'remove') {
            this._removeAction(e, target)
        }
        if (action === 'moveUp') {
            this._moveLayerUpAction(e, target)
        }
        if (action === 'moveDown') {
            this._moveLayerDownAction(e, target)
        }
        if (typeof action === 'object') {
            if (Object.keys(action)[0] === 'rotateByDegrees') {
                this._rotateByDegrees(e, target, action.rotateByDegrees)
            }
        }

        this._resetCurrentTransform()
    }

    function _removeAction(e, target)
    {
        const objects = this.getActiveObjects()

        this.discardActiveObject()

        if (objects && objects.length) {
            objects.forEach(this.remove.bind(this))
        } else {
            this.remove(target)
        }
    }

    function _moveLayerUpAction(e, target)
    {
        if (target.canvas.promo) {
            const idx = target.canvas._objects.indexOf(target)

            if (target.canvas._objects.length - 1 <= idx + 1) {
                return
            }
        }

        target.bringForward(true)
    }

    function _moveLayerDownAction(e, target)
    {
        if (target.type === 'promo-link') return

        target.sendBackwards(true)
    }

    function toCenterNeeds({ originX, originY, centeredRotation })
    {
        return (originX !== 'center' || originY !== 'center') && centeredRotation
    }

    function _rotateByDegrees(e, target, value)
    {
        let angle = parseInt(target.get('angle')) + value,
            needsOriginRestore = false

        if (toCenterNeeds(target)) {
            target._setOriginToCenter()
            needsOriginRestore = true
        }

        angle = angle > 360 ? angle - 360 : angle

        const active = this.getActiveObjects()

        if (active && active !== 'undefined') {
            active.forEach(obj => { obj.set({ angle }).setCoords() })
        } else {
            target.set({ angle }).setCoords()
        }
        if (needsOriginRestore) {
            target._resetOrigin()
        }

        this.renderAll()
    }

    function cursorIsset(corner, obj)
    {
        return obj.fixedCursors && obj[corner + 'cursorIcon']
    }

    function getCornerCursor(corner, target, e)
    {
        let iconUrlPattern = /\.(?:jpe?g|png|gif|svg)$/,
            cursor = null

        if (this.actionIsDisabled(corner, target, e)) {
            return this.notAllowedCursor
        }
        if (cursorIsset(corner, target)) {
            cursor = target
        } else if (cursorIsset(corner, this)) {
            cursor = this
        }
        if (cursor) {
            if (cursor[corner + 'cursorIcon'].match(iconUrlPattern)) {
                this.setCursor('url(' + cursor[corner + 'cursorIcon'] + '), auto')
            } else if (cursor[corner + 'cursorIcon'] === 'resize') {
                this.setCursor(this._getRotatedCornerCursor(corner, target, e))
            } else {
                this.setCursor(cursor[corner + 'cursorIcon'])
            }
        } else if (corner in cursorOffset) {
            this.setCursor(this._getRotatedCornerCursor(corner, target, e))
        } else if (corner === 'mtr' && target.hasRotatingPoint) {
            this.setCursor(this.rotationCursor)
        } else {
            this.setCursor(this.defaultCursor)
        }

        return false
    }

    const icons = {
        /**
         * When true, image icons are loaded via the drawImage method
         * @type {Boolean}
         */
        useCustomIcons: false,
        /**
         * Sets a background-color for drawImage operations with transparency
         * @type {String}
         */
        cornerBackgroundColor: 'transparent',
        /**
         * Sets the shape of the background for drawImage operations with transparency
         * @type {String}
         */
        cornerShape: '',
        /**
         * Inner Padding between Shape Background and drawn Image
         * @type {Number}
         */
        cornerPadding: 0,
        /**
         * Set a custom corner icon
         * @param {Object} obj settings and icon url
         * @param {Function} callback
         */
        customiseCornerIcons,
        /**
         * Loads the icon image as an image src
         * @param {String} corner to load an icon
         * @param {Object} config as object containing icon url and corner specific settings
         * @param {Function} callback
         */
        loadIcon,
        /**
         * Draws corners of an object's bounding box
         * Requires public properties: width, height
         * Requires public options: cornerSize, padding
         * @param {CanvasRenderingContext2D} ctx Context to draw on
         * @return {fabric.Object} thisArg
         * @chainable
         */
        drawControls,
        /**
         * Draw controls either with background-shape and color (transparency)
         * or plain image (modified core method)
         */
        _drawControl
    }

    // noinspection JSUnusedGlobalSymbols
    const actions = {
        /**
         * When true, actions can be overwritten
         * @type {Boolean}
         */
        overwriteActions: false,
        /**
         * When true, cursors are fixed
         * @type {Boolean}
         */
        fixedCursors: false,
        /**
         * Setter for actions and cursors
         * @param {Object} obj containing corner action and cursor url/type
         */
        customiseControls,
        /**
         * Loads the icon image as an image src
         * @param {String} corner to load an icon
         * @param {String} action as string
         */
        setCustomAction,
        /**
         * Loads the icon image as an image src
         * @param {String} corner to load an icon
         * @param {String} cursor url
         */
        setCustomCursor,
        /**
         * @param {Boolean} alreadySelected
         * @param {String} corner
         * @param {Event} e Event object
         */
        _getActionFromCorner,
        /**
         * @param {Event} e Event object
         * @param {fabric.Object} target
         * @param {Boolean} alreadySelected
         */
        _setupCurrentTransform,
        /**
         * Custom remove object action
         * @param {Event} e Event object
         * @param {fabric.Object} target
         */
        _removeAction,
        /**
         * Custom move up object action
         * @param {Event} e Event object
         * @param {fabric.Object} target
         */
        _moveLayerUpAction,
        /**
         * Custom move down object action
         * @param {Event} e Event object
         * @param {fabric.Object} target
         */
        _moveLayerDownAction,
        /**
         * Custom move down object action
         * @param {Event} e Event object
         * @param {fabric.Object} target
         * @param {Number} value of rotation
         */
        _rotateByDegrees,
        /**
         * Sets either the standard behaviour cursors or if fixedCursors is true,
         * tries to set a custom cursor either by using an icon or a build-in cursor.
         * Cursor icon extensions are matched with a regular expression
         */
        getCornerCursor
    }

    fabric.util.object.extend(fabric.Canvas.prototype, actions)
    fabric.util.object.extend(fabric.Object.prototype, actions)
    fabric.util.object.extend(fabric.Object.prototype, icons)

    return fabric
}
