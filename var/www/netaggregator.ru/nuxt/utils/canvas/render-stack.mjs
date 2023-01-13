// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(renderStackAddFunctionality)

export async function renderManagerAddFunctionality({ fabric })
{
    const { nextFrame, cancelFrame } = await import('../callbacks.mjs'),
        node = typeof process !== 'undefined' && !process.browser

    function webRequest()
    {
        this.timeout && cancelFrame(this.timeout)
        this.timeout = nextFrame(this._render)

        this.stack++
    }

    function nodeRequest()
    {
        process.nextTick(this._render)
    }

    function webRender()
    {
        if (!this.stack) return
        if (++this.count > 1) return

        this.stack = 0
        this.canvas.requestRenderAll()
        nextFrame(() => {
            this.count = 0
        })

        if (this.handlers.length) {
            this.handlers.forEach(callback => {
                callback(this)
            })
        }
    }

    function nodeRender()
    {
        this.canvas.renderAll()

        if (this.handlers.length) {
            this.handlers.forEach(callback => {
                callback(this)
            })
        }
    }

    fabric.RenderManager = function(canvas) {
        this.canvas = canvas
        this.loop = true
        this.tid = null

        this._render = this._render.bind(this)
        this.request = this.request.bind(this)
        this.frame = this.frame.bind(this)
    }

    fabric.RenderManager.prototype.request = node ? nodeRequest : webRequest
    fabric.RenderManager.prototype._render = node ? nodeRender : webRender

    fabric.RenderManager.prototype.clear = function() {
        this.stack = 0
    }

    fabric.RenderManager.prototype.frame = function() {
        if (!this.loop) return

        this.tid = setTimeout(this.frame, 760)
        this.request()
    }

    fabric.RenderManager.prototype.start = function() {
        this.loop = true
        this.frame()
    }

    fabric.RenderManager.prototype.stop = function() {
        clearTimeout(this.tid)
        this.loop = false
    }

    fabric.RenderManager.prototype.on = function(callback) {
        if (typeof callback === 'function') {
            this.handlers.push(callback)
        }
    }

    fabric.RenderManager.init = function(canvas, callback) {
        const render = new fabric.RenderManager(canvas)

        fabric.request = render.request
        canvas.render  = render

        render.on(callback)
    }

    Object.assign(fabric.RenderManager.prototype, {
        canvas: null,
        handlers: [],
        timeout: 0,
        loop: true,
        tid: null,
        count: 0,
        stack: 0
    })

    return fabric
}
