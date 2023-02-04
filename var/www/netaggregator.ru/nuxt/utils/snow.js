import { nextFrame, cancelFrame } from './callbacks.mjs'
import { debounce } from './common/debounce.mjs'

const { random } = Math,

  styles = {
    pointerEvents: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    opacity: .8,
    zIndex: 9999
  }

function Particle(x, y, s)
{
  this.x = x
  this.y = y

  this.r  = random() + .25 * s
  this.xs = random() * this.r * 4 - 2
  this.ys = random() * this.r * 2 + 1
}

/**
 * Not used in project
 */
export class Snow
{
  enable = false

  color = 'rgb(255,255,255)'
  count = 0
  size = 10

  height = 0
  width = 0

  particles = []
  frame = null
  speed = .2

  cnv = null
  ctx = null

  static init()
  {
    return (new Snow()).start()
  }

  constructor({ color = 'rgb(255,255,255)', size = 10, speed = .2 } = {})
  {
    this.resize = debounce.call(this, this.setCanvasSize, 90)

    this.speed = speed
    this.color = color
    this.size = size

    this.remove()
    this.create()
    this.setCanvasSize()
    this.onResize()

    document.body.appendChild(this.cnv)
  }

  setCanvasSize()
  {
    this.cnv.height = this.height = window.innerHeight
    this.cnv.width = this.width = window.innerWidth

    this.count = .26 * window.innerWidth
  }

  onResize()
  {
    window.addEventListener('resize', this.resize)
  }

  offResize()
  {
    window.removeEventListener('resize', this.resize)
  }

  start()
  {
    this.particles = []
    this.enable = true

    for (let p = 0; p < this.count; p++) {
      this.particles.push(new Particle(random() * this.width, random() * this.height, this.size))
    }

    this.draw()

    return this
  }

  draw()
  {
    this.frame = nextFrame(this.draw.bind(this))

    if (!this.ctx) return

    this.ctx.clearRect(0, 0, this.width, this.height)

    for (let p, i = 0; i < this.particles.length; i++) {
      p = this.particles[i]

      this.ctx.beginPath()
      this.ctx.fillStyle = this.color
      this.ctx.arc(p.x, p.y, p.r, 2 * Math.PI, 0)
      this.ctx.fill()

      if (100 * random() > 99) {
        p.xs = random() * p.r * 4 - 2
      }

      p.y += p.ys * this.speed * 1.5
      p.x += p.xs * this.speed / 1.5

      if (p.x > this.cnv.width || p.y > this.cnv.height) {
        p.x = random() * this.cnv.width
        p.y = -2
      }
    }
  }

  create()
  {
    this.cnv = document.createElement('canvas')
    this.ctx = this.cnv.getContext('2d')

    this.cnv.setAttribute('id', 'snow')

    Object.assign(this.cnv.style, styles)
  }

  remove()
  {
    this.cnv && this.cnv.parentNode.removeChild(this.cnv)
  }

  destroy()
  {
    this.frame && cancelFrame(this.frame)

    this.offResize()
    this.remove()

    this.particles = []
    this.enable = false

    this.frame = null
    this.cnv = null
    this.ctx = null
  }
}
