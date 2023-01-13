import { getPureTreeData } from 'he-tree-vue/dist/he-tree-vue'
import vk from '@vkontakte/vk-bridge'
import { ObjectId } from 'bson'

export const replyTypes = [{ value: 1, text: 'random'  }, { value: 0, text: 'condition' }]
export const ruleTypes  = [{ value: 1, text: 'exactly' }, { value: 0, text: 'contain'   }]

export const expr = /\([\s\da-zа-яё\-_@#!]*(копия|copy)[\s\da-zа-яё\-_@#!]*\)/

/* export const conditionVars = [
    { value:  0, text: 'id пользователя'           },
    { value:  1, text: 'Пол'                       },
    { value:  2, text: 'Город'                     },
    { value:  3, text: 'Страна'                    },
    { value:  4, text: 'Возраст'                   },
    { value:  5, text: 'Имя'                       },
    { value:  6, text: 'День рождения'             },
    { value:  7, text: 'День недели'               },
    { value:  8, text: 'Текущая дата'              },
    { value:  9, text: 'Подписчик'                 },
    { value: 10, text: 'Семейное положение'        },
    { value: 11, text: 'Политические предпочтения' },
    { value: 12, text: 'Отношение к алкоголю'      },
    { value: 13, text: 'Отношение к курению'       }
]

export const operators = [
    { value: 0, text: '=', code: '&#61;',   entity: '&equals;' }, // equals sign
    { value: 1, text: '≠', code: '&#8800;', entity: '&ne;'     }, // not equal
    { value: 2, text: '<', code: '&#60;',   entity: '&lt;'     }, // less than
    { value: 3, text: '>', code: '&#62;',   entity: '&gt;'     }, // greater than
    { value: 4, text: '≤', code: '&#8804;', entity: '&le;'     }, // less or equal
    { value: 5, text: '≥', code: '&#8805;', entity: '&ge;'     }  // greater or equal
] */

export const mongoId = () => new ObjectId(null).toHexString()
export const variables = () => (['first_name','last_name','bdate','now','age'])
export const error = (content = 'chatbot.error') => ({ content, color: 'error' })
export const success = content => ({ content, color: 'success' })
export const kvPayload = (a, v) => ({ ...a, [v.split(':', 2)[0]]: v.split(':', 2)[1] })
export const send = (method, params) => vk.send('VKWebAppCallAPIMethod', { method, params })
export const clearBtn = () => ({ props: {} })

export const clone = v => { try {
    return JSON.parse(JSON.stringify(v))

} catch (e) {
} }

export const nullConfig = () => ({
        component: 'keyboard-layout',
        props: {
            orientation: 'vertical'
        },
        children: []
    })

export const setname = (s, locale = 'en') => {
    const copy = `(${locale === 'en' ? 'copy' : 'копия'} ${+new Date()})`

    if (expr.test(s)) {
        return s.replace(expr, copy)
    }

    return s + ` ${copy}`
}

export const reassign = dialogs => {
    return dialogs.map(d => ({ ...d, id: mongoId(), children: reassign(d.children) }))
}

export const find = (set, id) => {
    if (Array.isArray(set)) {
        return set.map(item => find(item, id)).filter(Boolean)[0]
    }
    if (set.id === id) {
        return set
    }
    if (set.children && set.children.length) {
        return find(set.children, id)
    }

    return undefined
}

export const remove = (set, id) => {
    if (Array.isArray(set)) {
        return set.map(item => remove(item, id)).filter(Boolean)
    }
    if (set.id === id) {
        return undefined
    }
    if (set.children && set.children.length) {
        set.children = remove(set.children, id)
    }

    return set
}

export const insertToList = (list, item, index) => {
    const array = list.slice()

    array.splice(index, 0, item)

    return array
}

export const replaceList = (list, item, index) => {
    const array = list.slice()

    array.splice(index, 1, item)

    return array
}

export const removeFromList = (list, index) => {
    const array = list.slice()

    array.splice(index, 1)

    return array
}

export const reply = (r = {}, idx) => ({
    notifications: r.notifications || {},
    email: r.email || {},

    attachments: r.attachments || [],
    conditions: r.conditions || [],
    keyboard: r.keyboard || {},
    text: r.text || '',
    value: idx
})

export const set = () => ({
    id: mongoId(),
    on: true,
    global: false,
    random: true,
    exact: true,
    attachments: [],
    children: [],
    keywords: [],
    keyboard: {},
    reply: [],
    ref: null,
    use: 0
})

export const dialog = (uid, name) => ({
    _id: mongoId(),
    connections: [],
    smalltalk: false,
    keyboard: {},
    dialogs: [],
    default: [],
    name,
    uid
})

export const transform = set => set
    ? set.map(d => {
        'attachments' in d || (d.attachments = [])

        'children' in d || (d.children = [])
        'keywords' in d || (d.keywords = [])
        'keyboard' in d || (d.keyboard = {})

        'global' in d || (d.global = false)
        'random' in d || (d.random = true)
        'exact'  in d || (d.exact = true)

        'ref' in d || (d.ref = null)
        'use' in d || (d.use = 0)
        'on'  in d || (d.on = true)

        d.reply = d.reply.map(reply)

        if (d.children.length) {
            d.children = transform(d.children)
        }

        return d
    })
    : []

export const modify = item => ({
    _id: item._id.$oid || item._id,
    connections: item.connections || [],
    smalltalk: item.smalltalk || false,
    keyboard: item.keyboard || {},
    dialogs: transform(item.dialogs),
    default: item.default || [],
    name: item.name,
    uid: item.uid
})

export const clean = list => list.map(i => {
    i = getPureTreeData(i)

    if (i.dialogs && i.dialogs.length) {
        i.dialogs = clean(i.dialogs)
    }
    if (i.children && i.children.length) {
        i.children = clean(i.children)
    }

    return i
})
