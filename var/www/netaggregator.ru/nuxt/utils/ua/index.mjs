// node --experimental-json-modules index.mjs

import { RandomUserAgent } from './random-user-agent.mjs'

let userAgent

userAgent = new RandomUserAgent(/* { deviceCategory: 'mobile' } */)

console.log(userAgent.toString())
console.log(JSON.stringify(userAgent.data, null, 2))

userAgent = new RandomUserAgent({ platform: 'Win32' })

Array.from({ length: 1000 }, () => userAgent())
    .forEach(ua => {
        console.log(ua.toString())
    })

userAgent = new RandomUserAgent(/Safari/)
console.log(userAgent.toString())

userAgent = new RandomUserAgent([
    /Safari/,
    {
        connection: {
            type: 'wifi'
        },
        platform: 'MacIntel'
    }
])

console.log(userAgent.toString())
