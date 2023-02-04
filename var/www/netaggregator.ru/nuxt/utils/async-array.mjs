/**
 * @see https://github.com/HowProgrammingWorks/NonBlocking/tree/master/JavaScript
 */
export class AsyncArray extends Array
{
  [Symbol.asyncIterator]()
  {
    let i = 0

    return {
      next: () => new Promise(resolve => {
        // setImmediate(() => resolve({ value: this[i], done: i++ === this.length }))
        setTimeout(() => resolve({ value: this[i], done: i++ === this.length }))
      })
    }
  }
}

/**
 * @param {Promise[]} array
 * @return {Object}
 * @example
 *
 * ;(async () => {
 *    const a = [1,2,3,4,5].map(item => Promise.resolve(item))
 *
 *    for await (const task of asyncIter(a)) {
 *        console.log(task)
 *    }
 * })()
 */
export function asyncIter(array)
{
  return {
    async *[Symbol.asyncIterator]()
    {
      while (array.length) {
        yield await array.shift()
      }
    }
  }
}

export function each(array, fn, ms = 0)
{
  let tid, last = array.length - 1, i = 0

  const next = () => {
    if (i <= last) {
      fn(array[i], i)
      tid = setTimeout(next, ms)
      i++
    }
  }

  next()

  return () => {
    clearTimeout(tid)
  }
}
