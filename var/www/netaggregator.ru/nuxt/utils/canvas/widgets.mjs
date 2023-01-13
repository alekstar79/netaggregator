import { loadFont } from './fonts/loader.mjs'
import { Lorem } from '../lorem.mjs'
import { ObjectId } from 'bson'

const mongoId = () => new ObjectId(null).toHexString(),

    feed = [
        'Дополнительный динамический\nтекст баннера',
        'Который может меняется\nс определенным интервалом',
        'Циклически во времени'
    ]

const items = [
    { widget: 'WidgetCountdown', src: '/img/graph/wd_180.svg', type: 'widget-countdown' },
    { widget: 'WidgetCalendar',  src: '/img/graph/wc_180.svg', type: 'widget-calendar'  },
    { widget: 'WidgetCurrency',  src: '/img/graph/we_180.svg', type: 'widget-currency'  },
    { widget: 'WidgetProfile',   src: '/img/graph/wa_180.png', type: 'widget-profile'   },
    { widget: 'WidgetWeather',   src: '/img/graph/ww_180.svg', type: 'widget-weather'   },
    { widget: 'WidgetTraffic',   src: null,                    type: 'widget-traffic'   },
    { widget: 'WidgetTime',      src: '/img/graph/wt_180.svg', type: 'widget-time'      },
    { widget: 'WidgetFeed',      src: '/img/graph/wf_180.svg', type: 'widget-feed'      },
    { widget: 'WidgetInfo',      src: '/img/graph/wi_180.svg', type: 'widget-info'      },
    { widget: 'WidgetJson',      src: '/img/graph/wj_180.svg', type: 'widget-json'      },
    { widget: 'WidgetRss',       src: '/img/graph/wr_180.svg', type: 'widget-rss'       }
]

const options = options => ({
    centeredScaling: true,
    fontFamily: 'Archive',
    textFill: '#000000',
    textAlign: 'left',
    originX: 'center',
    originY: 'center',
    rounded: true,
    fontSize: 32,
    scaleX: 1,
    scaleY: 1,
    left: 795,
    top: 265,
    ...options
})

export function text(txt, options = {}, { Text })
{
    txt = txt.toString()

    /* @lends fabric.Text */
    return new Text(txt, {
        prevent: true,
        fontFamily: 'Archive',
        textAlign: 'left',
        originX: 'center',
        originY: 'center',
        fill: '#000000',
        fontSize: 32,
        scaleX: 1,
        scaleY: 1,
        left: 0,
        top: 100,
        ...options
    })
}

export function path(data, options = {}, { Path })
{
    /* @lends fabric.Path */
    return new Path(data, {
        prevent: true,
        fill: '#000000',
        originX: 'center',
        originY: 'center',
        scaleX: 1,
        scaleY: 1,
        left: 0,
        top: -20,
        ...options
    })
}

export function rect(options = {}, { WRect })
{
    let { height = 180, width = 180, rx, ry } = options

    rx || (rx = height / 2)
    ry || (ry = width / 2)

    /* @lends fabric.Rect */
    return new WRect({
        prevent: true,
        originX: 'center',
        originY: 'center',
        top: -20,
        left: 0,
        height,
        width,
        rx,
        ry,
        ...options
    })
}

export function circle(options = {}, { Circle })
{
    /* @lends fabric.Circle */
    return new Circle({
        prevent: true,
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        radius: 45,
        ...options
    })
}

export function weather(txt, options = {}, { WeatherItem })
{
    txt = txt.toString()

    /* @lends fabric.Text */
    return new WeatherItem(txt, {
        prevent: true,
        originX: 'left',
        originY: 'top',
        textAlign: 'left',
        fontFamily: 'Casper-Bold',
        fill: '#000000',
        lineHeight: .9,
        fontSize: 28,
        scaleX: 1,
        scaleY: 1,
        ...options
    })
}

