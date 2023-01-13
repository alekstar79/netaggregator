export default {
    type: 'Redeye',

    applyTo({ ctx, imageData })
    {
        let p = imageData.width * imageData.height,
            px = p * 4,
            r, g, b

        while (p--) {
            px -= 4

            r = imageData.data[px]
            b = imageData.data[px + 1]
            g = imageData.data[px + 2]

            // k = 0.4 / 1.5 it gives the best results
            if (parseFloat(`${r / (g + b) / 2}`) > .5) {
                imageData.data[px] = Math.round((g + b) / 2)
            }
        }

        ctx.putImageData(imageData, 0, 0)
    }
}
