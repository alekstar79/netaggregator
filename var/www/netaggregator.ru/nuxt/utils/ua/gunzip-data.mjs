import { gunzipSync } from 'zlib'
import fs from 'fs'

const gunzipData = (inputFilename) => {
    if (!inputFilename || !inputFilename.endsWith('.gz')) {
        throw new Error('Filename must be specified and end with `.gz` for gunzipping')
    }

    const outputFilename = inputFilename.slice(0, -3)
    const compressedData = fs.readFileSync(inputFilename)
    const data = gunzipSync(compressedData)

    fs.writeFileSync(outputFilename, data)
}

if (process.argv[2]) {
    gunzipData(process.argv[2])
}
