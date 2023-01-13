export class Loop
{
    constructor(update, display)
    {
        this.display = display
        this.update = update

        this.deltaTime = 0
        this.lastUpdate = 0
        this.maxInterval = 40

        requestAnimationFrame(stampTime => this.animate(stampTime))
    }

    animate(currentTime)
    {
        requestAnimationFrame(stampTime => this.animate(stampTime))

        this.deltaTime = currentTime - this.lastUpdate

        if (this.deltaTime < this.maxInterval) {
            this.update(this.deltaTime / 1000)
            this.display()
        }

        this.lastUpdate = currentTime
    }
}
