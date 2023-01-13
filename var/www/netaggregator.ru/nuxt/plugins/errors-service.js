/** @see https://medium.com/js-dojo/vue-js-global-errors-handling-c58aac8aaf0f */

// import Rollbar from 'rollbar'

export const IS_DEV = process.env.NODE_ENV === 'development'

export class ErrorServiceManager
{
    static self = null

    static get instance()
    {
        ErrorServiceManager.self || (ErrorServiceManager.self = new ErrorServiceManager())

        return ErrorServiceManager.self
    }

    constructor()
    {
        this.rollbar = null
        /* this.rollbar = new Rollbar({
            payload: { environment: process.env.NODE_ENV },
            accessToken: process.env.ROLLBAR_KEY,
            captureUnhandledRejections: true,
            captureUncaught: true
        }) */

        switch (true) {
            case typeof window !== 'undefined':
                this.unhandledClientRejection()
                break
            case typeof process !== 'undefined':
                this.unhandledNodeRejection()
                break
        }
    }

    unhandledClientRejection()
    {
        window.addEventListener('unhandledrejection', e => {
            e.preventDefault()
            this.error(e)
        })

        window.addEventListener('error', e => {
            e.preventDefault()
            this.error(e)

        }, { capture: true })
    }

    unhandledNodeRejection()
    {
        process.on('uncaughtException', this.error.bind(this))
    }

    warn(warn)
    {
        IS_DEV || !this.rollbar ? console.warn(warn) : this.rollbar.warn(warn)
    }

    error(error /*, vm, info */)
    {
        if (!IS_DEV && !this.rollbar) return

        switch (true) {
            case !IS_DEV && !this.rollbar:
                return

            case IS_DEV:
                this.rollbar
                    ? this.rollbar.error(error)
                    : console.error(error)

                break

            default:
                this.rollbar.error(error)
        }
    }
}
