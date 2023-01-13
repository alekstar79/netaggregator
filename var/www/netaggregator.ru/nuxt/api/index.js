// import { expressCspHeader, SELF } from 'express-csp-header'

/**
* Vk Authentication
* @see http://expressjs.com/en/resources/middleware/session.html
* @see http://www.passportjs.org/packages/passport-vkontakte
* @see https://github.com/stevebest/passport-vkontakte
* @see https://github.com/zeu45/auth-vk
* @see https://polyakovdmitriy.ru/node-js-vkontakte
*/

import express from 'express'
import routes from './routes'

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* app.use(expressCspHeader({
    directives: {
        'default-src': [SELF, 'favicon.ico'],
        'img-src': [SELF]
    }
})) */

app.use(routes)

export default app
