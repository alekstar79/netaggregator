import { icons as _icons, map, yaIcons } from './weather-map.mjs'
import { fonts } from '../assets/data/fonts.mjs'

import { kebabToCamel, mapping, tofile } from '../utils/common/profiles.mjs'
import { decode } from '../utils/ubjson.mjs'

import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

import Canvas from 'canvas'
import path from 'path'

export class Drawer
{
    static yandex = true

    static weather = { temp: '--', cond: '--', wind: '--', pressure: '--', humidity: '--' }

    static info = { subscribers: '--', online: '--', female: '--', male: '--' }

    static user = { first_name: 'Вакантное', last_name: 'место' }

    static dirname = path.dirname(process.argv[1])

    static origin = { width: 1590, height: 530 }

    static center = { left: 795, top: 265 }

    static scale = 1

    static enc = { encoding: 'utf8' }

    static na = readFile(path.resolve(Drawer.dirname, 'icons/wi-na.svg'), Drawer.enc)

    static files = Array.from(_icons.keys()).map(v => ({
        file: new Promise(resolve => {
            let file = path.resolve(Drawer.dirname, `icons/${v.split('-')[1]}/${v}.svg`)

            if (!existsSync(file)) {
                file = path.resolve(Drawer.dirname, `icons/${v}.svg`)

                if (!existsSync(file)) {
                    return resolve(null)
                }
            }

            resolve(readFile(file, Drawer.enc))
        }),

        icon: v
    }))

    static icons = Object.keys(map).reduce((acc, k) => {
        let icon, entry = { night: null, day: null, icon: null }

        for (const entity of Object.keys(entry)) {
            if ((icon = Drawer.files.find(o => o.icon === map[k][entity]))) {
                entry[entity] = icon.file
            }
        }

        return { ...acc, [k]: entry }

    }, {})

    constructor(fabric, pool)
    {
        fonts.forEach(set => Canvas.registerFont(path.resolve(Drawer.dirname, `../${set.src}`), { family: set.family }))

        this.banned = Canvas.loadImage(path.resolve(Drawer.dirname, '../static/dcover/default/deactivated.png'))
        this.camera = Canvas.loadImage(path.resolve(Drawer.dirname, '../static/dcover/default/camera_200.png'))

        fabric.Canvas.prototype.localeDateString = true

        this.draw = this.draw.bind(this, fabric)

        this.createPool(fabric, pool)
    }

    static init(fabric, pool)
    {
        return new Drawer(fabric, pool)
    }

    static zoom(scale)
    {
        return { height: Drawer.origin.height * scale, width: Drawer.origin.width * scale }
    }

    static rand(max, min)
    {
        return Math.random() * (max - min + 1) + min
    }

    static getOptions(object)
    {
        return Object.keys(object).reduce((acc, k) => k !== 'path' ? { ...acc, [k]: object[k] } : acc, {})
    }

    static weatherIcon({ icon, code })
    {
        return Drawer.yandex ? Drawer.iconByYandex(icon) : Drawer.iconByCode(code)
    }

    static iconByYandex(icon)
    {
        const source = (Drawer.files.find(w => w.icon === yaIcons[icon]) || {}).file

        if (!source) return Drawer.na

        return source
    }

    static iconByCode(code)
    {
        const source = Drawer.icons[code]

        if (!source) return Drawer.na

        if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
            return source.day
        }

