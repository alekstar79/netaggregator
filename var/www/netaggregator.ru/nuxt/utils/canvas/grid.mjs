// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(extendFunctionality)

/**
* Based on Add Boundaries/Snap #882
* @date September 2013
* @see https://codepen.io/shkaper/pen/vQGvaM
* @see https://github.com/fabricjs/fabric.js/issues/882
* @see https://jsfiddle.net/u1qLentk
*/
export async function extendFunctionality({ fabric })
{
    const { nextFrame } = await import(/* webpackChunkName: "callbacks" */ '../callbacks.mjs'),
        opts = { selectable: false, evented: false, grid: true, excludeFromExport: true }

    function build(length, size, step, dir)
    {
        const strokeDashArray = [9, 9],
            lines = []

        for (let offset, set, i = 0; i < length; ++i) {
            offset = i * step
            set = k => dir === 'h' ? [k, offset, size, offset] : [offset, k, offset, size]

            lines.push(
                new fabric.GridLine(set(0), { ...opts, strokeDashArray, stroke: '#000' }),
                new fabric.GridLine(set(9), { ...opts, strokeDashArray, stroke: '#fff' })
            )
        }

        return lines
    }

    function create(height, width, { x, y })
    {
        const cH = Math.ceil(height / y),
            cV = Math.ceil(width / x)

        return Promise.resolve(
            new fabric.Group([
                ...build(cV, height, x, 'v'),
                ...build(cH, width, y, 'h')
            ], opts)
        )
    }

    function changeCoords(target)
    {
        const { x: left, y: top } = target.getPointByOrigin('left', 'top')

        target.set({ originX: 'left', originY: 'top', left, top })
    }

    fabric.util.object.extend(fabric.Canvas.prototype, {
        showGrid: false,

        steps: { x: 100, y: 100 },
        grid: null,

        gridIsset()
        {
            return this.grid && this.steps.x && this.steps.y
        },
        setGrid(grid)
        {
            this.grid = grid

            if (this.showGrid) {
                this.setOverlayImage(this.grid, this.requestRenderAllBound, opts)
            }
        },
        createGrid({ x, y } = {})
        {
            x || (x = this.steps.x)
            y || (y = this.steps.y)

            this.steps = { x, y }

            const scale = this.getZoom()

            create(this.height / scale, this.width / scale, { x, y })
                .then(this.setGrid.bind(this))
        },
        toggleGrid()
        {
            if (!this.gridIsset()) return

            if (this.showGrid) {
                this.setOverlayImage(null, this.requestRenderAllBound)
                this.off('object:scaling', this.scalingObject)
                this.off('object:moving', this.movingObject)
                this.showGrid = false
            } else {
                this.setOverlayImage(this.grid, this.requestRenderAllBound, opts)
                this.on('object:scaling', this.scalingObject)
                this.on('object:moving', this.movingObject)
                this.showGrid = true
            }

            this.trigger('grid:toggle')
        },
        scalingObject(e)
        {
            nextFrame(this.snapToGridScaling.bind(this, e))
        },
        movingObject(e)
        {
            nextFrame(this.snapToGridMoving.bind(this, e))
        },
        snapToGridMoving({ target })
        {
            if (target.originX === 'center' || target.originY === 'center') {
                changeCoords(target)
            }

            return new Promise(() => {
                target.setCoords()

                const { x, y } = this.steps,

                    h = target.height * target.scaleY,
                    w = target.width * target.scaleX,

                    thresholdX = x * .3,
                    thresholdY = y * .3,

                    snap = { // Closest snapping points
                        top: Math.round(target.top / y) * y,
                        left: Math.round(target.left / x) * x,
                        bottom: Math.round((target.top + h) / y) * y,
                        right: Math.round((target.left + w) / x) * x
                    },

                    dist = { // Distance from snapping points
                        top: Math.abs(snap.top - target.top),
                        left: Math.abs(snap.left - target.left),
                        bottom: Math.abs(snap.bottom - target.top - h),
                        right: Math.abs(snap.right - target.left - w)
                    }

                if (dist.bottom < dist.top) {
                    if (dist.bottom > thresholdY) {
                        snap.top = target.top
                    } else {
                        snap.top = snap.bottom - h
                    }
                } else if (dist.top > thresholdY) {
                    snap.top = target.top
                }
                if (dist.right < dist.left) {
                    if (dist.right > thresholdX) {
                        snap.left = target.left
                    } else {
                        snap.left = snap.right - w
                    }
                } else if (dist.left > thresholdX) {
                    snap.left = target.left
                }

                target.set({ top: snap.top, left: snap.left })
            })
        },
        snapToGridScaling({ target })
        {
            if (target.originX === 'center' || target.originY === 'center') {
                changeCoords(target)
            }

            return new Promise(() => {
                target.setCoords()

                let { x, y } = this.steps,

                    h = target.height * target.scaleY,
                    w = target.width * target.scaleX,

                    thresholdX = x * .3,
                    thresholdY = y * .3,

                    snap = { // Closest snapping points
                        top: Math.round(target.top / y) * y,
                        left: Math.round(target.left / x) * x,
                        bottom: Math.round((target.top + h) / y) * y,
                        right: Math.round((target.left + w) / x) * x
                    },

                    dist = { // Distance from snapping points
                        top: Math.abs(snap.top - target.top),
                        left: Math.abs(snap.left - target.left),
                        bottom: Math.abs(snap.bottom - target.top - h),
                        right: Math.abs(snap.right - target.left - w)
                    },

                    attrs = {
                        scaleX: target.scaleX,
                        scaleY: target.scaleY,
                        left: target.left,
                        top: target.top
                    }

                switch (target.__corner) {
                    case 'tl':
                        if (dist.left < dist.top && dist.left < thresholdX) {
                            attrs.scaleX = (w - (snap.left - target.left)) / target.width
                            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY
                            attrs.top = target.top + (h - target.height * attrs.scaleY)
                            attrs.left = snap.left
                        } else if (dist.top < thresholdY) {
                            attrs.scaleY = (h - (snap.top - target.top)) / target.height
                            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX
                            attrs.left = attrs.left + (w - target.width * attrs.scaleX)
                            attrs.top = snap.top
                        }
                        break
                    case 'mt':
                        if (dist.top < thresholdY) {
                            attrs.scaleY = (h - (snap.top - target.top)) / target.height
                            attrs.top = snap.top
                        }
                        break
                    case 'tr':
                        if (dist.right < dist.top && dist.right < thresholdX) {
                            attrs.scaleX = (snap.right - target.left) / target.width
                            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY
                            attrs.top = target.top + (h - target.height * attrs.scaleY)
                        } else if (dist.top < thresholdY) {
                            attrs.scaleY = (h - (snap.top - target.top)) / target.height
                            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX
                            attrs.top = snap.top
                        }
                        break
                    case 'ml':
                        if (dist.left < thresholdX) {
                            attrs.scaleX = (w - (snap.left - target.left)) / target.width
                            attrs.left = snap.left
                        }
                        break
                    case 'mr':
                        if (dist.right < thresholdX) {
                            attrs.scaleX = (snap.right - target.left) / target.width
                        }
                        break
                    case 'bl':
                        if (dist.left < dist.bottom && dist.left < thresholdX) {
                            attrs.scaleX = (w - (snap.left - target.left)) / target.width
                            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY
                            attrs.left = snap.left
                        } else if (dist.bottom < thresholdY) {
                            attrs.scaleY = (snap.bottom - target.top) / target.height
                            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX
                            attrs.left = attrs.left + (w - target.width * attrs.scaleX)
                        }
                        break
                    case 'mb':
                        if (dist.bottom < thresholdY) {
                            attrs.scaleY = (snap.bottom - target.top) / target.height
                        }
                        break
                    case 'br':
                        if (dist.right < dist.bottom && dist.right < thresholdX) {
                            attrs.scaleX = (snap.right - target.left) / target.width
                            attrs.scaleY = (attrs.scaleX / target.scaleX) * target.scaleY
                        } else if (dist.bottom < thresholdY) {
                            attrs.scaleY = (snap.bottom - target.top) / target.height
                            attrs.scaleX = (attrs.scaleY / target.scaleY) * target.scaleX
                        }
                }

                target.set(attrs)
            })
        }
    })

    return fabric
}
