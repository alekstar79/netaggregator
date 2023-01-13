// noinspection DuplicatedCode

import { MongoClient } from 'mongodb'

import path from 'path'
import fs from 'fs'

let dir = path.resolve(path.resolve(), ''),
    uri = 'mongodb://localhost:27017/'

function dirExist(dir)
{
    try {
        return fs.statSync(dir)
    } catch (err) {
        return err.code !== 'ENOENT'
    }
}

if (!dirExist(dir)) {
    console.log('Directory does not exist')
    process.exit(-1)
}

;(async client => {
    let db, collection, json

    await client.connect()

    db = client.db('app')
    collection = db.collection('currency')

    json = (await collection.find({}, { projection: { _id: 0 } }).toArray())[0]

    fs.writeFileSync(`${dir}/currency.json`, JSON.stringify(json, null, 4))
    console.log('done...')

    await client.close()

})(new MongoClient(uri))
