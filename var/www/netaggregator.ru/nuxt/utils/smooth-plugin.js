// noinspection JSSuspiciousNameCombination

import { ScrollbarPlugin } from 'smooth-scrollbar'

/**
 * @see https://github.com/idiotWu/smooth-scrollbar/blob/HEAD/docs/plugin.md
 */

/**
 * @typedef Momentum
 * @type {Number} x
 * @type {Number} y
 */

/**
 * @typedef Delta
 * @type {Number} x
 * @type {Number} y
 */

export class SmoothPlugin extends ScrollbarPlugin
{
  static pluginName = 'SmoothPlugin'

  static defaultOptions = {
    param1: 'd10',
    param2: 'd20',
    param3: 'd30',

    events: []
  }

  shouldInvertDelta(fromEvent)
  {
    return this.options.events.some(rule => fromEvent.type.match(rule))
  }

  onInit()
  {
    // console.log('scrollbar init | options: %o', this.options)
    // super.onInit()
  }

  onUpdate()
  {
    // console.log('scrollbar update | this: %o', this)
    // super.onUpdate()
  }

  /**
   * @param {Delta} delta
   * @param {Event} fromEvent
   * @return {Delta}
   */
  transformDelta({ x, y }, fromEvent)
  {
    // console.log('scrollbar transform-delta | delta: %o, event: %o', delta, fromEvent)

    /* if (this.shouldInvertDelta(fromEvent)) {
        x *= -1
        y *= -1
    } */

    return {
      x: x * 2,
      y: y * 2
    }
  }

  /**
   * @param {Momentum} remainMomentum
   */
  onRender(remainMomentum)
  {
    // console.log('scrollbar on-render | momentum: %o', remainMomentum)

    // this._remain = { ...remainMomentum }
    // this.scrollbar.setMomentum(0, 0)

    // super.onRender(remainMomentum)
  }

  onDestroy()
  {
    // console.log('scrollbar destroy')
    // super.onDestroy()
  }
}
