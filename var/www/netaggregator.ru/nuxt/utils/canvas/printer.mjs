export class Printer
{
    static instance = null

    static init()
    {
        Printer.instance || (Printer.instance = new Printer())

        return Printer.instance
    }

    constructor()
    {
        this.prepare = this.prepare.bind(this)
        this.print = this.print.bind(this)
        this.load = this.load.bind(this)

        this.uid = null
        this.src = null
    }

    load(win, context)
    {
        const img = new Image()

        this.src.then(src => {
            if (!src) return

            win.document.body.appendChild(img)
            img.src = src.toString()
        }).catch(e => {
            context.snack(e.message, 'error')
        })

        img.onerror = e => {
            context.snack(e.message, 'error')
            win.close()
        }
        img.onload = () => {
            win.print()
            win.close()
        }
    }

    print(context)
    {
        const win = open('about:blank')

        if (win.document.readyState !== 'complete') {
            win.addEventListener('load', this.load.bind(this, win, context))
        } else {
            this.load(win, context)
        }
    }

    prepare(context)
    {
        if (!this.uid) {
            this.uid = true

            setTimeout(() => {
                this.src = context.toDataURL({})
            })
        }
    }

    clear()
    {
        this.uid = null
    }
}
