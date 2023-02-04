import * as store from 'idb-keyval'

export class IdbStore
{
  constructor(dbname = 'app-db', storename = 'store-v1')
  {
    this.store(dbname, storename)
  }

  get type()
  {
    return 'IdbStore'
  }

  store(dbname, storename)
  {
    this.usestore = store.createStore(dbname, storename)

    /* return new Promise((resolve, reject) => {
        const req = window.indexedDB.open(dbname),
          dbp = store.promisifyRequest(req)

        req.onerror = reject
        req.onupgradeneeded = () => {
          req.result.createObjectStore(storename)
          this.usestore = (mode, cb) => dbp.then(db => cb(db.transaction(storename, mode).objectStore(storename)))
          resolve(this)
        }
    }) */

    return this
  }

  get(key, value)
  {
    const fn = v => typeof v === 'undefined' ? value : v

    return store.get(key, this.usestore).then(fn)
  }

  set(key, value)
  {
    return store.set(key, value, this.usestore)
  }

  getMany(keys, values)
  {
    const fn = r => r.map((v, i) => typeof v !== 'undefined' ? v : values[i])

    return store.getMany(keys, this.usestore).then(fn)
  }

  setMany(entries)
  {
    return store.setMany(entries, this.usestore)
  }

  update(key, updater = v => v)
  {
    return store.update(key, updater, this.usestore)
  }

  del(key)
  {
    return store.del(key, this.usestore)
  }

  clear()
  {
    return store.clear(this.usestore)
  }

  keys()
  {
    return store.keys(this.usestore)
  }

  values()
  {
    return store.values(this.usestore)
  }

  entries()
  {
    return store.entries(this.usestore)
  }
}
