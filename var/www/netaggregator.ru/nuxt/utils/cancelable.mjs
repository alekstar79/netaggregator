const noop = () => {}

/**
 * @see https://github.com/HowProgrammingWorks/Cancelable/blob/master/JavaScript/3-promise.js
 * @see https://www.youtube.com/watch?v=T8fXlnqI4Ws
 */
export class Cancelable extends Promise
{
  constructor(executor = noop)
  {
    super((resolve, reject) => {
      executor(v => {

        /**
         * @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Operators/Optional_chaining
         */
        if (this?.canceled) {
          this.silent || reject(new Error('Cancelled'))
          return
        }

        resolve(v)

      }, reject)
    })

    this.canceled = false
  }

  cancel(silent = false)
  {
    this.silent = silent

    this.canceled = true
  }
}
