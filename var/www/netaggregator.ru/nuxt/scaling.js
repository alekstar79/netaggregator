// note: required exactly node version 10.21.0
// node scaling.js path/to/directory

const g = require('responsive-images-generator/lib'),
    path = require('path'),
    fs = require('fs')

let dir = process.argv.slice(2)[0]

if (!dir) {
    console.log('The directory parameter is missing')
    process.exit(-1)
}

dir = path.resolve(__dirname, dir)

try {
    fs.statSync(dir)
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('Directory does not exist')
        process.exit(-1)
    }
}

const read = dir => fs.readdirSync(dir).map(file => `${dir}/${file}`)
const pattern = /.*(@[0-9]{0,10}x)$/
const options = {
    withoutEnlargement: true,
    skipOnEnlargement: true,
    flatten: true
}

const configs = [
    { width: '20%',  rename: { suffix: '@1x' }, ...options },
    { width: '40%',  rename: { suffix: '@2x' }, ...options },
    { width: '60%',  rename: { suffix: '@3x' }, ...options },
    { width: '80%',  rename: { suffix: '@4x' }, ...options },
    { width: '100%', rename: { suffix: '@5x' }, ...options }
]

g.generateResponsiveImages(read(dir), configs, {})
    .then(() => g.renameImagesToSize(read(dir), pattern))
    .then(() => console.log('Done...'))
