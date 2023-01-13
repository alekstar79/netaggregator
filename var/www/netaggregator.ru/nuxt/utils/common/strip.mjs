import { isString } from './is-string.mjs'

export function stripHash(string)
{
    return isString(string) ? string.replace(/(&#[\d]+;)|(&[a-z]+;)/gi, '') : string
}

export function stripTags(string)
{
    return isString(string) ? string.replace(/<\/?[^>]+>/gi, '') : string
}
