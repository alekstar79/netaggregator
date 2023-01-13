import { upperFirst as uf, camelCase as cc } from 'lodash/string'
import Vue from 'vue'

const load = require.context('~/components', true, /\.vue$/, 'lazy'),
    fix = f => uf(cc(f.replace(/^\.\//, '').replace(/\.\w+$/, ''))),
    set = f => ({ name: fix(f), component: () => load(f) }),
    mod = c => ({ ...c, lazy: `Lazy${c.name}` })

export function importComponents()
{
    load.keys().map(set).map(mod)
        .forEach(({ name, lazy, component }) => {
            Vue.component(name, component)
            Vue.component(lazy, component)
        })
}
