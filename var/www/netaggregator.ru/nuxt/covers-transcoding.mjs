// /var/www/netaggregator.ru/nuxt/static/dcover/default/structs
import { encode } from './utils/ubjson.mjs'

import path from 'path'
import fs from 'fs'

let dir = process.argv.slice(2)[0]

if (!dir) {
    console.log('The directory parameter is missing')
    process.exit(-1)
}

dir = path.resolve(path.resolve(), dir)

try {
    fs.statSync(dir)
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('Directory does not exist')
        process.exit(-1)
    }
}

/**
 * @see https://stackoverflow.com/a/12101012
 * @see https://github.com/miguelmota/arraybuffer-to-buffer/blob/master/arraybuffer-to-buffer.js
 * @param {ArrayBuffer} ab
 * @return {Buffer}
 */
function toBuffer(ab)
{
    const buf = Buffer.alloc(ab.byteLength),
        view = new Uint8Array(ab)

    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i]
    }

    return buf
}

fs.readdirSync(dir).forEach(f => {
    const buffer = fs.readFileSync(`${dir}/${f}`),
        data = JSON.parse(buffer.toString()),
        file = path.basename(f, '.json')

    fs.writeFileSync(`${dir}/${file}.wxg`, toBuffer(encode(data)))
    console.log(`${file}.wxg write ok`)
})
