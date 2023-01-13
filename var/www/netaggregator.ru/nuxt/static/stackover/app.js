// https://ru.stackoverflow.com/a/988105/211710
// noinspection PointlessArithmeticExpressionJS

let imgCtx = scene.getContext('2d')
let pickCtx = pick.getContext('2d')

// это важно для того чтобы сглаживанием не изменялось значение идентификатора
pickCtx.imageSmoothingEnabled = false

let index = {}
let objects = Array(22).fill(0).map((e, i) => img(i))
let bounds = scene.getBoundingClientRect()
let hover, drag, x, y //, sx, sy

scene.addEventListener('mousemove', e => {
  drag ? handleDrag(e) : handleHover(e)
  draw()
})

scene.addEventListener('mousedown', e => {
  if (hover) {
    drag = hover
    x = drag.x - e.pageX + bounds.left
    y = drag.y - e.pageY + bounds.top
    objects.splice(objects.indexOf(drag), 1)
    objects.push(drag)
    draw()
  }
})

scene.addEventListener('mouseup', () => drag = false)

draw()

function handleDrag(e)
{
  drag.x = x + e.pageX - bounds.left
  drag.y = y + e.pageY - bounds.top
}

function handleHover(e)
{
  if (hover) hover.active = false

  let id = pickCtx.getImageData(
    e.pageX - bounds.left,
    e.pageY - bounds.top,
    1, 1
  ).data

  hover = id[3] > 200 ? index[`${id[0]}-${id[1]}-${id[2]}`] : null
  scene.style.cursor = hover ? 'pointer' : 'default'

  if (hover) hover.active = true
}

function draw()
{
  pickCtx.clearRect(0, 0, scene.width, scene.height)
  imgCtx.clearRect(0, 0, scene.width, scene.height)

  objects.forEach(img => {
    imgCtx.drawImage(img.img, img.x, img.y)
    pickCtx.drawImage(img.pick, img.x, img.y)
  })

  hover && imgCtx.drawImage(hover.hover, hover.x, hover.y)
}

function rnd()
{
  return Math.round(Math.random() * 255)
}

function img()
{
  let id

  while (!id || index[id.join('-')]) {
    id = [rnd(), rnd(), rnd()]
  }

  let size = 100
  let img = document.createElement('canvas')
  let ctx = img.getContext('2d')

  img.width = img.height = size

  const grd = ctx.createLinearGradient(
    size * .1, Math.random() * size,
    size * .9, Math.random() * size
  )

  grd.addColorStop(0, `hsl(${Math.random() * 255},55%,55%)`)
  grd.addColorStop(1, `hsl(${Math.random() * 255},55%,55%)`)

  ctx.fillStyle = grd
  ctx.translate(size / 2, size / 2)
  ctx.rotate(Math.random() * 6)
  ctx.translate(-size / 2, -size / 2)

  let s = 20 + Math.random() * 40

  ctx.fillRect((size - s) / 2, (size - s) / 2, s, s)
  ctx.fillRect((size - s) / 4, (size - s) / 4, s, s)

  return index[id.join('-')] = {
    x: Math.random() * (scene.width - img.width),
    y: Math.random() * (scene.height - img.height),
    id,
    img,
    pick: createPickImage(img, id),
    hover: ImageSDF(img)
  }
}

// создает изображения для рисования в пикинг буфере
// красит все не полностью прозрачные пиксели в цвет-идентификатор
function createPickImage(img, pickColor)
{
  let pick = document.createElement('canvas')
  let w = pick.width = img.width
  let h = pick.height = img.height
  let ctx = pick.getContext('2d')

  ctx.drawImage(img, 0, 0)

  img = ctx.getImageData(0, 0, w, h)

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let o = (y * w + x) * 4
      // если прозрачность не 0 - красим пиксель в цвет-идентификатор
      if (img.data[o + 3]) {
        img.data[o + 0] = pickColor[0]
        img.data[o + 1] = pickColor[1]
        img.data[o + 2] = pickColor[2]
        // рисование полупрозрачных пикселей в пикинг буфер - источник ошибок
        // пусть все не полностью прозрачные пиксели будут польностью непрозрачные
        img.data[o + 3] = 255
      }
    }
  }

  ctx.putImageData(img, 0, 0)

  return pick
}

// эта функция создает signed distance field до изображения на входе
// визуально это градиент, его мы будем использовать для обводки
function ImageSDF(image)
{
  let INF = 1e20
  let radius = 3
  let cutoff = .1
  let canvas = document.createElement('canvas')
  let width = canvas.width = image.width
  let height = canvas.height = image.height
  let ctx = canvas.getContext('2d')

  // temporary arrays for the distance transform
  let gridOuter = new Float64Array(width * height)
  let gridInner = new Float64Array(width * height)
  let f = new Float64Array(height)
  let d = new Float64Array(width)
  let z = new Float64Array(width + 1)
  let v = new Int16Array(width)

  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)

  let imgData = ctx.getImageData(0, 0, width, height)

  for (let i = 0; i < width * height; i++) {
    imgData.data[i * 4 + 0] = imgData.data[i * 4 + 3]
    imgData.data[i * 4 + 1] = imgData.data[i * 4 + 3]
    imgData.data[i * 4 + 2] = imgData.data[i * 4 + 3]
  }

  for (let i = 0; i < width * height; i++) {
    let a = imgData.data[i * 4 + 1] / 255 // green channe value
    gridOuter[i] = a === 1 ? 0 : a === 0 ? INF : Math.pow(Math.max(0, .5 - a), 2)
    gridInner[i] = a === 1 ? INF : a === 0 ? 0 : Math.pow(Math.max(0, a - .5), 2)
  }

  edt(gridOuter, width, height, f, d, v, z)
  edt(gridInner, width, height, f, d, v, z)

  for (let i = 0; i < width * height; i++) {
    let dd = gridOuter[i] - gridInner[i]
    let v = Math.round(255 - 255 * (dd / radius + cutoff))

    v = Math.max(0, Math.min(255, v))

    imgData.data[i * 4 + 0] = v > 10 && v < 245 ? 255 : 0
    imgData.data[i * 4 + 3] = v > 10 && v < 245 ? 255 : 0
  }

  ctx.putImageData(imgData, 0, 0)

  return canvas
}

// 2D Euclidean distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/dt/
function edt(data, width, height, f, d, v, z)
{
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      f[y] = data[y * width + x]
    }

    edt1d(f, d, v, z, height)

    for (let y = 0; y < height; y++) {
      data[y * width + x] = d[y]
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      f[x] = data[y * width + x]
    }

    edt1d(f, d, v, z, width)

    for (let x = 0; x < width; x++) {
      data[y * width + x] = Math.sqrt(d[x])
    }
  }
}

// 1D squared distance transform
function edt1d(f, d, v, z, n)
{
  let INF = 1e20

  v[0] = 0
  z[0] = -INF
  z[1] = +INF

  for (let q = 1, k = 0; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])

    while (s <= z[k]) {
      k--
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    }

    k++
    v[k] = q
    z[k] = s
    z[k + 1] = +INF
  }

  for (let q = 0, k = 0; q < n; q++) {
    while (z[k + 1] < q) k++
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]
  }
}
