/** @see https://csspoint101.com/45-css-glitch-effect */
/** @see https://codepen.io/marco_fugaro/pen/mddbOYw */

const simplex = new SimplexNoise(),
    stats = new Stats(),
    image = new Image(),

    SLICES = 20

window.DEBUG = true
if (window.DEBUG) {
    document.body.appendChild(stats.dom)
}

// noinspection DuplicatedCode
class Slices
{
    canvas = document.querySelector('canvas')
    ctx = this.canvas.getContext('2d')
    tStart = performance.now()

    constructor(image)
    {
        this.image = image

        const startingPoints = Array(SLICES)
            .fill(0)
            .map(() => [Math.random(), Math.random()])

        this.voronoi = d3.Delaunay.from(startingPoints).voronoi([0, 0, 1, 1])
        this.points = this.voronoi.delaunay.points

        // noinspection ES6ModulesDependencies,JSValidateTypes
        this.state = State({
            relaxation: State.Slider(.1, { min: 0, max: 1, step: .01 }),
            showCenters: false,
            showCells: false,
            noise: {
                enabled: true,
                amplitude: State.Slider(.05, { min: 0, max: .5, step: .01 }),
                frequency: State.Slider(.1, { min: 0, max: 10, step: .01 })
            }
        })

        if (window.DEBUG) {
            this.state = wrapGUI(this.state)
        }

        this.resize()

        window.addEventListener('resize', this.resize.bind(this))
        requestAnimationFrame(this.update.bind(this))
    }

    resize()
    {
        this.canvas.height = window.innerHeight
        this.canvas.width = window.innerWidth
    }

    yScale = n => n * this.canvas.height
    xScale = n => n * this.canvas.width

    scalePoint = point => [this.xScale(point[0]), this.yScale(point[1])]
    scalePolygon = polygon => polygon.map(this.scalePoint)

    drawPoint(point, color)
    {
        const RADIUS = 2.5

        this.ctx.beginPath()
        this.ctx.moveTo(point[0] + RADIUS, point[1])
        this.ctx.arc(point[0], point[1], RADIUS, 0, 2 * Math.PI, false)
        this.ctx.closePath()
        this.ctx.fillStyle = color
        this.ctx.fill()
    }

    drawLine(from, to, color)
    {
        const STROKE_WIDTH = 1

        this.ctx.beginPath()
        this.ctx.moveTo(from[0], from[1])
        this.ctx.lineTo(to[0], to[1])
        this.ctx.closePath()
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = STROKE_WIDTH
        this.ctx.stroke()
    }

    drawPolygon(polygon, color)
    {
        const STROKE_WIDTH = 1

        this.ctx.beginPath()
        this.ctx.moveTo(polygon[0][0], polygon[0][1])

        for (let i = 1; i < polygon.length; i++) {
            const point = polygon[i]
            this.ctx.lineTo(point[0], point[1])
        }

        this.ctx.closePath()
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = STROKE_WIDTH
        this.ctx.stroke()
    }

    drawImageClipped(image, polygon, offset)
    {
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.moveTo(polygon[0][0], polygon[0][1])

        for (let i = 1; i < polygon.length; i++) {
            const point = polygon[i]
            this.ctx.lineTo(point[0], point[1])
        }

        this.ctx.closePath()
        this.ctx.clip()

        const imageCoverSize = getCoverSize(
            image.naturalWidth,
            image.naturalHeight,
            this.canvas.width,
            this.canvas.height,
            .5,
            .5
        )

        this.ctx.drawImage(
            image,
            imageCoverSize.offsetLeft + offset[0],
            imageCoverSize.offsetTop + offset[1],
            imageCoverSize.width,
            imageCoverSize.height
        )

        this.ctx.restore()
    }

    update(ms)
    {
        const t = (ms - this.tStart) / 1000

        stats.begin()

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const polygons = Array.from(this.voronoi.cellPolygons())
        const centroids = polygons.map(d3.polygonCentroid)
        const NOISE_AMPLITUDE = this.state.noise.amplitude
        const NOISE_FREQUENCY = this.state.noise.frequency
        const EASING_FACTOR = this.state.relaxation

        for (let i = 0; i < this.points.length; i += 2) {
            // this is done also with bitwise operation i >> 1, but why the fuck
            const normalizedIndex = Math.floor(i / 2)
            const point = [this.points[i], this.points[i + 1]]
            const polygon = polygons[normalizedIndex]
            const centroid = centroids[normalizedIndex]

            if (!centroid) continue

            // apply LLoys's relaxation
            // https://observablehq.com/@mbostock/lloyds-algorithm
            // https://observablehq.com/@fil/spherical-lloyds-relaxation
            const target = _.cloneDeep(centroid)

            // give 'em a wobble
            if (this.state.noise.enabled) {
                target[0] += simplex.noise2D(i, t * NOISE_FREQUENCY) * NOISE_AMPLITUDE
                target[1] += simplex.noise2D(i + 1000, t * NOISE_FREQUENCY) * NOISE_AMPLITUDE
            }

            // ease the point to the target
            // https://aerotwist.com/tutorials/protip-stick-vs-ease
            const x0 = point[0]
            const y0 = point[1]
            const [x1, y1] = target

            this.points[i] = x0 + (x1 - x0) * EASING_FACTOR
            this.points[i + 1] = y0 + (y1 - y0) * EASING_FACTOR

            const distance = [target[0] - this.points[i], target[1] - this.points[i + 1]]

            // draw
            if (polygon) {
                this.drawImageClipped(image, this.scalePolygon(polygon), this.scalePoint(distance))

                if (this.state.showCells) {
                    this.ctx.globalAlpha = 0.5
                    this.drawPolygon(this.scalePolygon(polygon), '#000')
                    this.ctx.globalAlpha = 1
                }
            }

            if (window.DEBUG && this.state.showCenters) {
                this.drawPoint(this.scalePoint(point), '#000')
                this.drawLine(this.scalePoint(point), this.scalePoint(target), '#000')
                this.drawPoint(this.scalePoint(target), '#f00')
            }
        }

        this.voronoi.update()

        stats.end()
        requestAnimationFrame(this.update.bind(this))
    }
}

image.addEventListener('load', () => new Slices(image))
image.src = 'skyscraper.jpg'
