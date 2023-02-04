/**
 * Simple JavaScript Throttle/Debounce Function
 * @see https://gist.github.com/nmsdvid/8807205
 */
export class Throttle
{
  static TIMEOUT = 1000

  get has()
  {
    return typeof this.callback === 'function'
  }

  constructor(ms = 1e3, callback = () => {})
  {
    if (!Number.isInteger(ms)) {
      ms = Throttle.TIMEOUT
    }

    // this.install = false
    this.timeout = null
    this.ms = ms

    this.set(callback)
  }

  run(...args)
  {
    this.timeout && clearTimeout(this.timeout)

    this.timeout = setTimeout(() => {
      this.callback(...args)
    }, this.ms)
  }

  set(cb)
  {
    if (typeof cb === 'function') {
      this.callback = cb
    }

    return this.has
  }

  static create(ms = 1e3, callback = null)
  {
    let handler = callback,
      timeout = ms

    if (typeof ms === 'function') {
      timeout = callback
      handler = ms
    }
    if (typeof timeout !== 'number') {
      timeout = Throttle.TIMEOUT
    }

    return new Throttle(timeout, handler)
  }
}
