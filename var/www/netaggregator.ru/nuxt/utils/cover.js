import { isObject } from './common/is-object.mjs'
import { ObjectId } from 'bson'

export const expr = /\([\s\da-zа-яё\-_@#!]*(копия|copy)[\s\da-zа-яё\-_@#!]*\)/
export const error = (content = 'cover.error') => ({ content, color: 'error' })
export const success = content => ({ content, color: 'success' })

export const mongoId = () => new ObjectId(null).toHexString()
export const exclude = (a1, a2) => a2.filter(i => !a1.includes(i))
export const include = (a1, a2) => a1.filter(i => !a2.includes(i))
export const tostamp = (h, m) => h * 3600 + m * 60

export const setname = (s, locale = 'en') => {
    const copy = `(${locale === 'en' ? 'copy' : 'копия'} ${+new Date()})`

    if (expr.test(s)) {
        return s.replace(expr, copy)
    }

    return s + ` ${copy}`
}

export function totime(stamp)
{
    if (stamp === '' || stamp === null) return null
    if (isObject(stamp)) return stamp

    const HH = `${(stamp / 3600 | 0)}`
    const mm = `${((stamp / 60 | 0) - (HH * 60))}`

    return {
        HH: HH.padStart(2, '0'),
        mm: mm.padStart(2, '0')
    }
}

export function getRange(cover, connection, ranges)
{
    try {

        if (!connection.includes(cover._id)) return null

        const { from = null, to = null } = ranges?.find(r => r._id === cover._id) || {}

        return {
            from: totime(from),
            to: totime(to),
            ...cover
        }

    } catch (e) {
    }

    return null
}

export function convert(entity)
{
    if (!isObject(entity)) return entity

    return Object.keys(entity).reduce((acc, k) => {
        if (!Object.prototype.hasOwnProperty.call(entity, k)) return acc

        if (Array.isArray(entity[k])) {
            entity[k] = entity[k].map(convert)
        }
        if (k === 'from' || k === 'to') {
            entity[k] = totime(entity[k])
        }

        return { ...acc, [k]: entity[k] }

    }, {})
}

export const modify = item => ({ ...item, _id: item._id.$oid || item._id })
export const cover = (uid, name, timezone, widgets = [], background = false) => ({
    _id: mongoId(),
    connections: [],
    widgets,
    uid,
    name,
    timezone,
    background
})
