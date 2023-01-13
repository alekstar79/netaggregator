async function cropInit()
{
    if (!this.crop) {
        await this.ctx.disableTools(['crop','fit'])
        this.crop = true
    }
}

async function cropFinish()
{
    if (this.crop) {
        await this.ctx.enableTools()
        this.crop = false
    }
}

export class Crop
{
    constructor(ctx)
    {
        ctx.$on('crop:init', cropInit.bind(this))
        ctx.$on('crop:reset', cropFinish.bind(this))
        ctx.$on('crop:end', cropFinish.bind(this))

        this.crop = false
        this.ctx = ctx
    }

    async onCrop()
    {
        if (await this.ctx.cropStart()) {
            await cropInit.call(this)
        }
    }

    async offCrop()
    {
        await this.ctx.cropCancel()
    }

    async toggle()
    {
        if (this.crop) {
            await this.offCrop()
        } else {
            await this.onCrop()
        }
    }
}
