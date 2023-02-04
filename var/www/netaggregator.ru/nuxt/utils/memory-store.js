const __memory_store__ = {}

function promisify(result, error)
{
    const is = v => typeof v !== 'undefined'

    return new Promise((resolve, reject) => {
        switch (true) {
            case is(error):
                reject(error)
                break

            case is(result):
                resolve(result)
                break

            default:
                resolve()
        }
    })
}

export class MemoryStore
{
    constructor(dbname = 'app-db', storename = 'store-v1')
    {
        this.store(dbname, storename)
    }

    get type()
    {
        return 'MemoryStore'
    }

    store(dbname, storename)
    {
        const isset = (k, obj) => k in obj

        this.usestore = [dbname, storename]
            .reduce((store, key) => {
                isset(key, store) || (store[key] = {})

                return store[key]

            }, __memory_store__)

        return this
    }

    get(key, value)
    {
        return promisify(key in this.usestore ? this.usestore[key] : value)
    }

    set(key, value)
    {
        this.usestore[key] = value

        return promisify(true)
    }

    getMany(keys, values = [])
    {
        return Promise.all(keys.map((k, i) => this.get(k, values[i])))
    }

    setMany(entries)
    {
        return promisify(entries.forEach(([k, v]) => this.set(k, v)))
    }

    update(key, updater = v => v)
    {
        try {

            if (key in this.usestore) {
                this.usestore[key] = updater(this.usestore[key])
            }

            return promisify(true)

        } catch (e) {
            return promisify(null, e)
        }
    }

    del(key)
    {
        let deleted = false

        if (key in this.usestore) {
            deleted = delete this.usestore[key]
        }

        return promisify(deleted)
    }

    clear()
    {
        this.usestore = {}

        return promisify()
    }

    keys()
    {
        return promisify(Object.keys(this.usestore))
    }

    values()
    {
        return promisify(Object.values(this.usestore))
    }

    entries()
    {
        return promisify(Object.entries(this.usestore))
    }
}
