import { Effect } from '../libs/effect/index.mjs'

export default {
    type: 'Sepia2',

    applyTo({ ctx, imageData })
    {
        Effect.fromImageData(imageData).then(e => {
            ctx.putImageData(e.sepia(.7).getData(), 0, 0)
        })
    }
}
