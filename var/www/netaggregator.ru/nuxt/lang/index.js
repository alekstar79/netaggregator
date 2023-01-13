/**
* @see http://kazupon.github.io/vue-i18n/en/messages.html
*/
const fix = f => f.replace(/(\.\/|\.json$)/g, '').split('/'),
    req = require.context('.', true, /\.json$/),
    translations = {}

req.keys().forEach(file => {
    if (['./index.js','./en.js','./ru.js'].includes(file)) return

    const path = fix(file)

    path.reduce((o, s, i) => {
        if (o[s]) return o[s]

        o[s] = i + 1 === path.length
            ? req(file)
            : {}

        return o[s]
    }, translations)
})

export default translations
