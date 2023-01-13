/**
* @see https://dev.to/ayushgp/scaling-websocket-connections-using-shared-workers-14mj
* @see https://developer.mozilla.org/ru/docs/Web/API/BroadcastChannel
*/

import { SocketClient, events } from '~/utils/socket'
import { BroadcastChannel } from 'broadcast-channel'

let close = false,
    count = {},
    conn = {},

    channel = {
        mailing: new BroadcastChannel('MailingChannel'),
        stream: new BroadcastChannel('StreamChannel')
    }

function init({ url, channel: ch })
{
    const client = new SocketClient()

    client.url = url

    events.forEach(event => client.on(event, ({ data }) => {
        channel[ch].postMessage({ message: data, event })
    }))

    client.whenConnected(() => {
        channel[ch].postMessage({ url, message: 'Connected' })
    })

    client.whenClosed(() => {
        channel[ch].postMessage({ url, message: 'Closed' })
    })

    return client
}

function increase({ url })
{
    if (!(url in count)) {
        count[url] = 0
    }

    count[url]++
}

function decrease({ url })
{
    if (!(url in count)) {
        count[url] = 0
    }

    count[url]--
}

self.addEventListener('connect', e => {
    e.source.addEventListener('message', ({ data }) => {
        switch (data.action) {
            case 'start':
                // console.log('start %o %o', data.channel, data.url)

                increase(data)

                if (!conn[data.url]) {
                    conn[data.url] = init(data)
                }
                if (!conn[data.url].isOpen()) {
                    conn[data.url].connect()

                } else {
                    channel[data.channel].postMessage({
                        note: 'Connection already inited',
                        event: 'open'
                    })
                }

                close = false
                break

            case 'send':
                // console.log('send %o %o', data.channel, data.url, data.payload)

                if (conn[data.url] && !close) {
                    conn[data.url].send(data.payload)

                } else {
                    channel[data.channel].postMessage({
                        error: 'Connection ID is not correct'
                    })
                }
                break

            case 'reconnect':
                // console.log('reconnect %o %o', data.channel, data.url)

                if (conn[data.url] && !close) {
                    conn[data.url].reconnect()

                } else {
                    channel[data.channel].postMessage({
                        error: 'Connection ID is not correct'
                    })
                }
                break

            case 'close':
                // console.log('close %o %o', data.channel, data.url)

                decrease(data)

                if (count[data.url] > 0) return

                if (conn[data.url]) {
                    conn[data.url].close()
                    close = true

                } else {
                    channel[data.channel].postMessage({
                        error: 'Connection ID is not correct'
                    })
                }
        }
    }, false)

    e.source.start()

}, false)
