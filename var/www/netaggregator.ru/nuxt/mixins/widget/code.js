import { strrepeat, predefine, checkingUpdates } from '~/utils/widget.js'
import { isObject } from '~/utils/common/is-object.mjs'
import { rndstring } from '~/utils/common/symbols.mjs'
import { rtrim } from '~/utils/common/is-string.mjs'

import { values, stopkeys, passkeys } from '~/assets/data/widget.js'
import { xssEncode } from '~/utils/htmlentity.mjs'

import merge from 'lodash/merge'

const cut = /^(''\s*\+\s*)|(\s*\+\s*'')$/g,
    exp = /{([._[\]0-9\w]+)}/g,

    replace = (_, p1) => p1 === 'uid' ? "id' + uid + '" : `' + ${p1} + '`,

    exclude = (key, chunk, checkpass) => {
        if (stopkeys.includes(key)) return true

        return !chunk[key] && checkpass
            ? !passkeys.includes(key)
            : !chunk[key]
    },

    adduction = (v, r) => {
        if (v === null) return v

        v = v.toString()
        v = xssEncode(v)

        if (!/^\d+$/.test(v)) {
            v = `'${r ? v.replace(exp, replace) : v}'`
        }

        return v.replace(cut, '')
    }

export default {
    data: () => ({
        replace: true,
        altermap: { sex: {}, lang: {} },
        alternate: new Set(),
        variables: new Set(),
        values: {}
    }),
    computed: {
        hash() {
            return this.authorized && this.group_id ? `g${this.group_id}-${this.entity}` : 'unknown'
        }
    },
    methods: {
        refresh()
        {
            this.altermap = { sex: {}, lang: {} }
            this.alternate = new Set()
            this.variables = new Set()
            this.values = values()
        },
        comment(name, code = null)
        {
            const cl = `// ${name}-${this.hash}\n`

            return code ? `${cl}${code}\n\n` : cl
        },
        clean(widget)
        {
            let value = null, data = null, m = null

            switch (true) {
                case Array.isArray(widget):
                    value = widget.map(this.clean).filter(Boolean)
                    data = value.length ? value : null
                    break

                case isObject(widget):
                    Object.keys(widget).forEach(key => {
                        if (exclude(key, widget)) return

                        value = Array.isArray(widget[key]) || isObject(widget[key])
                            ? this.clean(widget[key])
                            : widget[key]

                        if (value) {
                            data || (data = {})
                            data[key] = value

                            while ((m = exp.exec(value))) {
                                this.variables.add(m[1])
                            }
                        }
                    })
                    break

                default:
                    data = widget
            }

            return data
        },
        stringify(widget, lvl = 0)
        {
            let next = strrepeat(lvl + 1),
                prev = strrepeat(lvl),
                code = ''

            if (Array.isArray(widget)) {
                code = widget.map(w => this.stringify(w, lvl + 1))
                    .filter(Boolean).join(`,\n${next}`)

                return code = rtrim(code, `,\n${next}`)
                    ? `[\n${next}${code}\n${prev}]`
                    : ''
            }

            Object.keys(widget).forEach(key => {
                if (exclude(key, widget, this.replace)) return

                let nested = Array.isArray(widget[key]) || isObject(widget[key]),

                    value = nested
                        ? this.stringify(widget[key], lvl + 1)
                        : adduction(widget[key], this.replace)

                code += value ? `${next}${key}: ${value},\n` : ''
            })

            code = rtrim(code, ',\n')

            return code ? `{\n${code}\n${prev}}` : ''
        },
        substitute(base, alter, key, entity)
        {
            let variable = rndstring(5, 'lower'),
                v = 'alter.' + variable,
                b = base[key] || '',
                a = alter[key],
                m = null

            if (!/^{alter\.\w+}$/g.test(b)) {
                this.values[v] = adduction(b, true)

                while ((m = exp.exec(b))) {
                    this.variables.add(m[1])
                }
            } else {
                v = exp.exec(b)[1]
            }

            this.altermap[entity][v] = adduction(a, true)
            this.alternate.add(v)

            while ((m = exp.exec(a))) {
                this.variables.add(m[1])
            }

            base[key] = '{' + v + '}'
        },
        trace(base, alter, entity)
        {
            switch (true) {
                case Array.isArray(alter):
                    return alter.map((a, i) => this.trace(base[i], a, entity))

                case isObject(alter):
                    Object.keys(alter).forEach(key => {
                        if (Array.isArray(alter[key]) || isObject(alter[key])) {
                            base[key] = this.trace(base[key], alter[key], entity)
                        } else {
                            this.substitute(base, alter, key, entity)
                        }
                    })
            }

            return base
        },
        logic(base, { sex, lang })
        {
            lang = this.clean(this.prepare(lang))
            sex = this.clean(this.prepare(sex))
            base = this.prepare(base)

            if (!lang && !sex) return base

            base = merge(this.prepare(this.map[this.entity]()), base)
            this.variables.add('alter')

            if (sex) {
                base = this.trace(base, sex, 'sex')
                this.variables.add('sex')
            }
            if (lang) {
                base = this.trace(base, lang, 'lang')
                this.variables.add('lang')
            }

            return base
        },
        build()
        {
            let { variables, alternate, altermap, values } = this,
                lang, sex, extend, data, real, pv, up

            // noinspection JSValidateTypes
            this.data || (this.data = {})

            try {

                sex = this.alter.female[this.entity]
                lang = this.alter.lang[this.entity]

                extend = this.clean(this.data.readers) || {}
                data = this.logic(this.data, { sex, lang })
                real = this.clean(data)

                pv = predefine(variables, alternate, altermap, values, extend)
                up = checkingUpdates(pv, this.data.variables)

                return {
                    data: real ? this.stringify(data) : '{}',
                    code: up ? pv : this.data.variables
                }

            } catch (e) {
            }

            return { data: '{}', code: '' }
        },
        getCode(replace = true)
        {
            this.refresh()

            let back = this.comment('return', 'return data;').trim() + '\n',
                data,
                code

            this.replace = replace

            if (this.authorized) {
                const build = this.build()

                code = build.code ? this.comment('variables', build.code) : ''
                data = this.comment('data', `var data = ${build.data};`)
            } else {
                data = this.comment('data', 'var data = {};')
                code = ''
            }

            this.replace = true

            return code + data + back
        }
    }
}
