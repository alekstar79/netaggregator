import { nextFrame, cancelFrame } from '../../callbacks.mjs'

export class Loop
{
    constructor(update, display, run = false)
    {
        this.display = display
        this.update = update

        run && this.start()
    }

    animate(currentTime)
    {
        this.timeoutId && cancelFrame(this.timeoutId)

        if (!this.run) return

        this.timeoutId = nextFrame(this.animate.bind(this))
        this.deltaTime = currentTime - this.lastUpdate

        if (this.deltaTime < this.maxInterval) {
            this.update(this.deltaTime / 1000)
            this.display()
        }

        this.lastUpdate = currentTime
    }

    start()
    {
        this.maxInterval = 40
        this.lastUpdate = 0
        this.deltaTime = 0
        this.timeoutId = 0

        this.run = true

        this.timeoutId = nextFrame(this.animate.bind(this))
    }

    stop()
    {
        this.timeoutId && cancelFrame(this.timeoutId)

        this.run = false
    }
}
