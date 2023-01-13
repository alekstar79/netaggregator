import { AsyncArray } from '../utils/async-array.mjs'
import { Fabric } from '../utils/canvas/import.mjs'

import { DrawerStore } from './drawer-store.mjs'
import { Drawer } from './drawer.mjs'
import { Upload } from './upload.mjs'

import chunk from 'lodash/chunk.js'
import cluster from 'cluster'
import os from 'os'

/**
* By the way, look at this
* @see https://www.youtube.com/watch?v=LC5FC3FdzAE
* @see https://github.com/bleedingcode/nodejs-performance-optimizations
*/
class App
{
    /** @type Intl.DateTimeFormatOptions */
    static DateTimeFormatOptions = { second: '2-digit', minute: '2-digit', hour: '2-digit' }

    /** @type {{SIGTERM: function, SIGINT: function }} */
    static LISTENERS = { SIGTERM: null, SIGINT: null }

    /** @type Number */
    static cores = 2 * os.cpus().length

    /** @type Object */
    static perform = {}

    /** @type Object */
    static process = {}

    /** @type String */
    static time

    set process(pid)
    {
        App.process[pid] = true

        if (Object.keys(App.process).length >= App.cores) {
            !this.timeout && this.next()
        }
    }

    get process()
    {
        return App.process
    }

    set busy(wid)
    {
        App.perform[wid] = !App.perform[wid]
    }

    get busy()
    {
        return App.perform
    }

    set time(v)
    {
        App.time = v

        const workers = Object.keys(cluster.workers)

        if (!workers.length || workers.some(id => !App.perform[id])) {
            this.make(v).catch(console.warn)
        }
    }

    get time()
    {
        return App.time
    }

    constructor()
    {
        this.timeout = null
        this.drawer = null
        this.count = 0
    }

    next()
    {
        const date = new Date()

        this.timeout = setTimeout(this.next.bind(this), 1000 * (60 - date.getSeconds()))
        this.time = date.toLocaleTimeString('ru-RU', App.DateTimeFormatOptions)

        return this
    }

    draw(count, struct, idx)
    {
        return this.drawer.draw(struct, idx, count)
    }

    async start({ task, count })
    {
        for await (const tasks of AsyncArray.from(chunk(task, this.drawer.pool.length))) { try {
            await Upload.setup(Promise.all(tasks.map(this.draw.bind(this, count))))
        } catch (e) {
        } }
    }

    async make(/* time */)
    {
        let list = chunk(await DrawerStore.get(), Math.ceil(DrawerStore.length / App.cores)),
            workers = Object.keys(cluster.workers),
            self = this,
            i = 0,
            idx

        ;(function next() {
            while (list.length) {
                idx = i++ % workers.length

                if (!self.busy[workers[idx]]) {
                    self.send({ task: list.shift(), count: self.count }, workers[idx])
                    self.busy = workers[idx]

                } else if (!idx) {
                    setTimeout(next, 3)
                    break
                }
            }

            if (!list.length) {
                self.count++
            }
        })()
    }

    send(message, id)
    {
        try {

            cluster.workers[id].send(message)

        } catch (e) {
            console.warn(`Cannot send message to worker #${id}: ${e.message}`)
        }
    }

    ready()
    {
        process.send({ ready: process.pid })
    }

    run()
    {
        return new Promise((resolve, reject) => {
            Fabric.resolve().then(Drawer.init)
                .then(async drawer => {
                    this.drawer = drawer

                    process.on('message', message => {
                        switch (true) {
                            case 'task' in message:
                                this.start(message)
                                    .catch(console.warn)
                                    .finally(() => {
                                        process.send({ done: process.pid })
                                    })

                                break

                            case 'shutdown' in message:
                                setTimeout(reject, 1e3)
                                break
                        }
                    })

                    if (!await Upload.init()) {
                        return reject()
                    }

                    this.ready()

                }).catch(reject)
        })
    }

    createWorker()
    {
        const worker = cluster.fork()
            .on('online', () => { /* console.info(`start worker #${worker.id} pid: ${worker.process.pid}`) */ })
            .on('exit', code => { // when worker was stoped
                if ((worker.exitedAfterDisconnect || worker.suicide) === true || code === 0) {
                    console.info(`worker #${worker.id} pid: ${worker.process.pid} was exit`)
                } else {
                    console.warn(`worker #${worker.id} pid: ${worker.process.pid} was died`)
                    this.createWorker()
                }
            })
            .on('message', message => {
                switch (true) {
                    case 'ready' in message:
                        console.log(`worker #${worker.id} pid: ${worker.process.pid} ready`)
                        this.process = message.ready
                        break

                    case 'done' in message:
                        this.busy = worker.id
                        // this.kill(message.done)
                        break
                }
            })
    }

    createWorkers(n)
    {
        while (n-- > 0) {
            this.createWorker()
        }
    }

    kill(pid)
    {
        Object.keys(cluster.workers).forEach(id => {
            if (pid === cluster.workers[id].process.pid) {
                console.log(`wowker: ${cluster.workers[id].process.pid} will be killed`)
                this.send({ shutdown: true }, id)
            }
        })
    }

    static async shutdown(signal = 'SIGTERM')
    {
        Object.keys(cluster.workers).forEach(id => {
            const worker = cluster.workers[id]

            worker.removeAllListeners()
            worker.process.kill(signal)
        })

        await DrawerStore.close()

        App.offlisteners()

        process.exit()
    }

    static onlisteners()
    {
        Object.keys(App.LISTENERS).forEach(SIG => {
            process.on(SIG, App.LISTENERS[SIG] = App.shutdown.bind(null, SIG))
        })
    }

    static offlisteners()
    {
        Object.keys(App.LISTENERS).forEach(SIG => {
            App.LISTENERS[SIG] && process.off(SIG, App.LISTENERS[SIG])
        })
    }

    static async init()
    {
        const app = new App()

        switch (true) {
            case cluster.isPrimary:
                if (!await DrawerStore.connect()) {
                    throw new Error('Connection to the storage failed')
                }

                App.offlisteners()
                App.onlisteners()

                app.createWorkers(App.cores)
                break

            case cluster.isWorker:
                app.run().catch(() => {
                    Upload.close()
                    process.exit()
                })
        }
    }
}

App.init().catch(App.shutdown)
