/**
* @see https://techarks.ru/qa/javascript/zapretit-obekti-js-fabric-8R
*/
export function preventMove({/* target */} = {})
{
    if (!this.canvas) return

    this.track || (this.track = { left: this.left, top: this.top })

    let rect = this.getBoundingRect(true, true),
        zC = this.canvas.viewportTransform[0],
        zH = this.canvas.height / zC,
        zW = this.canvas.width / zC

    // top-left
    if (rect.top <= 0 || rect.left <= 0) {
        this.left = Math.max(this.left, this.left - rect.left) + 1
        this.top = Math.max(this.top, this.top - rect.top) + 1
        this.dirty = true
    }

    // bottom-right
    if (rect.top + rect.height >= zH || rect.left + rect.width >= zW) {
        this.left = Math.min(this.left, zW - rect.width + this.left - rect.left) - 1
        this.top = Math.min(this.top, zH - rect.height + this.top - rect.top) - 1
        this.dirty = true
    }

    this.track.left = this.left
    this.track.top = this.top
}

export function preventScale({ transform: { action } })
{
    if (!this.canvas) return

    this.track || (this.track = { left: this.left, top: this.top, width: this.width, height: this.height, scaleX: 1, scaleY: 1 })

    let isWidget = this.type.startsWith('widget'),
        rect = this.getBoundingRect(true, true),
        zC = this.canvas.getZoom(),

        zH = this.canvas.height / zC,
        zW = this.canvas.width / zC

    if (isWidget) {
        switch (action) {
            case 'scaleX':
                this.set('scaleY', this.scaleX)
                break
            case 'scaleY':
                this.set('scaleX', this.scaleY)
                break
        }
    }
    if (((rect.width + rect.left) >= zW) ||
        ((rect.height + rect.top) >= zH) ||
        ((rect.left <= 0) || (rect.top <= 0))) {
        this.set(this.track)
    } else {
        this.track.width = this.width
        this.track.height = this.height
        this.track.scaleX = this.scaleX
        this.track.scaleY = this.scaleY
        this.track.left = this.left
        this.track.top = this.top
    }
    if (isWidget) {
        this.forEachObject(o => o.set({
            scaleX: o.track.scaleX / this.scaleX,
            scaleY: o.track.scaleY / this.scaleY
        }))
    }
}
