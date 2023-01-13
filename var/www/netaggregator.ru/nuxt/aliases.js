/** @see https://qna.habr.com/q/634404 */

const path = require('path')
const root = path.resolve(__dirname)
const list = ['components','directives','layouts','middleware','mixins','plugins','utils','lang','workers']

module.exports = {
    resolve: {
        extensions: ['.js','.cjs','.mjs','.json','.vue','.ts'],
        root,

        alias: {
            ...list.reduce((a, d) => ({ ...a, [d]: path.resolve(__dirname, d) }), {}),

            '@': root,
            '~': root
        }
    }
}
