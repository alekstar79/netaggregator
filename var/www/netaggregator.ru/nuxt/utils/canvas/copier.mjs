/**
* @see http://fabricjs.com/copypaste
*/
export class Copier
{
    get empty() {
        return this.memorized === null
    }

    constructor(editor)
    {
        this.memorized = null
        this.editor = editor
    }

    clone(object)
    {
        return new Promise(resolve => {
            object = object.originalTarget || object

            object.clone(clone => {
                this.memorized = clone
                resolve()
            })
        })
    }

    clear()
    {
        return new Promise(resolve => setTimeout(() => {
            this.memorized = null
            resolve()
        }))
    }

    copy(callback, object)
    {
        if (!this.editor.canvas) return Promise.resolve()

        this.memorized = null

        object || (object = this.editor.canvas.getActiveObject())

        if (!object) return Promise.resolve()

        if (typeof callback !== 'function') {
            callback = () => {}
        }

        return this.clone(object)
            .then(callback)
    }

    cut()
    {
        this.editor.leaveEvents()

        return this.copy(() => {
            this.editor.deleteSelected(() => {
                this.editor.canvas.renderAll()
                this.editor.restoreEvents()
                this.editor.stack('update')
            })
        })
    }

    paste(index)
    {
        if (!this.memorized) return Promise.resolve()

        return this.clone(this.memorized).then(() => {
            this.editor.discardActive(() => {
                this.editor.active = []
            })

            this.memorized.set({ left: this.memorized.left + 20, top: this.memorized.top + 20 })
            this.memorized.setCoords()

            if (typeof this.memorized.setUnique === 'function') {
                this.memorized = this.memorized.setUnique()
            }
            if (this.memorized._objects) {
                this.memorized._objects.forEach(o => o.setUnique())
            }
            if (typeof index === 'number') {
                this.editor.canvas.insertAt(this.memorized, index)
            } else {
                this.editor.canvas.insertTo(this.memorized)
            }

            this.editor.postInsert(this.memorized)
            this.editor.toActive(this.memorized)
            this.editor.selectedObjects()

            this.editor.canvas.requestRenderAll()
        })
    }
}
