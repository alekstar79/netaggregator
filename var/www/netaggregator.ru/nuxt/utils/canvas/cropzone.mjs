// const CORNER = { TOP_LEFT: 'tl', TOP_RIGHT: 'tr', MIDDLE_TOP: 'mt', MIDDLE_LEFT: 'ml', MIDDLE_RIGHT: 'mr', MIDDLE_BOTTOM: 'mb', BOTTOM_LEFT: 'bl', BOTTOM_RIGHT: 'br' }

export const cropzone = {
    type: 'cropzone',

    isValid()
    {
        return this.left >= 0 && this.top >= 0 && this.width > 0 && this.height > 0
    },
    _render(ctx)
    {
        this.callSuper('_render', ctx)

        const dashLine = 7,
            flipX = this.flipX ? -1 : 1,
            flipY = this.flipY ? -1 : 1,

            scaleX = flipX / this.scaleX,
            scaleY = flipY / this.scaleY

        // Set original scale
        ctx.scale(scaleX, scaleY)

        // Render outer rect
        // this._fillOuterRect(ctx, 'rgba(0,0,0,.55)')

        this._fillInnerRect(ctx, 'rgb(0,0,0)', {
            lineDashWidth: dashLine
        })

        this._fillInnerRect(ctx, 'rgb(255,255,255)', {
            lineDashOffset: dashLine,
            lineDashWidth: dashLine
        })

        this._strokeBorder(ctx, 'rgb(0,0,0)', {
            lineDashWidth: dashLine
        })

        this._strokeBorder(ctx, 'rgb(255,255,255)', {
            lineDashOffset: dashLine,
            lineDashWidth: dashLine
        })

        // Reset scale
        ctx.scale(1 / scaleX, 1 / scaleY)
    },
    _getCoordinates(ctx)
    {
        const width = this.getScaledWidth(),
            height = this.getScaledHeight(),

            halfWidth = width / 2,
            halfHeight = height / 2,

            left = this.left,
            top = this.top,

            canvas = ctx.canvas

        return {
            x: [
                -(halfWidth + left),                        // x0
                -(halfWidth),                               // x1
                halfWidth,                                  // x2
                halfWidth + (canvas.width - left - width)   // x3
            ].map(Math.ceil),
            y: [
                -(halfHeight + top),                        // y0
                -(halfHeight),                              // y1
                halfHeight,                                 // y2
                halfHeight + (canvas.height - top - height) // y3
            ].map(Math.ceil)
        }
    },
    _calculateInnerPosition(outer, size)
    {
        const position = []

        position[0] = outer[1]
        position[1] = outer[1] + size
        position[2] = outer[1] + (size * 2)
        position[3] = outer[2]

        return position
    },
    _fillOuterRect(ctx, fillStyle)
    {
        const { x, y } = this._getCoordinates(ctx)

        ctx.save()
        ctx.fillStyle = fillStyle
        ctx.beginPath()

        // Outer rectangle
        ctx.moveTo(x[0] - 1, y[0] - 1)
        ctx.lineTo(x[3] + 1, y[0] - 1)
        ctx.lineTo(x[3] + 1, y[3] + 1)
        ctx.lineTo(x[0] - 1, y[3] + 1)
        ctx.lineTo(x[0] - 1, y[0] - 1)
        ctx.closePath()

        // Inner rectangle
        ctx.moveTo(x[1], y[1])
        ctx.lineTo(x[1], y[2])
        ctx.lineTo(x[2], y[2])
        ctx.lineTo(x[2], y[1])
        ctx.lineTo(x[1], y[1])
        ctx.closePath()

        ctx.fill()
        ctx.restore()
    },
    _setDashedLineStyle(ctx, strokeStyle, lineDashWidth, lineDashOffset, lineWidth)
    {
        if (ctx.setLineDash) {
            ctx.setLineDash([lineDashWidth, lineDashWidth])
        }
        if (lineDashOffset) {
            ctx.lineDashOffset = lineDashOffset
        }

        ctx.lineWidth = lineWidth || .5
        ctx.strokeStyle = strokeStyle
    },
    _fillInnerRect(ctx, strokeStyle, { lineDashWidth, lineDashOffset, lineWidth })
    {
        const { x: outerX, y: outerY } = this._getCoordinates(ctx),
            x = this._calculateInnerPosition(outerX, (outerX[2] - outerX[1]) / 3),
            y = this._calculateInnerPosition(outerY, (outerY[2] - outerY[1]) / 3)

        ctx.save()

        this._setDashedLineStyle(ctx, strokeStyle, lineDashWidth, lineDashOffset, lineWidth)

        ctx.beginPath()
        ctx.moveTo(x[0], y[1])
        ctx.lineTo(x[3], y[1])

        ctx.moveTo(x[0], y[2])
        ctx.lineTo(x[3], y[2])

        ctx.moveTo(x[1], y[0])
        ctx.lineTo(x[1], y[3])

        ctx.moveTo(x[2], y[0])
        ctx.lineTo(x[2], y[3])

        ctx.stroke()
        ctx.closePath()
        ctx.restore()
    },
    _strokeBorder(ctx, strokeStyle, { lineDashWidth, lineDashOffset, lineWidth })
    {
        const halfWidth = this.getScaledWidth() / 2,
            halfHeight = this.getScaledHeight() / 2

        ctx.save()

        this._setDashedLineStyle(ctx, strokeStyle, lineDashWidth, lineDashOffset, lineWidth)

        ctx.beginPath()
        ctx.moveTo(-halfWidth, -halfHeight)
        ctx.lineTo(halfWidth, -halfHeight)
        ctx.lineTo(halfWidth, halfHeight)
        ctx.lineTo(-halfWidth, halfHeight)
        ctx.lineTo(-halfWidth, -halfHeight)
        ctx.stroke()

        ctx.restore()
    },
    _onMoving()
    {
        const top = this.top, left = this.left,

            height = this.getScaledHeight(),
            width = this.getScaledWidth(),

            maxTop = this.canvas.getHeight() - height,
            maxLeft = this.canvas.getWidth() - width,

            { min, max } = Math

        this.left = max(0, min(left, maxLeft))
        this.top = max(0, min(top, maxTop))
    }
    /* _onScaling({ e })
    {
        const pointer = this.canvas.getPointer(e),
            settings = this._calcScalingSizeFromPointer(pointer)

        // On scaling cropzone, change real width and height
        // and fix scale factor to 1
        this.scale(1).set(settings)
    },
    _calcScalingSizeFromPointer(pointer)
    {
        const pointerX = pointer.x,
            pointerY = pointer.y,

            tlScalingSize = this._calcTopLeftScalingSizeFromPointer(pointerX, pointerY),
            brScalingSize = this._calcBottomRightScalingSizeFromPointer(pointerX, pointerY)

        return this._makeScalingSettings(tlScalingSize, brScalingSize)
    },
    _calcTopLeftScalingSizeFromPointer(x, y)
    {
        const bottom = this.getScaledHeight() + this.top,
            right = this.getScaledWidth() + this.left,

            { min, max } = Math,

            top = max(0, min(y, bottom - 1)), // 0 <= top <= (bottom - 1)
            left = max(0, min(x, right - 1))  // 0 <= left <= (right - 1)

        return {
            height: bottom - top,
            width: right - left,
            left,
            top
        }
    },
    _calcBottomRightScalingSizeFromPointer(x, y)
    {
        const { width: maxX, height: maxY } = this.canvas,
            { left, top } = this,
            { min, max } = Math

        return {
            width: max(left + 1, min(x, maxX)) - left, // (width = x - left), (left + 1 <= x <= maxX)
            height: max(top + 1, min(y, maxY)) - top   // (height = y - top), (top + 1 <= y <= maxY)
        }
    },
    _makeScalingSettings(tl, br)
    {
        const tlWidth = tl.width,
            tlHeight = tl.height,
            brHeight = br.height,
            brWidth = br.width,
            tlLeft = tl.left,
            tlTop = tl.top

        let settings

        switch (this.__corner) {
            case CORNER.TOP_LEFT:
                settings = tl
                break

            case CORNER.TOP_RIGHT:
                settings = {
                    width: brWidth,
                    height: tlHeight,
                    top: tlTop
                }
                break

            case CORNER.BOTTOM_LEFT:
                settings = {
                    width: tlWidth,
                    height: brHeight,
                    left: tlLeft
                }
                break

            case CORNER.BOTTOM_RIGHT:
                settings = br
                break

            case CORNER.MIDDLE_LEFT:
                settings = { width: tlWidth, left: tlLeft }
                break

            case CORNER.MIDDLE_TOP:
                settings = { height: tlHeight, top: tlTop }
                break

            case CORNER.MIDDLE_RIGHT:
                settings = { width: brWidth }
                break

            case CORNER.MIDDLE_BOTTOM:
                settings = { height: brHeight }
        }

        return settings
    } */
}
