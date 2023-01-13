import isObject from 'lodash/isObject'

const error = content => ({ content, color: 'error', raw: true })

export function errorHandler({
    error: { error_code: _code, error_msg: msg } = {},
    error_data: { error_code, error_reason } = {},
    message
})
{
    let reason = error_reason, code = error_code

    if (isObject(reason)) {
        reason = reason.error_msg
        code = reason.error_code
    }
    if (!reason && msg) {
        reason = msg
        code = _code
    }
    if (!reason) {
        reason = message
    }

    return { code, reason }
}

export default {
    methods: {
        errorHandler(e, suppress = false)
        {
            const { code, reason } = errorHandler(e)

            this.error = { error_code: code, error_reason: reason }

            if (!suppress && reason) {
                this.$bus.$emit('snack', error(reason))
            }
        }
    }
}