export function rss(txt, options = {}, { RssItem })
{
    txt = txt.toString()

    /* @lends fabric.Text */
    return new RssItem(txt, {
        prevent: true,
        originX: 'left',
        originY: 'top',
        textAlign: 'left',
        fontFamily: 'Casper-Bold',
        fill: '#000000',
        lineHeight: .9,
        maxWidth: 520,
        fontSize: 18,
        scaleX: 1,
        scaleY: 1,
        ...options
    })
}

function noop() {}

export class Widgets
{
    static dump = null

    static items = []

    static fabric

    static async create(fabric)
    {
        try {

            Widgets.fabric = fabric
            Widgets.items = items
            Widgets.dump = {}

            Widgets.upload().then(wgs => wgs.map(Widgets.builder))

        } catch (e) {
        }
    }

    static upload()
    {
        return Promise.all(Widgets.items.map(set => new Promise((resolve, reject) => {
            Widgets.uploadResources(set, resolve, reject)
        })))
    }

    static uploadResources(set, resolve, reject)
    {
        try {

            const resolver = img => resolve({ ...set, img })

            switch (true) {
                case /\.svg$/.test(set.src):
                    Widgets.fabric.loadSVGFromURL(set.src, (objects, options) => {
                        resolver(Widgets.buildPath(objects, options))
                    })
                    break

                case !!set.src:
                    Widgets.fabric.util.loadImage(set.src, resolver)
                    break

                default:
                    resolve({ ...set })
            }

        } catch (e) {
            reject(e)
        }
    }

    static buildPath(objects, options)
    {
        const builder = (a, { path }) => a.concat(path)

        return new Widgets.fabric.Path(
            objects.length > 1 ? objects.reduce(builder, []) : objects[0].path,
            options
        )
    }

    static path({ path: data, ...options }, extra = {})
    {
        return path.bind(null, data, { ...options, ...extra }, Widgets.fabric)
    }

    static rect(source)
    {
        return rect.bind(null, { fill: { source } }, Widgets.fabric)
    }

    static circle(fill)
    {
        return circle.bind(null, { color: fill, fill }, Widgets.fabric)
    }

    static text(txt, options)
    {
        return text.bind(null, txt, options, Widgets.fabric)
    }

    static weather(txt, options)
    {
        return weather.bind(null, txt, options, Widgets.fabric)
    }

    static rss(txt, options)
    {
        return rss.bind(null, txt, options, Widgets.fabric)
    }

