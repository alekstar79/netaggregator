import { toImage } from '~/utils/canvas/index.mjs'
import { rclamp } from '~/utils/common/clamp.mjs'

import { getPointer } from '~/utils/common/pointer.mjs'
import { fabric } from 'fabric/src/point.class'
// import { fabric } from 'fabric'

let isTouch = typeof TouchEvent !== 'undefined',

    dataurl = (canvas, mime = 'image/png') => canvas.toDataURL(mime, 1.0),
    middle = ({ height, width }, s = 1) => new fabric.Point(width * s / 2, height * s / 2),
    point = ({ x, y }, k = 1) => new fabric.Point(x / k, y / k),

    dist = (p1, p2) => {
        const dx = p1.clientX - p2.clientX,
            dy = p1.clientY - p2.clientY

        return Math.sqrt(dx * dx + dy * dy)
    },

    STD = 607 / 500,
    MOD = 900 / 650,

    min = .05,
    max = 5

export default {
    data: () => ({
        mime: 'image/png',
        disabled: true,

        canvas: null,
        ctx: null,
        box: null,

        image: null,
        shift: null,

        params: { oX: 0, oY: 0, s: 1 },
        tScalable: {
            on: false,
            factor: 1.0,
            curr: 1.0,
            dist: 0
        }
    }),
    computed: {
        isIcons() {
            return ['24x24','50x50'].includes(this.imgType)
        },
        clientRatio() {
            return this.$BROWSER.IS_MOBILE ? STD : MOD
        }
    },
    watch: {
        params: 'draw'
    },
    methods: {
        setParams(oX, oY, s)
        {
            const { oX: x, oY: y, s: scale } = this.params

            if (typeof s  !== 'number') s = scale
            if (typeof oX !== 'number') oX = x
            if (typeof oY !== 'number') oY = y

            this.params = { oX, oY, s }
        },
        trackScaling(scale)
        {
            const { oX: x, oY: y, s } = this.params,
                m = middle(this.image, s),
                c = point({ x, y }).add(m),
                p = c.subtract(m)

            this.setParams(p.x, p.y, scale)
        },
        mouseDown(event)
        {
            if (isTouch && event instanceof TouchEvent) {
                const touches = event.targetTouches

                if (touches.length >= 2) {
                    this.tScalable.dist = dist(touches[0], touches[1])
                    this.tScalable.on = true
                    return
                }
            }
            if (!this.tScalable.on) {
                const { oX: x, oY: y } = this.params,
                    p = point(getPointer(event))

                this.shift = point({ x, y }).subtract(p)
            }
        },
        mouseMove(event)
        {
            if (isTouch && event instanceof TouchEvent) {
                const touches = event.targetTouches

                if (this.tScalable.on) {
                    this.tScalable.curr = dist(touches[0], touches[1]) / this.tScalable.dist * this.tScalable.factor
                    this.trackScaling(this.tScalable.curr)
                    return
                }
            }
            if (!this.tScalable.on && this.shift) {
                const p = point(getPointer(event)).add(this.shift)
                this.setParams(p.x, p.y)
            }
        },
        mouseUp(event)
        {
            let touches = []

            if (isTouch && event instanceof TouchEvent) {
                touches = event.targetTouches
            }
            if (this.tScalable.on) {
                this.tScalable.factor = Math.max(Math.min(max, this.tScalable.curr), min)
                this.tScalable.on = touches.length >= 2
                this.trackScaling(this.tScalable.factor)
                return
            }

            this.shift = null
        },
        mouseLeave()
        {
            this.shift = null
        },
        wheel(event)
        {
            const dy = event.deltaY || event.wheelDelta,
                s = this.params.s + (dy > 0 ? .01 : -.01)

            if ((dy > 0 && s < max) || (dy < 0 && s > min)) {
                this.trackScaling(s)
            }
        },
        scaling()
        {
            const { width, height } = this.dimension,
                url = this.canvas.toDataURL(this.mime, 1.0),
                canvas = document.createElement('canvas'),
                context = canvas.getContext('2d')

            canvas.height = height
            canvas.width = width

            return toImage(url).then(({ target }) => {
                context.drawImage(target, 0, 0, width, height)
                return canvas
            })
        },
        getDataUrl()
        {
            return (this.isIcons ? this.scaling() : Promise.resolve(this.canvas)).then(dataurl)
        },
        upload(file)
        {
            const r = new FileReader()

            r.onload = ({ target: { result } }) => {
                toImage(result).then(this.onLoad)
            }

            r.readAsDataURL(file)
        },
        draw()
        {
            const { width: w, height: h } = this.image,
                { oX, oY, s } = this.params

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.ctx.drawImage(this.image, 0,0, w, h, oX, oY, w * s, h * s)
        },
        fit()
        {
            let { width: dW, height: dH } = this.dimension,
                dR = dW / dH, px, py

            if (this.isIcons) {
                dW = 300
                dH = 300
                dR = 1
            }

            let width = dR < this.clientRatio
                ? Math.ceil(dR * rclamp(dH, 300, 553) + 30)
                : Math.ceil(dW + 30)

            this.width = width + 'px'
            this.canvas = this.$refs.canvas
            this.ctx = this.canvas.getContext('2d')

            this.canvas.height = dH
            this.canvas.width = dW

            py = (dH - this.image.height) / 2
            px = (dW - this.image.width) / 2

            this.setParams(px, py, 1)
        },
        onLoad({ target })
        {
            target.onload = this.draw
            this.disabled = false
            this.image = target

            if (this.dimension) {
                this.fit()
            }
        }
    }
}
