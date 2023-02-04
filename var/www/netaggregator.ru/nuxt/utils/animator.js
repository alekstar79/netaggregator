import { nextFrame } from './callbacks.mjs'
import { Timing } from './timing.js'

/**
 * @see https://github.com/W-went/graphics/tree/master/common/lib/animator
 */
export class Animator
{
  constructor({ duration, iterations, easing })
  {
    this.timing = { duration, iterations, easing }
  }

  animate(target, update)
  {
    const timing = new Timing(this.timing)

    let frameIndex = 0

    return new Promise(resolve => {
      function next() {
        if (update({ target, frameIndex, timing }) !== false && !timing.isFinished) {
          nextFrame(next)
        } else {
          resolve(timing)
        }

        frameIndex++
      }

      next()
    })
  }
}
