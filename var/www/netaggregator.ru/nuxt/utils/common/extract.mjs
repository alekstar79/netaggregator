import { isObject } from './is-object.mjs'

export function extract(entity)
{
    if (Array.isArray(entity)) {
        return entity.map(item => extract(item))
    }
    if (!isObject(entity)) {
        return entity
    }

    let item, result = {}

    Object.keys(entity).forEach(key => {
        item = entity[key]

        if (Array.isArray(item) || isObject(item)) {
            item = extract(item)
        }

        result[key] = item
    })

    return result
}
