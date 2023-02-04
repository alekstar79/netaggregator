/**
 * @typedef {Function} SubFn
 * @param {String} event
 * @param {Function} listener
 * @return {Function}
 */

/**
 * @typedef {Function} PubFn
 * @param {String} event
 * @param {Object} info
 * @return {void}
 */

/**
 * @typedef {Object} PubSub
 * @property {SubFn} sub
 * @property {PubFn} pub
 */

/**
 * @return {PubSub}
 */
export function pubsub()
{
  const bus = {}

  return {
    /**
     * @type {SubFn}
     */
    sub(event, listener)
    {
      if (!bus[event]) bus[event] = { queue: [] }

      const index = bus[event].queue.push(listener) - 1

      return () => {
        delete bus[event].queue[index]
      }
    },
    /**
     * @type {PubFn}
     */
    pub(event, info)
    {
      if (!bus[event] || !bus[event].queue.length) return void

        bus[event].queue.forEach(item => {
          item(info || {})
        })
    }
  }
}
