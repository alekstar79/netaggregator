/**
* @see https://habr.com/ru/company/ruvds/blog/448920
* @see https://adamschwartz.co/log
*/

const style = 'text-shadow: #a0f9fa 0 0 2px; font-family: monospace; font-size: 1.4em;',
    desc = 'The app is develop with love and a little bit: Javascript, Nuxt, Webpack. Project completion date: Dec / 2021',
    look = 'We are looking for developers!',
    title = 'Greet you! 🙋'

export function greeting()
{
    try {

        console.group(`%c${title}`, style)
        console.log(`%c${desc}`, style)
        console.log(`%c${look}`, style)
        console.groupEnd()

    } catch (e) {
    }
}