        return source.night
    }

    static buildPath(fabric, objects, options = {})
    {
        const builder = (a, { path }) => a.concat(path)

        return new fabric.Path(
            objects.length > 1 ? objects.reduce(builder, []) : objects[0].path,
            options
        )
    }

    static extractUser(set, type, count)
    {
        if (Array.isArray(set[type])) {
            set[type] = set[type][count % set[type].length]
        }

        return set[type]
    }

    createPool(fabric, length = 10)
    {
        this.pool = Array.from({ length }, () => new fabric.Canvas(null, Drawer.origin))
    }

    async load(source)
    {
        switch (true) {
            case !source || /camera_200/.test(source):
                return this.camera

            case source === 'banned':
                return this.banned
        }

        return Canvas.loadImage(source)
    }

    completed(o)
    {
        try {

            const { source } = o._objects.find(p => p.type === 'rect').fill

            return source instanceof Canvas.Image && source.complete

        } catch (e) {
        }

        return true
    }

    promo(idx, set, fabric)
    {
        return new Promise(resolve => process.nextTick(() => {
            const promo = this.pool[idx]._objects.find(o => o.type === 'promo-link'),
                now = (Date.now() / 1000 | 0),
                { designer = 0 } = set

            if ((designer > now) && promo) {
                this.pool[idx]._objects = this.pool[idx]._objects.filter(o => o.type !== 'promo-link')

            } else if (designer < now && !promo) {
                this.pool[idx].add(new fabric.PromoLink(Drawer.center))
            }

            resolve()
        }))
    }

    shake(idx)
    {
        return new Promise(resolve => process.nextTick(() => {
            const increase = Drawer.scale + .1,
                decrease = Drawer.scale - .1

            this.pool[idx].setZoom(increase).setDimensions(Drawer.zoom(increase))
            this.pool[idx].setZoom(decrease).setDimensions(Drawer.zoom(decrease))

            resolve()
        }))
    }

    currency({ value, rate, short })
    {
        value = value.toString()
        rate = rate.split('_')

        return short ? `${rate[0]} ${value}` : `1 ${rate[0]} ${value} ${rate[1]}`
    }

    async reviver(fabric, set, idx, count, json, obj)
    {
        try {

            let circle, rect, text, svg, idx

            switch (json.type) {
                case 'c-text':
                    obj.set({ charSpacing: json.charSpacing || -1 })
                    break

                case 'widget-profile':
                    const type = mapping(kebabToCamel(json))

                    set[type] = type.includes('user') ? json.user : Drawer.extractUser(set, type, count)

                    set[type] = { ...Drawer.user, ...(set[type] || {}) }

                    const { first_name, last_name, photo_200, photo_100, photo_400 } = set[type],
                        source = await this.load(photo_200 || photo_100 || photo_400)

                    if ((text = obj._objects.find(o => o.type === 'text'))) {
                        text.set('text', `${first_name} ${last_name}`)
                    }
                    if ((rect = obj._objects.find(o => o.type === 'rect'))) {
                        new fabric.Pattern({
                            patternTransform: source instanceof Canvas.Image
                                ? [rect.width / source.width, 0, 0, rect.height / source.height, 0, 0]
                                : [1, 0, 0, 1, 0, 0],

                            crossOrigin: 'anonymous',
                            source,

                        }, pattern => { rect.set('fill', pattern) })
                    }
                    break

                case 'widget-weather':
                    if (!set.weather) break

                    // count += 9
                    // set.weather.icon = Object.keys(yaIcons)[count]
                    obj.on('added', obj.setweather.bind(obj, set.weather || Drawer.weather))
                    svg = await Drawer.weatherIcon(set.weather)

                    if ((idx = obj._objects.findIndex(o => o.type === 'path')) !== -1) {
                        fabric.loadSVGFromString(svg, objects => {
                            obj._objects[idx] = Drawer.buildPath(fabric, objects, Drawer.getOptions(obj._objects[idx]))
                            obj._onObjectAdded && obj._onObjectAdded(obj._objects[idx])
                            obj.addWithUpdate()
                        })
                    }
                    break

                case 'widget-traffic':
                    if (!set.traffic) break

                    const { icon, level, hint } = set.traffic

                    if ((circle = obj._objects.find(o => o.type === 'circle'))) {
                        circle.set({ fill: icon, color: icon })
                    }
                    if ((text = obj._objects.find(o => o.type === 'text'))) {
                        text.set('text', `${hint}\n${level}`)
                    }
                    break

                case 'widget-currency':
                    if (!set.currency) break

                    if ((text = obj._objects.find(o => o.type === 'text'))) {
                        text.set('text', this.currency(set.currency))
                    }
                    break

                case 'widget-rss':
                    if (set.rss && set.rss.feed.length) {
                        obj.setFeed(set.rss.feed[count % set.rss.feed.length])
                    }
                    break

                case 'widget-info':
                    obj.on('added', obj.setinfo.bind(obj, set.info || Drawer.info))
                    break

                case 'widget-json':
                    obj.on('added', obj.setJson.bind(obj, set.json || {}))
                    break

                case 'widget-feed':
                    obj.looping(count % obj.feed.length)
                    break
            }

        } catch (e) {
        }
    }

    async perform(fabric, set, idx, resolve, reject)
    {
        try {

            await this.promo(idx, set, fabric)

            let i = 100, completed = false

            do {

                await new Promise(delay => setTimeout(delay, Drawer.rand(100, 70)))

                completed = this.pool[idx]._objects.filter(o => o.type === 'widget-profile').every(this.completed)

            } while (!completed && --i)

            await this.shake(idx)

            resolve({
                stream: this.pool[idx].createPNGStream(),
                gid: set._id
            })

        } catch (e) {
            reject(e)
        }
    }

    draw(fabric, set, idx, count)
    {
        return new Promise((resolve, reject) => {
            readFile(path.resolve(Drawer.dirname, `../../${set.src}`))
                .then(decode)
                .then(tofile)
                .then(data => {
                    this.pool[idx].loadFromJSON(
                        data,

                        this.perform.bind(this, fabric, set, idx, resolve, reject),
                        this.reviver.bind(this, fabric, set, idx, count)
                    )
                })
                .catch(reject)
        })
    }
}
