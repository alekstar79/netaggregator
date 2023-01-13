export class Circle
{
    constructor(i, { radius, noise, speed, circlesNum })
    {
        this.radius = radius // 250
        this.noise = noise   // 20
        this.speed = speed   // .3

        this.r = radius - i * radius / circlesNum
        this.e = !!(i % 2)

        this.max =  Math.random() * noise
        this.min = -Math.random() * noise
        this.val =  Math.random() * (this.max - this.min) + this.min
    }

    update()
    {
        this.val = this.e ? this.val + this.speed : this.val - this.speed

        if (this.val < this.min) {
            this.e = true
            this.max = Math.random() * this.noise
        }
        if (this.val > this.max) {
            this.e = false
            this.min = -Math.random() * this.noise
        }
    }
}
