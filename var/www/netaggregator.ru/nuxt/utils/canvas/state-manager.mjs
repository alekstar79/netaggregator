export async function stateManagerAddFunctionality({ fabric })
{
    const noop = () => {}
    // const log = noop

    const nextTick = () => new Promise(resolve => setTimeout(resolve, 90))

    function revive(json, stateAction)
    {
        return Promise.all(
            JSON.parse(json).objects.map(options => new Promise(resolve => {
                const Class = fabric.util.getKlass(options.type)

                try {

                    Class.fromObject({ ...options, stateAction }, resolve)

                } catch (e) {
                    resolve()
                }
            }))
        )
    }

    function grouping(objects, timeout = 1200)
    {
        // log('grouping ungrouped-objects: %o', objects.length)

        return new Promise((resolve, reject) => {
            let _next = cb => setTimeout(() => cb(Date.now()), 30),
                start = Date.now(),
                end = start + timeout,
                tid

            ;(function frame(time) {
                tid = _next(frame)

                if (!objects.filter(o => o.ungrouped).length) {
                    clearTimeout(tid)
                    resolve()

                } else if (end < time) {
                    clearTimeout(tid)
                    reject()
                }

            })(start)
        })
    }

    fabric.StateManager = function(canvas, max) {
        this.canvas = canvas
        this.max = max
    }

    fabric.StateManager.init = function(canvas, max = 90, cb) {
        canvas.manager = new fabric.StateManager(canvas, max)

        canvas.manager.onChangeHandler = []
        canvas.manager.on(cb)
    }

    fabric.StateManager.prototype.grouping = function() {
        return grouping(this.canvas?._objects.filter(o => o.ungrouped) || []).then(nextTick)
    }

    fabric.StateManager.prototype.toggleState = function() {
        // log('toggle-state')

        try {

            this.redoBtnDisabled = this.stack.length - 1 <= this.index
            this.undoBtnDisabled = this.index < 1
            this.onChangeHandler.forEach(cb => {
                cb(this)
            })

        } catch (e) {
        }

        this.locked = false
    }

    fabric.StateManager.prototype.clearStack = async function() {
        this.redoBtnDisabled = true
        this.undoBtnDisabled = true

        this.stack = []
        this.prev = []
        this.next = []

        this.index = -1
        this.locked = false
    }

    fabric.StateManager.prototype.outwit = async function(dump, action = 'update') {
        // log('outwit action: %s', action)

        try {

            switch (action) {
                case 'undo':
                    this.next.unshift(revive(dump, 'undo'))
                    return this.prev.pop()
                case 'redo':
                    this.prev.push(revive(dump, 'redo'))
                    return this.next.shift()

                default:
                    this.prev.push(revive(dump, action))
            }

        } catch (e) {
        }
    }

    fabric.StateManager.prototype.replace = function(objects) {
        // log('replace canvas %o, objects: %o', !!this.canvas, objects.length)
        if (!this.canvas) return

        this.canvas.cancelRequestedRender()
        this.canvas.forEachObject(o => { o.fire('removed') })
        this.canvas._objects = objects.filter(Boolean).map(o => {
            return o.set('canvas', this.canvas)//.fire('added')
        })

        fabric.request()
    }

    fabric.StateManager.prototype.updateStack = async function() {
        if (this.locked || this.canvas.stackManagerStop) return

        this.locked = true

        try {

            await this.grouping()

            // log('update-stack stack: %o, index: %o', this.stack.length, this.index)

            const dump = JSON.stringify(this.canvas.toDatalessObject())

            if (this.stack.length >= this.max) {
                this.stack.shift()
            }
            if (this.index < this.stack.length - 1) {
                this.stack = this.stack.slice(0, this.index + 1)
            }

            this.stack.push(dump)
            this.index = this.stack.length - 1

            // log('update-stack stack: %o, index: %o', this.stack.length, this.index)

            if (this.index > 0) {
                await this.outwit(this.stack[this.index - 1])
            }

        } catch (e) {
        }

        this.toggleState()
    }

    fabric.StateManager.prototype.undo = function(callback) {
        // log('undo locked: %o, manager-stop: %o, success: %o', this.locked, !!this.canvas?.stackManagerStop, this.index > 0)

        if (this.locked || this.canvas?.stackManagerStop) return

        if (this.index > 0) {
            this.apply({ action: 'undo', callback })
        }
    }

    fabric.StateManager.prototype.redo = function(callback) {
        // log('undo locked: %o, manager-stop: %o, success: %o', this.locked, !!this.canvas?.stackManagerStop, this.index < this.stack.length - 1)

        if (this.locked || this.canvas?.stackManagerStop) return

        if (this.index < this.stack.length - 1) {
            this.apply({ action: 'redo', callback })
        }
    }

    fabric.StateManager.prototype.apply = async function({ action, callback }) {
        // log('apply action: %s, index(before): %o', action, this.index)
        this.locked = true

        try {

            this.replace(await this.outwit(this.stack[this.index], action))

            this.index += (action === 'undo' ? -1 : 1)
            this.canvas.trigger('canvas:distort', { resolve: callback })
            this.canvas.trigger('stack:changed', noop)

            await this.grouping()

        } catch (e) {
        }

        // log('apply index(after): %o', this.index)

        this.toggleState()
    }

    fabric.StateManager.prototype.on = function(callback) {
        if (typeof callback === 'function') {
            this.onChangeHandler.push(callback)
        }
    }

    Object.assign(fabric.StateManager.prototype, {
        redoBtnDisabled: true,
        undoBtnDisabled: true,
        onChangeHandler: [],

        canvas: null,
        locked: false,
        index: -1,
        max: 75,

        stack: [],
        prev: [],
        next: []
    })

    return fabric
}
