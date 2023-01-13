export class MaskHistory
{
    constructor(callback)
    {
        callback || (callback = () => {})

        this.callback = callback

        this.clear()
    }

    /**
     * @property {boolean}
     */
    get undoDisabled()
    {
        return this.current < 0
    }

    /**
     * @property {boolean}
     */
    get redoDisabled()
    {
        return this.current >= this.store.length - 1
    }

    clear()
    {
        this.current = -1
        this.store = []
    }

    /**
     * @return {Object}
     */
    getCurrent()
    {
        return this.current > -1 ? this.store[this.current] : null
    }

    /**
     * @param {Object} dump
     */
    add(dump)
    {
        if (this.current < this.store.length - 1) {
            const next = this.current + 1

            this.store[next] = dump
            this.store = this.store.splice(0, next + 1)
        } else {
            this.store.push(dump)
        }

        this.current = this.store.length - 1
    }

    undo()
    {
        if (!this.undoDisabled) {
            this.current--
            this.callback()
        }
    }

    redo()
    {
        if (!this.redoDisabled) {
            this.current++
            this.callback()
        }
    }
}
