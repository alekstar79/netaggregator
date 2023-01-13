import { blank, check, close } from '~/assets/data/canvas-icons'
import { Fabric, cropzone } from '~/utils/canvas/index.mjs'

let { max, min, abs } = Math,

    MOVE_THRESHOLD = 10,
    CropZone

async function requireCrop()
{
    const fabric = await Fabric.resolve()

    CropZone || (CropZone = fabric.util.createClass(fabric.Rect, cropzone))

    return new CropZone({
        fill: 'rgba(255,255,255,.3)',
        hasRotatingPoint: false,
        hasBorders: false,
        lockScalingFlip: true,
        lockRotation: true,
        strokeWidth: 0,
        left: -10,
        top: -10,
        width: 1,
        height: 1
    })
}

export default {
    computed: {
        withShiftKey() {
            return this.$store.state.canvas.shiftKey
        }
    },
    data: () => ({
        cropedObject: null,
        cropzone: null,
        startX: null,
        startY: null,
        ratio: null
    }),
    methods: {
        setCropControls()
        {
            this.cropzone.customiseControls({
                mtr: { action: null, cursor: null },
                mb:  { action: null, cursor: null },
                mr:  { action: null, cursor: null },
                mt:  { action: null, cursor: null },
                bl:  { action: null, cursor: null },
                br:  { action: null, cursor: null },
                tr:  {
                    action: this.cropEnd.bind(this),
                    cursor: 'pointer'
                },
                tl:  {
                    action: this.cropCancel.bind(this),
                    cursor: 'pointer'
                }
            })

            this.cropzone.customiseCornerIcons({
                settings: {
                    borderColor: '#0094dd',
                    cornerBackgroundColor: '#0094dd',
                    cornerShape: 'rect',
                    cornerPadding: 5,
                    cornerSize: 15
                },

                mtr: { icon: blank },
                mt:  { icon: blank },
                mb:  { icon: blank },
                mr:  { icon: blank },
                bl:  { icon: blank },
                br:  { icon: blank },
                tl:  { icon: close },
                tr:  { icon: check }
            })
        },
        releaseCrop()
        {
            const o = this.cropedObject.setCoords()

            if (!this.cropzone || !this.cropzone.isValid() ||
                !this.cropzone.intersectsWithObject(o)) {
                return Promise.reject()
            }

            const { left: L, top: T, width: W, height: H } = o.getBoundingRect(true),

                cH = this.cropzone.getScaledHeight(),
                cW = this.cropzone.getScaledWidth(),
                cL = this.cropzone.get('left'),
                cT = this.cropzone.get('top'),

                left = max(cL - L, 0),
                top = max(cT - T, 0),

                height = min(T > cT ? cT + cH - T : cH, H - top),
                width = min(L > cL ? cL + cW - L : cW, W - left),

                halfH = height / 2,
                halfW = width / 2

            return new Promise(resolve => resolve({
                src: o.toDataURL({ left, top, width, height }),
                originX: 'center',
                originY: 'center',
                left: max(cL, L) + halfW,
                top: max(cT, T) + halfH,
                height,
                width
            }))
        },
        calcRectDimensionFromPoint(x, y)
        {
            const scale = this.canvas.getZoom(),

                cHeight = this.canvas.getHeight(),
                cWidth = this.canvas.getWidth(),

                origHeight = cHeight / scale,
                origWidth = cWidth / scale,

                startX = this.startX,
                startY = this.startY

            let left = max(0, min(x, startX)),
                top = max(0, min(y, startY)),

                width = max(startX, min(x, origWidth)) - left, // (startX <= x(mouse) <= canvasWidth) - left
                height = max(startY, min(y, origHeight)) - top // (startY <= y(mouse) <= canvasHeight) - top

            if (this.withShiftKey) { // make fixed ratio cropzone
                width = height / this.ratio

                if (startX >= x) {
                    left = startX - width
                }
                if (startY >= y) {
                    top = startY - height
                }
            } else {
                this.ratio = height / width
            }

            return { left, top, width, height }
        },
        setZone({ left, top, width, height })
        {
            this.cropzone.set({ left, top, height, width }).setCoords()
            this.canvas.calcOffset().renderAll()
        },
        setEvented(evented)
        {
            this.canvas.forEachObject(obj => { obj.evented = evented })
        },
        checkObject(active)
        {
            let content = null

            switch (true) {
                case !active:
                    content = 'select_croped_object'
                    break

                case active.type === 'activeSelection':
                case active.type !== 'image':
                    content = 'select_single_object'
                    break
            }

            return content
        },
        async cropInset()
        {
            this.fixedCursor = 'crosshair'
            this.canvas.defaultCursor = 'crosshair'
            this.canvas.selection = false

            this.cropzone = await requireCrop()

            this.canvas.add(this.cropzone)

            this.setCropControls()

            this.canvas.on({
                'object:scaling': this.onObjectScaling,
                'object:moving': this.onObjectMoving,
                'mouse:down': this.onMouseDown
            })
        },
        cropReset()
        {
            this.fixedCursor = null
            this.canvas.defaultCursor = 'default'
            this.canvas.selection = true

            this.canvas.off({
                'object:scaling': this.onObjectScaling,
                'object:moving': this.onObjectMoving,
                'mouse:down': this.onMouseDown
            })

            this.canvas.remove(this.cropzone)

            this.cropzone = null
        },
        async cropStart()
        {
            if (this.cropzone) return false

            let content, active = this.canvas.getActiveObject()

            if ((content = this.checkObject(active))) {
                this.$bus.$emit('snack', {
                    content: `graph.${content}`,
                    color: 'warning'
                })

                return false
            }

            this.unbindStateHandler()
            this.setEvented(false)
            await this.cropInset()

            this.cropedObject = active

            return true
        },
        cropEnd()
        {
            this.releaseCrop().then(img => {
                this.canvas.remove(this.cropedObject)
                this.cropReset()

                this.bindStateHandler()
                this.createImage(img, false, obj => {
                    this.setActive(obj)
                    this.selectedObjects()
                })

            }).catch(() => {
                this.cropReset()
                this.bindStateHandler()
            }).finally(() => {
                this.setEvented(true)
                this.$emit('crop:end')
            })
        },
        cropCancel()
        {
            return this.$nextTick().then(() => {
                this.cropReset()
                this.bindStateHandler()
                this.toActive(this.cropedObject)
                this.selectedObjects()
            }).finally(() => {
                this.setEvented(true)
                this.$emit('crop:reset')
            })
        },
        onObjectScaling({ target })
        {
            if (target !== this.cropzone) return

            const scale = this.canvas.getZoom(),
                h = this.canvas.getHeight(),
                w = this.canvas.getWidth(),

                height = h / scale,
                width = w / scale,

                minX = target.left,
                minY = target.top,

                maxX = target.left + target.getScaledWidth(),
                maxY = target.top + target.getScaledHeight(),

                preventScaling = minX < 0 || maxX > width || minY < 0 || maxY > height

            if (preventScaling) {
                target.scaleX = this.lastScaleX || 1
                target.scaleY = this.lastScaleY || 1

                if (minX < 0) {
                    target.left = 0
                }
                if (minY < 0) {
                    target.top = 0
                }
            }
            if (target.getScaledWidth() < 1) {
                target.scaleToWidth(1, true)
            }
            if (target.getScaledHeight() < 1) {
                target.scaleToHeight(1, true)
            }

            this.lastScaleX = target.scaleX
            this.lastScaleY = target.scaleY
        },
        onObjectMoving({ target })
        {
            if (target !== this.cropzone) return

            const scale = this.canvas.getZoom(),
                height = this.canvas.getHeight(),
                width = this.canvas.getWidth(),

                h = target.getScaledHeight(),
                w = target.getScaledWidth(),

                left = target.left,
                top = target.top,

                maxY = height / scale - h,
                maxX = width / scale - w

            target.left = max(0, min(left, maxX))
            target.top = max(0, min(top, maxY))
        },
        onMouseDown({ target, e })
        {
            if (e.shiftKey || target === this.cropzone) return

            const { x, y } = this.canvas.getPointer(e)

            this.startX = x
            this.startY = y

            this.canvas.discardActiveObject(e)
            this.canvas.setActiveObject(this.cropzone)
                .bringToFront(this.cropzone)

            this.canvas.on({
                'mouse:move': this.onMouseMove,
                'mouse:up': this.onMouseUp
            })
        },
        onMouseMove({ e })
        {
            if (this.startX === null) return

            const { x, y } = this.canvas.getPointer(e)

            if (abs(x - this.startX) + abs(y - this.startY) > MOVE_THRESHOLD) {
                this.setZone(this.calcRectDimensionFromPoint(x, y))
            }
        },
        onMouseUp()
        {
            this.canvas.off({
                'mouse:move': this.onMouseMove,
                'mouse:up': this.onMouseUp
            })

            this.startX = null
            this.startY = null
        }
    }
}
