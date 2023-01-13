export default {
    type: 'Redify',

    initialize(options)
    {
        // example of switching to a webgl filter backend
        // fabric.filterBackend = new fabric.WebglFilterBackend()

        if (options) {
            this.setOptions(options)
        }
    },

    applyTo({ ctx, imageData })
    {
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
            imageData.data[i + 1] = 0
            imageData.data[i + 2] = 0
        }

        ctx.putImageData(imageData, 0, 0)
    }
}
