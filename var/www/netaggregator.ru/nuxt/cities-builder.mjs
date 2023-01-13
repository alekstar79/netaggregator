import path from 'path'
import fs from 'fs'

import { unique } from './utils/common/unique.mjs'

let dir = path.resolve(),

    json = path.resolve(dir, 'assets/data/vk-cities.json'),
    raw = path.resolve(dir, 'assets/data/raw-cities.txt'),

    buffer = { raw: null, json: null },
    data = { raw: null, json: null },

    result

function isExist(path)
{
    try {
        return fs.statSync(path)
    } catch (err) {
        return err.code !== 'ENOENT'
    }
}

if ([json,raw].some(path => !isExist(path))) {
    console.log('Wrong path')
    process.exit(-1)
}

buffer.json = fs.readFileSync(json)
buffer.raw = fs.readFileSync(raw)

data.json = JSON.parse(buffer.json.toString())
data.raw = buffer.raw.toString().split('\n').filter(Boolean)

console.log({
    'json-length': data.json.length,
    'raw-length': data.raw.length
})

result = data.json.filter(item => data.raw.includes(item.title)).filter(unique('title'))
result = result.sort((prev, next) => prev.id - next.id)

fs.writeFileSync(`${dir}/assets/data/cities.json`, JSON.stringify(result, null, 4))
console.log(`${dir}/assets/data/cities.json write ok`)
console.log({ 'result-length': result.length })
