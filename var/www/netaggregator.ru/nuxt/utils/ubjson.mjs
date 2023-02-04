/** @see https://bitbucket.org/shelacek/ubjson/src/master */

import { UbjsonEncoder } from './ubjson-encoder.mjs'
import { UbjsonDecoder } from './ubjson-decoder.mjs'

export const Ubjson = { encode, decode }

export function encode(value, options) {
    const encoder = new UbjsonEncoder(options)
    return encoder.encode(value)
}

export function decode(buffer, options) {
    const decoder = new UbjsonDecoder(options)
    return decoder.decode(buffer)
}
