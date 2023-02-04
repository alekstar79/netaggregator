// import { detectUserAgent } from './common/user-agent.mjs'

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/queueMicrotask
 */
export const queueMicrotask = (function() {
  const queueMicrotask = typeof window !== 'undefined'
    ? window.queueMicrotask
    : undefined

  return queueMicrotask || (cb => {
    Promise.resolve().then(cb).catch(e => setTimeout(() => { throw e }))
  })
})()

/**
 * @see https://developer.mozilla.org/ru/docs/Web/API/Window/requestIdleCallback
 */
export const requestIdleCallback = (function() {
  const requestIdleCallback = typeof window !== 'undefined' ? window.requestIdleCallback : undefined

  return requestIdleCallback || (cb => {
    const start = Date.now()

    return setTimeout(() => {
      cb({ timeRemaining: () => Math.max(0, 50 - (Date.now() - start)), didTimeout: false })
    })
  })
})()

/**
 * @see https://developer.mozilla.org/ru/docs/Web/API/Window/cancelIdleCallback
 */
export const cancelIdleCallback = (function() {
  const cancelIdleCallback = typeof window !== 'undefined' ? window.cancelIdleCallback : undefined

  return cancelIdleCallback || (id => {
    clearTimeout(id)
  })
})()

/**
 * @see https://gist.github.com/paulirish/1579671
 */
export const nextFrame = (function() {
  if (typeof window === 'undefined') {
    return cb => setTimeout(() => cb(Date.now()), 1000 / 60)
  }

  let ios6 = /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent),
    nextFrame = window.requestAnimationFrame

  if (typeof nextFrame !== 'function' || ios6) {
    (['webkit','moz','o','ms']).some(p => {
      if (window[p + 'RequestAnimationFrame']) {
        nextFrame = window[p + 'RequestAnimationFrame']
        return true
      }

      return false
    })
  }

  return nextFrame
})()

export const cancelFrame = (function() {
  if (typeof window === 'undefined') {
    return clearTimeout
  }

  let ios6 = /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent),
    cancelFrame = window.cancelAnimationFrame

  if (typeof cancelFrame !== 'function' || ios6) {
    (['webkit','moz','o','ms']).some(p => {
      if (window[p + 'CancelAnimationFrame']) {
        cancelFrame = window[p + 'CancelAnimationFrame'] || window[p + 'CancelRequestAnimationFrame']
        return true
      }

      return false
    })
  }

  return cancelFrame
})()

export const nextTick = (function() {
  const nextTick = f => setTimeout(f, 0)

  if (typeof window === 'undefined') {
    return nextTick
  }
  if (window.setImmediate) {
    return f => window.setImmediate(f)
  }
  if (window.postMessage && window.addEventListener) {
    const call = f => typeof f === 'function' && f(),
      queue = []

    window.addEventListener('message', e => {
      const source = e.source

      if ((source === window || source === null) && e.data === 'process-tick') {
        e.stopPropagation()

        if (queue.length > 0) {
          call(queue.shift())
        }
      }
    }, true)

    return f => {
      queue.push(f)
      window.postMessage('process-tick', '*')
    }
  }

  return nextTick
})()

export function timedProcess(items, process, callback)
{
  const todo = items.concat()

  setTimeout(function perform() {
    const start = +new Date()

    do {

      process(todo.shift())

    } while (todo.length > 0 && (+new Date() - start < 50))

    if (todo.length > 0) {
      setTimeout(perform, 100)

    } else {
      callback(items)
    }
  }, 100)
}

export function fulfill(callback, timeout = 1e3, attempts = 10)
{
  return requestIdleCallback(deadline => {
    while (deadline.timeRemaining() > 0 || deadline.didTimeout) {
      if (attempts <= 0 || callback()) break

      attempts--
    }

  }, { timeout })
}

/**
 * @param {Function} handler
 * @return {Promise}
 */
export function running(handler)
{
  let tid, i = 0, now = +new Date()

  return new Promise(resolve => {
    (function frame(time) {
      tid = nextFrame(frame)

      if (handler(time, i)) {
        cancelFrame(tid)
        resolve()
      }

      i++

    })(now)
  })
}

export function carryOut(cb, ms = 100)
{
  let id, cancel, time = 0

  const executor = now => {
    id = nextFrame(executor)

    if (cancel) {
      return cancelFrame(id)
    }
    if (time < now) {
      time = now + ms

      cancel = cb()
    }
  }

  id = nextFrame(executor)

  return () => {
    cancel = true
  }
}
