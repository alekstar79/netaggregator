/** @see https://codepen.io/thebabydino/pens/public */

const rand = (max = 1, min = 0, dec = 0) => +(min + (max - min) * Math.random()).toFixed(dec),
  _C = document.getElementById('canvas'),
  C = _C.getContext('2d'),
  L = _C.width,
  O = -.5 * L,
  R = L / Math.SQRT2,
  RC = .05 * L,
  UA = 2 * Math.PI / 360,
  POLY = [],
  N = 400, /* shapes number */
  THEME = ['#337ab7', '#ffffff', '#88c5f7', '#55b0fa', '#2d84cc'], /* palette */
  NT = THEME.length,
  OPTS = ['fill', 'stroke'],
  NO = OPTS.length,
  FN = ['line', 'move']

class RandPoly
{
  constructor()
  {
    this.n = rand(8, 3)
    this.α = 2 * Math.PI / this.n
    this.o = rand()
    this.b = rand(NT - 1)
    this.r = rand(R + RC)
    this.β = Math.random() * 2 * Math.PI
    this.γ = rand(1.5, .125, 3) * UA / 2 /* speed */
  }

  get coords()
  {
    let f, vx = []

    if (--this.r < 0) this.r = R + RC

    this.β += rand(1.1, .9, 3) * this.γ
    f = this.r / R

    for (let i = 0; i < this.n; i++) {
      let ca = this.β + i * this.α

      vx.push([
        Math.round(this.r * Math.cos(this.β) + f * RC * Math.cos(ca)),
        Math.round(this.r * Math.sin(this.β) + f * RC * Math.sin(ca))
      ])
    }

    return vx
  }
}

function draw()
{
  C.clearRect(O, O, L, L)

  for (let i = 0; i < NT; i++) {
    let b = POLY.filter(c => c.b === i)

    for (let j = 0; j < NO; j++) {
      let opt = b.filter(c => c.o === j)

      C[`${OPTS[j]}Style`] = THEME[i]
      C.beginPath()

      opt.forEach(p => {
        let vx = p.coords
        for (let k = 0; k <= p.n; k++) {
          C[k ? 'lineTo' : 'moveTo'](...vx[k % p.n])
        }
      })

      C.closePath()
      C[`${OPTS[j]}`]()
    }
  }

  requestAnimationFrame(draw)
}

;(function init()
{
  C.translate(-O, -O)
  C.lineWidth = 3
  C.globalCompositeOperation = 'screen'

  for (let i = 0; i < N; i++) {
    POLY.push(new RandPoly())
  }

  draw()
})()
