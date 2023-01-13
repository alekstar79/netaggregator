// node nuxt/utils/canvas/fonts/builder.js

const lodash = require('lodash/string'),
    path = require('path'),
    fs = require('fs')

// <publicPath>/var/www/netaggregator.ru/nuxt/assets/opentype
const writeFileAsync = fs.promises.writeFile,
    fonts = path.resolve(__dirname, '/assets/opentype'),
    file = path.resolve(__dirname, '/assets/css'),
    data = path.resolve(__dirname, '/assets'),
    read = dir => fs.readdirSync(dir)

const kc = lodash.kebabCase

function checkDir(dir)
{
    try {
        fs.statSync(dir)
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`Directory ${dir} does not exist`)
            process.exit(-1)
        }
    }
}

checkDir(fonts)
checkDir(file)
checkDir(data)

const list = read(fonts)

const fontface = list.reduce((acc, font) => {
    const data = font.split('.')
    const type = data[1] === 'ttf' ? 'truetype' : 'opentype',
        family = data[0]

    let weight = 'normal'
    let style = 'normal'

    if (/italic/i.test(family)) {
        style = 'italic'
    }
    if (/bold/i.test(family)) {
        weight = 'bold'
    }

    return acc + `@font-face {
    font-family: '${family}';
    src: url('../opentype/${font}') format('${type}');
    font-weight: ${weight};
    font-style: ${style};
    font-display: swap;
}\n`
}, '')

const classes = list.reduce((acc, font) => {
    const data = font.split('.')

    const family = data[0],
        klass = kc(family)

    return acc + `.${klass} {
    font-family: '${family}', serif;
}\n`
}, '')

const array = list.reduce((acc, font) => acc + `'${font}',\n`, '')
const js = `export const list = [\n${array}]\n`;

(async function() {
    try {

        await Promise.all([
            writeFileAsync(`${file}/opentype.css`, fontface, { flag: 'w+' }),
            writeFileAsync(`${file}/classes.css`, classes, { flag: 'w+' }),
            writeFileAsync(`${data}/fonts.js`, js, { flag: 'w+' })
        ])

    } catch (error) {
        console.log(error)
    }
})()
