// noinspection DuplicatedCode

import { MongoClient, ObjectId } from 'mongodb'

import path from 'path'
import fs from 'fs'

let uri = 'mongodb://localhost:27017/',
    dir = process.argv.slice(2)[0]

if (!dir) {
    console.log('The directory parameter is missing')
    process.exit(-1)
}

dir = path.resolve(path.resolve(), dir)

function dirExist(dir)
{
    try {
        return fs.statSync(dir)
    } catch (err) {
        return err.code !== 'ENOENT'
    }
}

/**
 * @param {string} dir
 * @return {string[]}
 */
function throughDirectory(dir)
{
    return fs.readdirSync(dir).map(file => {
        const absolute = path.join(dir, file)

        if (fs.statSync(absolute).isDirectory()) {
            return throughDirectory(absolute)
        } else {
            return absolute
        }
    })
}

if (!dirExist(dir)) {
    console.log('Directory does not exist')
    process.exit(-1)
}

;(async client => {
    let i = 0, errors = 0, status, hash, json, data, widgets, db, collection, acknowledged

    await client.connect()

    db = client.db('app')
    collection = db.collection('covers')

    for (const file of throughDirectory(dir).filter(f => f.endsWith('json'))) {
        acknowledged = false
        status = 'success'

        try {

            json = fs.readFileSync(file).toString()
            hash = path.basename(file, '.json')

            data = JSON.parse(json)

            widgets = data.objects.filter(o => o.type.startsWith('widget')).map(o => o.type)

            ;({ acknowledged } = await collection.updateOne(
                { _id: new ObjectId(hash) },
                { $set: { widgets } },
                { upsert: true }
            ))

        } catch ({ message }) {
            status = `failure (${message})`
        }

        console.log('%s %s %s inserted %o', hash, widgets, status, acknowledged)
        i++
    }

    console.log('%o done... with %o errors', i, errors)

    await client.close()

})(new MongoClient(uri))
