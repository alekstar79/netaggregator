/**
* @see https://medium.com/@vKuka/%D0%B2%D0%B5%D0%B1-%D0%B2%D0%BE%D1%80%D0%BA%D0%B5%D1%80%D1%8B-%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81-%D0%B2%D0%BE%D1%80%D0%BA%D0%B5%D1%80%D1%8B-%D0%B8-%D0%B2%D0%BE%D1%80%D0%BA%D0%BB%D0%B5%D1%82%D1%8B-1e2f561312fd
* @see https://github.com/pixolith/fabricjs-async-web-worker-filters/blob/master/dist/filters/colorMatrixFilterWorker.js
* @see https://www.youtube.com/watch?v=ezHWb0tKTaA
* @param {Function} job
* @return {function(*=): Promise<unknown>}
*/
export function workerInit(job)
{
    const url = window.URL.createObjectURL(new Blob(
        [`"use strict";\nself.onmessage = ${job.toString()}`],
        { type: 'text/javascript' }
    ))

    return data => new Promise((resolve, reject) => {
        const worker = new Worker(url, { type: 'module' })

        worker.onerror = reject

        worker.onmessage = e => {
            resolve(e.data)
        }

        worker.postMessage(data)
    })
}
