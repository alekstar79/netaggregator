import { EventEmitter } from 'events'

export const host = typeof window !== 'undefined' ? window.location.hostname : 'worker'
export const events = ['open', 'close', 'error', 'message']

export class SocketClient extends EventEmitter
{
  constructor(options = {})
  {
    super()

    // this.supports = host === 'worker' || 'WebSocket' in window
    this.attempts = options.attempts || Infinity
    this.delay = options.delay || 1e4
    this.count = 0

    this.reconnectId = null
    this.url = options.url
    this.ws = null
  }

  isOpen()
  {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }

  connect()
  {
    if (!/netaggregator|worker/.test(host)) return

    this.ws = new WebSocket(this.url)

    events.forEach(event => {
      this.ws[`on${event}`] = e => {
        this.emit(event, e)
      }
    })

    return this
  }

  reconnect()
  {
    if (this.count <= this.attempts) {
      this.count++

      this.reconnectId && clearTimeout(this.reconnectId)
      this.reconnectId = setTimeout(
        this.connect.bind(this),
        this.delay
      )
    }

    return this
  }

  send(payload)
  {
    if (this.isOpen()) {
      this.ws.send(payload)
    }

    return this
  }

  close()
  {
    if (this.isOpen()) {
      this.ws.close()
    }

    return this
  }

  whenConnected(callback)
  {
    this.on('open', e => { callback(e) })
  }

  whenClosed(callback)
  {
    this.on('close', e => { callback(e) })
  }
}
