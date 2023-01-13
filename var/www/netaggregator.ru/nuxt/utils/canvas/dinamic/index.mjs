// import { Smoothtrail } from './smoothtrail.mjs'
// import { Grid } from './grid.mjs'

import { Layer } from './layer.mjs'
import { Loop } from './loop.mjs'

const map = {
    fabric: () => import(/* webpackChunkName: "fabric-dynamic" */ './fabric-particles.mjs').then(m => m.FabricParticles),
    cosmo: () => import(/* webpackChunkName: "cosmo-dynamic" */ './cosmo-particles.mjs').then(m => m.CosmoParticles),
    sparkling: () => import(/* webpackChunkName: "sparkling" */ './sparkling.mjs').then(m => m.Sparkling),
    balloons: () => import(/* webpackChunkName: "balloons" */ './balloons.mjs').then(m => m.Balloons),
    geometry: () => import(/* webpackChunkName: "geometry" */ './geometry.mjs').then(m => m.Geometry),
    gradient: () => import(/* webpackChunkName: "gradient" */ './gradient.mjs').then(m => m.Gradient),
    mystical: () => import(/* webpackChunkName: "mystical" */ './mystical.mjs').then(m => m.Mystical),
    octopus: () => import(/* webpackChunkName: "octopus" */ './octopus.mjs').then(m => m.Octopus),
    noisy: () => import(/* webpackChunkName: "noisy" */ './noisy.mjs').then(m => m.Noisy),
    neon: () => import(/* webpackChunkName: "neon" */ './neon.mjs').then(m => m.Neon),
    mesh: () => import(/* webpackChunkName: "mesh" */ './mesh.mjs').then(m => m.Mesh),
    rain: () => import(/* webpackChunkName: "mesh" */ './rain.mjs').then(m => m.Rain)
}

function noop() {}

export class App
{
    static insnances = {}

    static init(id, canvas, render, cleaner)
    {
        App.insnances[id] || (App.insnances[id] = new App(canvas, render, cleaner))

        return App.insnances[id]
    }

    get started()
    {
        return this.loop.run
    }

    /**
    * @param {HTMLCanvasElement} canvas
    * @param {Function} render
    * @param {Function} cleaner
    * @param {String} animation
    */
    constructor(canvas, render = null, cleaner = null, animation = 'mesh')
    {
        const display = this.display.bind(this),
            update = this.update.bind(this)

        this.setRenderer(render)
        this.setCleaner(cleaner)
        this.setLayer(canvas)

        this.particles = { subset: 'cosmo' }         // cosmo | fabric
        this.rainbow = { subset: 'rain' }            // rain | octopus

        this.mouse = { on: false, x: null, y: null }
        this.loop = new Loop(update, display)

        this.type = animation

        this.choose(animation, {})
            .catch(() => {})
    }

    setLayer(canvas)
    {
        this.layer = new Layer(canvas)
    }

    setRenderer(render)
    {
        this._render = render || noop
    }

    setCleaner(cleaner)
    {
        this._clean = cleaner || noop
    }

    reloadDetermine(extra)
    {
        return Object.keys(extra).some(k => ['subset'].includes(k))
    }

    async get(type)
    {
        map[type] && this.create(await map[type]())
    }

    async setExtra(extra = {}, reload = true)
    {
        let needReload = this.reloadDetermine(extra)

        switch (this.type) {
            case 'sparkling':
            case 'balloons':
            case 'gradient':
            case 'geometry':
            case 'mystical':
            case 'noisy':
            case 'neon':
            case 'mesh':
                for (const k in extra) {
                    switch (k) {
                        case 'background':
                        case 'color':
                            if (this.type === 'geometry' && k === 'background') {
                                this.animation.setBackground(extra[k])
                                break
                            }
                            if (this.type === 'neon' && k === 'color') {
                                this.animation.setColor(extra[k])
                                break
                            }

                            this.animation[k] = extra[k]
                            break

                        default:
                            this.animation[k] = extra[k]
                    }
                }
                break

            case 'particles':
            case 'rainbow':
                for (const k in extra) {
                    switch (k) {
                        case 'subset':
                            this[this.type][k] = extra[k]
                            needReload = reload
                            break
                        case 'octopusLength':
                            this.animation.p = extra[k]
                            break
                        case 'background':
                        case 'color':
                            if (k === 'background') {
                                this.animation.setBackground(extra[k])
                            }
                            if (k === 'color') {
                                this.animation.setColor(extra[k])
                            }
                            break

                        default:
                            this.animation[k] = extra[k]
                    }
                }
                break
        }

        if (needReload) {
            await this.choose()
        }
    }

    async choose(type, dataset = {})
    {
        this.loop.stop()

        type || (type = this.type)

        const set = dataset[type] || {}

        switch (type) {
            case 'particles':
            case 'rainbow':
                this[type] = Object.assign({}, this[type], set)
                await this.get(this[type].subset)
                break

            default:
                await this.get(type)
        }

        this.type = type

        if (dataset && dataset[type]) {
            await this.setExtra(dataset[type], false)
        }

        this.clearCanvas()
        this.loop.start()
    }

    create(Animation)
    {
        this.animation = new Animation(this)
    }

    clearCanvas()
    {
        this.layer.context.clearRect(0, 0, this.layer.w, this.layer.h)

        this._clean()
    }

    update(correction = 0)
    {
        this.animation && this.animation.update(correction, this)
    }

    display()
    {
        this.animation && this.animation.render(this.layer.context)

        this._render()
    }

    mousemove({ absolutePointer: p = {} })
    {
        this.mouse.on = true
        this.mouse.x = p.x
        this.mouse.y = p.y
    }

    mouseout({ absolutePointer: p = {} })
    {
        this.mouse.on = false
        this.mouse.x = p.x
        this.mouse.y = p.y
    }

    dispose()
    {
        this._render = noop
        this._clean = noop

        this.clearCanvas()
    }
}
