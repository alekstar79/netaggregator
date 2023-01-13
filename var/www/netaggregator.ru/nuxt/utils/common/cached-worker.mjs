import { createCachedFunction } from './cached.mjs'
import { workerInit } from './worker.mjs'

/**
 * @param {function} worker
 * @return {function(*=): Promise<unknown>}
 * @example
 *
 * const run = createCachedWorker(({ data: num }) => {
 *     const calcFibonacci = n => n <= 1 ? n : calcFibonacci(n - 1) + calcFibonacci(n - 2)
 *     self.postMessage({ num, fib: calcFibonacci(num) })
 *     self.close()
 * })
 *
 * Promise.resolve()
 *    .then(() => run(10))
 *    .then(result => { console.info('worker with arg 10 finished', result) })
 *    .catch(e => { console.log('web worker failed: ', e.message) })
 *    .then(() => run(20))
 *    .then(result => { console.info('worker with arg 20 finished', result) })
 *    .catch(e => { console.log('web worker failed: ', e.message) })
 *    .then(() => run(30))
 *    .then(result => { console.info('worker with arg 30 finished', result) })
 *    .catch(e => { console.log('web worker failed: ', e.message) })
 */
export function createCachedWorker(worker)
{   // noinspection JSValidateTypes
    return createCachedFunction(workerInit(worker))
}