    static builder({ type, widget, img })
    {
        if (!type || !widget) throw new Error('The widget component is not defined')

        Widgets.dump[type] = { Widget: Widgets.fabric[widget], options: options() }

        switch (type) {
            case 'widget-profile':
                Widgets.dump[type].options = options({ textAlign: 'center', fontSize: 26 })
                Widgets.dump[type].objects = [
                    Widgets.rect(img),
                    Widgets.text('Имя Фамилия', {
                        textAlign: 'center',
                        fontSize: 26
                    })
                ]
                break

            case 'widget-calendar':
                Widgets.dump[type].objects = [Widgets.text(''), Widgets.path(img)]
                break

            case 'widget-time':
                Widgets.dump[type].objects = [Widgets.text(''), Widgets.path(img)]
                break

            case 'widget-countdown':
                let diffs = { day: 6, hour: 23, minute: 59 },
                    left = 150

                Widgets.dump[type].options = options({ fontSize: 64 })
                Widgets.dump[type].objects = [
                    Widgets.path(img),
                    ...(Object.keys(diffs).map((interval, i) => () => {
                        return new Widgets.fabric.Count(
                            `${diffs[interval]}`,
                            {
                                interval,
                                fontSize: 64,
                                fontFamily: 'Archive',
                                left: left + i * 100,
                                top: -25
                            }
                        )
                    }))
                ]
                break

            case 'widget-currency':
                Widgets.dump[type].options = options({ textAlign: 'center', short: false })
                Widgets.dump[type].objects = [
                    Widgets.path(img),
                    Widgets.text('1 USD 74.85 RUB', {
                        textAlign: 'center',
                        left: 10,
                        top: 120
                    })
                ]
                break

            case 'widget-traffic':
                Widgets.dump[type].options = options({
                    code: { geoid: 213, city: 'Москва' },
                    fontSize: 22
                })
                Widgets.dump[type].objects = [
                    Widgets.circle('yellow'),
                    Widgets.text('Местами затруднено\n3 балла', {
                        textAlign: 'left',
                        originX: 'left',
                        originY: 'top',
                        fontSize: 22,
                        left: 110,
                        top: 20
                    })
                ]
                break

            case 'widget-weather':
                Widgets.dump[type].objects = [
                    Widgets.path(img, { originX: 'left', originY: 'top', left: 0, top: 0 }),
                    Widgets.weather('', { originX: 'left', originY: 'top', left: 200, top: 0 })
                ]
                Widgets.dump[type].options = options({
                    info: ['temp','cond','wind','pressure','humidity'],
                    fontFamily: 'Casper-Bold',
                    textAlign: 'left',
                    originX: 'left',
                    originY: 'top',
                    fontSize: 28,
                    init: true
                })
                break

            case 'widget-info':
                Widgets.dump[type].options = options({
                    info: ['subscribers','online','male','female'],
                    fontSize: 24
                })
                Widgets.dump[type].objects = [
                    Widgets.path(img, {
                        originX: 'left',
                        originY: 'top',
                        left: 0,
                        top: 0
                    }),
                    Widgets.text('', {
                        originX: 'left',
                        originY: 'top',
                        fontSize: 24,
                        left: 90,
                        top: 0
                    })
                ]
                break

            case 'widget-feed':
                Widgets.dump[type].options = options({
                    textAlign: 'center',
                    lineHeight: 1,
                    feed
                })
                Widgets.dump[type].objects = [
                    Widgets.path(img),
                    Widgets.text('', {
                        textAlign: 'center',
                        lineHeight: 1,
                        top: 120
                    })
                ]
                break

            case 'widget-json':
                Widgets.dump[type].options = options({
                    sid: mongoId(),
                    fontFamily: 'Casper-Bold',
                    textAlign: 'center',
                    charsCount: 160,
                    textWidth: 520,
                    lineHeight: 1,
                    fontSize: 22
                })
                Widgets.dump[type].objects = [
                    Widgets.path(img, { top: -50, left: -2 }),
                    Widgets.text(Lorem.get(), {
                        fontFamily: 'Casper-Bold',
                        textAlign: 'center',
                        lineHeight: 1,
                        top: 80
                    })
                ]
                break

            case 'widget-rss':
                Widgets.dump[type].objects = [
                    Widgets.path(img, { originX: 'left', originY: 'top', left: 0, top: -10, width: 180 }),
                    Widgets.rss('Заголовок новости', { label: 'title', left: 190, top: 0, maxWidth: 560 }),
                    Widgets.rss('Текст новости', { label: 'content', left: 190, top: 45, maxWidth: 560 }),
                    Widgets.rss('Дата', { label: 'date', left: 190, top: 140, maxWidth: 160 })
                ]
                Widgets.dump[type].options = options({
                    fontFamily: 'Casper-Bold',
                    visibleTitle: true,
                    visibleContent: true,
                    visibleDate: true,
                    originX: 'left',
                    originY: 'top',
                    charsCount: 160,
                    textWidth: 520,
                    lineHeight: .9,
                    fontSize: 18,
                    left: 300,
                    top: 200,
                })
        }
    }

    static get(widget)
    {
        if (!Widgets.dump[widget]) return Promise.resolve()

        const { Widget, options, objects } = Widgets.dump[widget]

        return loadFont(options).catch(noop)
            .then(() => new Widget({
                ...options,
                objects: objects.map(obj => {
                    obj = obj()

                    obj.set('prevent', true)

                    return obj
                })
                    .filter(Boolean)
            }))
    }
}
