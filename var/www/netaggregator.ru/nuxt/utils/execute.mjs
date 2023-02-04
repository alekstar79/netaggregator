import { ltrim } from './common/trim.mjs'

export class Execute
{
    static MAX_API_CALLS  = 25

    static CODE = /{{code}}/i

    constructor(method, params = {}, field = '')
    {
        if (!method) return

        this.method = ltrim(method, '/')
        this.params = params
        this.code = this._code(
            this.method,
            this.params,
            field
        )

        this.requests = []
        this.wrap = ''
    }

    /**
     * @param {String} method
     * @param {Object} params
     * @param {String} field
     * @return {String}
     * @private
     */
    _code(method, params, field)
    {
        const json = params ? JSON.stringify(params) : ''

        if (field) {
            field = `.${field}`
        }

        return `API.${method}(${json})${field}`
    }

    /**
     * @param {String} code
     * @return {String}
     */
    wrapper(code)
    {
        if (!Execute.CODE.test(this.wrap)) {
            throw new Error('Missing code mark')
        }

        return this.wrap.replace(Execute.CODE, code)
    }

    calc(all)
    {
        const calls = Math.ceil((all - this.params.offset) / this.params.count)

        return calls > Execute.MAX_API_CALLS ? Execute.MAX_API_CALLS : calls
    }

    countRequests()
    {
        return this.requests.length
    }

    getMethod()
    {
        return this.method
    }

    getCode(g = ',', token = null)
    {
        if (this.countRequests() > 24) {
            throw new Error('Exceeded the limit on the number of requests')
        }

        let execute = this.code, params = {}

        if (this.requests.length) {
            for (const request of this.requests) {
                execute += (execute ? g : '') + request.code
            }
        }
        if (this.wrap !== '') {
            params.code = this.wrapper(execute)
        } else {
            params.code = `return [${execute}];`
        }
        if (token) {
            params.access_token = token
        }

        return ['/execute', params, 'POST']
    }

    setWrapper(wrap)
    {
        this.wrap = wrap

        return this
    }

    /**
     *
     * @param {Execute} exe
     * @return {Execute}
     */
    append(exe)
    {
        this.requests.push(exe)

        return this
    }

    addCode(params, fields = '')
    {
        const code = this._code(this.method, params, fields)

        if (!this.params) {
            this.params = params
            this.code = code
            return this
        }

        const clone = new Execute()

        Object.assign(clone, this)

        clone.requests = []
        clone.code = code

        return this.append(clone)
    }

    repeat(set)
    {
        return this.addCode(set)
    }

    dynamic(count)
    {
        let stop = this.calc(count),
            step = 1

        while (step < stop) {
            this.params.offset += this.params.count
            this.addCode(this.params)
            step++
        }

        return this.params.offset
    }

    static multiple(method, data, field = '')
    {
        return data.reduce((q, set) => {
            return q instanceof Execute ? q.addCode(set, field) : new Execute(method, set, field)
        }, null)
    }
}
