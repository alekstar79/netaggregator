// noinspection DuplicatedCode

import { MongoClient } from 'mongodb'

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

function converter(files)
{
    files = files.filter(set => set.length)

    const extensions = { json: 1, wxg: 1, png: 1 }

    return files.map(set => set.reduce((a, f) => {
        let ext = path.extname(f).slice(1)

        return ext in extensions
            ? { ...a, [ext]: f }
            : a

    }, {}))
}

if (!dirExist(dir)) {
    console.log('Directory does not exist')
    process.exit(-1)
}

const templates = `${dir}/_templates`
const structs = `${dir}/_structs`

;(async client => { try {
    let db, collection

    await client.connect()

    db = client.db('app')
    collection = db.collection('covers')

    if (!dirExist(structs)) {
        fs.mkdirSync(structs)
    }
    if (!dirExist(templates)) {
        fs.mkdirSync(templates)
    }

    for (const item of converter(throughDirectory(dir))) {
        const { insertedId } = await collection.insertOne({ version: 4.0 })

        item.json && fs.renameSync(item.json, `${structs}/${insertedId}.json`)
        item.wxg && fs.renameSync(item.wxg, `${structs}/${insertedId}.wxg`)
        item.png && fs.renameSync(item.png, `${templates}/${insertedId}.png`)

        console.log(path.basename(path.dirname(item.json)))
    }

    console.log('done...')

    await client.close()

} catch (e) {
    console.log(e)

}})(new MongoClient(uri))
