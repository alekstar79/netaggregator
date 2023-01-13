/** @see https://codepen.io/thebabydino/pen/VwYgNKw */

const rand = (max = 1, min = 0, dec = 0) => +(min + (max - min) * Math.random()).toFixed(dec),
  _C = document.getElementById('canvas'),
  C = _C.getContext('2d'),
  D = _C.width,
  RC = .05 * D /* polygon circumradius */,
  N = 400 /* total number of polygons */,
  VMIN = .5 /* min x axis velocity */,
  VMAX = 2 /* max x axis velocity */,
  OMIN = .15 /* min opacity */,
  OMAX = .65 /* max opacity */,
  POLY = [] /* array of polygons */,
  FN = ['line', 'move'],
  SL = [65, 35].map(c => `${c}%`) /* saturation & lightness */

let hue = 360

class RandPoly
{
  constructor(x)
  {
    this.x = x || rand(D)
    this.y = rand(D)

    /* motion */
    this.vx = rand(VMAX, VMIN, 2) /* velocity along z axis */

    /* shape */
    this.n = rand(8, 3) /* number of polygon vertices */
    this.β = 2 * Math.PI / this.n /* base angle corresponding to an edge */
    this.vertices = []

    /* look */
    this.o = rand(OMAX, OMIN, 2) /* opacity */

    for(let k = 0; k < this.n; k++) {
      let γ = -.5 * (Math.PI + (1 - this.n % 2) * this.β) + k * this.β

      this.vertices.push([
        RC * Math.cos(γ),
        +(this.y + RC * Math.sin(γ)).toFixed(2)
      ])
    }
  }

  get coords()
  {
    this.x += this.vx

    if (this.x - D >= RC) {
      this.x = -RC
      this.y = rand(D)
      this.vx = rand(VMAX, VMIN, 2)
      this.o = rand(OMAX, OMIN, 2)
      this.vertices = []

      for (let k = 0; k < this.n; k++) {
        let γ = -.5 * (Math.PI + (1 - this.n % 2) * this.β) + k * this.β

        this.vertices.push([
          RC * Math.cos(γ),
          +(this.y + RC * Math.sin(γ)).toFixed(2)
        ])
      }
    }

    return this.vertices.map(c => [
      +(this.x + c[0]).toFixed(2), c[1]
    ])
  }
}

function draw()
{
  C.clearRect(0, 0, D, D)

  hue = (hue + 359) % 360

  let gl = C.createLinearGradient(0, 0, D, 0)

  gl.addColorStop(0, `hsl(${hue}, ${SL})`)
  gl.addColorStop(1, `hsl(${hue + 60}, ${SL})`)

  C.fillStyle = gl
  C.fillRect(0, 0, D, D)

  C.globalCompositeOperation = 'overlay'
  C.fillStyle = '#fff'

  for (let i = 0; i < 100; i++) {
    /* opacity bucket */
    let bo = POLY.filter(c => Math.round(c.o * 100) === i),
      m = bo.length

    if (m > 0) {
      C.globalAlpha = +(.01 * i).toFixed(2)

      C.beginPath()

      bo.forEach(c => {
        let coords = c.coords /* current poly absolute coordinate array */

        for (let k = 0; k < c.n; k++)
          C[`${FN[0 ** k]}To`](...coords[k % c.n])
      })

      C.closePath()
      C.fill()
    }
  }

  requestAnimationFrame(draw)
}

;(function init()
{
  for (let i = 0; i < N; i++) {
    POLY.push(new RandPoly())
  }

  draw()
})()
