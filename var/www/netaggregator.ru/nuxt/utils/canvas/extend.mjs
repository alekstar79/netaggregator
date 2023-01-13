export async function injectFunctionality({ fabric })
{
    let browser = typeof process === 'undefined' || process.browser,
        module = browser ? './index.mjs' : './empty.mjs',

        { default: strtotime } = await import(/* webpackChunkName: "strtotime" */ 'locutus/php/datetime/strtotime.js'),
        { format } = await import(/* webpackChunkName: "fecha" */ 'fecha').then(m => m.default),

        { rndstring } = await import('../common/symbols.mjs'),
        { debounce } = await import('../common/debounce.mjs'),
        { jsonp, callback } = await import('../common/jsonp.mjs'),
        { createRenderingContext } = await import('../toolkit.mjs'),
        { blank, down, remove, rotate, up } = await import(/* webpackChunkName: "assets" */ '../../assets/data/canvas-icons.mjs'),
        { default: trafficList } = await import(/* webpackChunkName: "assets" */ '../../assets/data/traffic.mjs'),
        { default: html } = await import('../htmlentity.mjs'),
        { Lorem } = await import('../lorem.mjs'),

        { preventMove, preventScale } = await import('./prevent.mjs'),
        { setControls } = await import(`${module}`).then(m => m.default || m),
        { shapeAddFunctionality } = await import('./proxy-shape.mjs'),
        { frameAddFunctionality } = await import('./proxy-frame.mjs'),
        { textAddFunctionality } = await import('./proxy-text.mjs'),
        { imgAddFunctionality } = await import('./proxy-image.mjs'),
        { svgAddFunctionality } = await import('./proxy-svg.mjs'),
        { splitText } = await import('./text-renderer.mjs'),
        { i18nSettings } = await import('./i18n.mjs'),

        suggest = new URL('https://suggest-maps.yandex.ru/suggest-geo'),
        channel = new URL('https://netaggregator.ru/api/get/channel'),

        context = createRenderingContext(1590, 530),

        wMock = { pressure: 'Давление: 760 мм рт.ст.', humidity: 'Влажность: 80%', temp: '17 °C', cond: 'Облачно с прояснениями', wind: 'Ветер: 2.3 м/с, северо-восточный' },
        iMock = { subscribers: 3907, online: 112, male: 2581, female: 1326 },

        iDict = {
            en: { subscribers: 'Subscribers', online: 'Online', male: 'Male', female: 'Female' },
            ru: { subscribers: 'Подписчики', online: 'Онлайн', male: 'Муж', female: 'Жен' }
        },

        properties = [
            'subTargetCheck', // 'statefullCache', 'objectCaching', 'noScaleCache',
            'hasRotatingPoint', 'lockScalingFlip', 'lockSkewingX', 'lockSkewingY','ungrouped',
            'textAlign', 'textFill', 'textWidth', 'fontFamily', 'fontSize', 'top', 'left', 'width', 'height',
            'rounded', 'track', 'profile', 'userId', 'user', 'info', 'feed', 'channel', 'charset', 'timezone',
            'city', 'icon', 'point', 'marks', 'label', 'visibleTitle', 'visibleContent', 'visibleDate',
            'charsCount', // 'visibleCond', 'visibleWind', 'visibleHumidity', 'visiblePressure',
            'sid', 'code', 'curr', 'rate', 'short'
        ],

        corners = ['bl','br','tl','tr','ml','mb','mr','mt'],
        sorted = ['wind','pressure','himidity','cond','temp'],
        cursor = 'resize',
        action = null,

        controls = {
            ...corners.reduce((set, c) => ({ ...set, [c]: { cursor, action } }), {}),
            mtr: { cursor: null, action }
        },

        icons = {
            ...corners.reduce((set, c) => ({ ...set, [c]: { icon: blank } }), {}),
            mtr: { icon: blank },

            settings: {
                borderColor: '#0094dd',
                cornerBackgroundColor: '#0094dd',
                cornerShape: 'rect',
                cornerSize: 10
            }
        },

        unlock = (options = {}) => ({
            ...options,
            track: { left: 0, top: 0, width: 0, height: 0, scaleX: 1, scaleY: 1 },
            hasRotatingPoint: true,
            lockScalingFlip: false,
            lockSkewingX: false,
            lockSkewingY: false
        }),

        currency = {},
        traffic,
        rssdump

    function noop() {}

    function translate(dict, lang, k)
    {
        return dict[lang][k.split('.')[1]]
    }

    function pad(n)
    {
        return (n < 10 ? '0' : '') + n
    }

    function div(data)
    {
        return data.value / data.nominal
    }

    /**
     * @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/round
     * @param {Number|String|String[]} value
     * @param {Number} exp
     * @return {Number}
     */
    function decimalAdjust(value, exp = -2)
    {
        value = +value
        exp = +exp

        if (isNaN(value)) {
            return NaN
        }

        value = value.toString().split('e')
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)))
        value = value.toString().split('e')

        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp))
    }

    function convert(curr, rate)
    {
        let ret = 1.0

        if (curr === rate) {
            return ret
        }

        switch (true) {
            case rate === 'RUB' && curr in currency:
                ret = decimalAdjust(currency[curr].value / currency[curr].nominal)
                break
            case curr === 'RUB' && rate in currency:
                ret = decimalAdjust(currency[rate].nominal / currency[rate].value)
                break
            case curr in currency && rate in currency:
                ret = decimalAdjust(div(currency[curr]) / div(currency[rate]))
                break
        }

        return ret
    }

    function maxLine(dims = [], def = 'temp')
    {
        let line

        sorted.some(l => {
            if (dims.includes(l)) {
                line = l
            }

            return !!line
        })

        return line || def
    }

    async function currencyAwaiting(c = 10)
    {
        do {

            await new Promise(resolve => setTimeout(resolve, 100))

        } while (--c && !Object.keys(currency).length)
    }

    async function trafficAwaiting(c = 10)
    {
        do {

            await new Promise(resolve => setTimeout(resolve, 100))

        } while (--c && !(traffic || []).length)
    }

    function getTime(supported, locale, tz)
    {
        const date = new Date()

        return format(new Date(date.getTime() + ((date.getTimezoneOffset() + tz) * 60 * 1000)), 'shortTime', i18nSettings(locale))
    }

    function getDate(supported, locale)
    {
        return format(new Date(), 'DD MM YYYY', i18nSettings(locale))
    }

    function getFeed(src, charset)
    {
        channel.search = new URLSearchParams({ src, charset }).toString()

        return fetch(channel).then(response => response.json())
    }

    function apiRequest(query)
    {
        return fetch(`https://netaggregator.ru/api/${query}`).then(response => response.json())
    }

    function yaGeoRequest(part)
    {
        // https://suggest-maps.yandex.ru/suggest-geo?v=8&lang=ru_RU&search_type=tune&n=20&ll=48.402557,54.316855&spn=0.5,0.5&part=Моск
        suggest.search = new URLSearchParams({ v: 9, lang: 'ru_RU', search_type: 'tune', ll: '37.622505,55.753216', spn: '0.5,0.5', n: 20, part, callback }).toString()

        return jsonp(suggest.toString())
    }

    function cleanString(str)
    {
        return typeof str === 'string'
            ? html.decode(str.replace(/(<([^>]+)>)/igm, '').replace(/(\r\n|\n|\r|\s)+/igm, ' ').trim())
            : ''
    }

    function getFontDeclaration(options = {})
    {
        const { fontWeight = 400, fontStyle = 'normal', fontSize = 20, fontFamily = 'sans-serif' } = options,
            isLikelyNode = typeof window === 'undefined'

        return [
            (isLikelyNode ? fontWeight : fontStyle),
            (isLikelyNode ? fontStyle : fontWeight),
            fontSize + 'px',
            (isLikelyNode ? ('"' + fontFamily + '"') : fontFamily)
        ].join(' ')
    }

    function getContext()
    {
        return function(options = {}) {
            const ctx = this.canvas ? this.canvas.contextContainer : context

            ctx.font = getFontDeclaration(Object.assign({}, this, options))

            return ctx
        }
    }

    function initialize(initialize)
    {
        return function(options = {}) {
            if (!options.grid) {
                options.custom || (options.custom = {
                    unique: rndstring(12),
                    name: ''
                })
            }

            delete options.grid

            if (typeof initialize === 'function') {
                initialize.call(this, options)
            }
        }
    }

    function toObject(toObject)
    {
        return function(properties) {
            const custom = this.custom || { unique: rndstring(12), name: '' }

            return fabric.util.object.extend(toObject.call(this, properties), {
                custom: Object.keys(custom).reduce((c, p) => ({ ...c, [p]: custom[p] }), {})
            })
        }
    }

    function customName()
    {
        return function(name) {
            this.custom || (this.custom = { unique: rndstring(12), name: '' })
            this.custom.name = name
            return this
        }
    }

    function setUnique()
    {
        return function() {
            this.custom || (this.custom = { unique: '', name: '' })
            this.custom.unique = rndstring(12)
            return this
        }
    }

    function isOnScreen(isOnScreen)
    {
        return function(calculate) { try {
            return !this.shadow ? isOnScreen.call(this, calculate) : true
        } catch (e) {
        } }
    }

    function getSubObjectsType({ type })
    {
        switch (type) {
            case 'widget-weather': return 'weather-item'
            case 'widget-countdown': return 'count'
            case 'widget-rss': return 'rss-item'
        }

        return 'text'
    }

    function preventSubObjects(obj, { scale = false, move = false } = {})
    {
        scale && obj.on('scaling', preventScale)
        move && obj.on('moving', preventMove)

        obj.customiseControls(controls)
        obj.customiseCornerIcons(icons)
    }

    function setVisibilityItem(item, visible)
    {
        if (this.target || this.rest.length) this._modify({ suppress: true })

        const label = item.slice(7).toLowerCase()

        this._objects.find(o => o.label === label).visible = visible

        if (!['redo','undo'].includes(this.stateAction)) {
            return this.widgetUpdate()
        }
    }

    function initDimensions(dims)
    {
        this.callSuper('initDimensions')

        if ((this.group || {}).type !== 'widget-weather') return

        dims && (this.dims = dims)
        dims || (dims = this.dims)

        this.mtxt = dims ? this.smtl[maxLine(dims, 'temp')] : this.mtxt || this.smtl.temp

        const w = this.getContext().measureText(this.mtxt).width

        if (w !== this.width) {
            this.width = w
        }
    }

    fabric.RssItem = fabric.util.createClass(fabric.Text, {
        type: 'rss-item',

        prevent: true,

        lockUniScaling: false,
        lockScalingX: false,
        lockScalingY: false,

        textAlign: 'left',
        originX: 'left',
        originY: 'top',

        originalString: '',
        maxWidth: 400,
        chars: 200,

        toObject()
        {
            return this.callSuper('toObject', ['originalString','label','chars','maxWidth'])
        },

        _set(...args)
        {
            let text, ctx, width = /*.58 */ this.maxWidth

            switch (args[0]) {
                case 'canvas':
                    if ((ctx = args[1].contextContainer)) {
                        text = this.text.replace(/(\r\n|\n|\r|\s)+/igm, ' ')
                        ctx.font = getFontDeclaration(this)

                        if (text.length < this.chars) {
                            text = this.originalString
                        }
                        if (text.length > this.chars) {
                            text = text.substring(0, this.chars - 1) + '…'
                        }

                        this.text = splitText(ctx, text, width)
                            .filter(e => e !== '')
                            .join('\n')
                    }
                    break
                case 'text':
                    if ((text = args[1])) {
                        text = text.replace(/(\r\n|\n|\r|\s)+/igm, ' ')
                        ctx = this.getContext()

                        if (text.length < this.chars) {
                            text = this.originalString
                        }
                        if (text.length > this.chars) {
                            text = text.substring(0, this.chars - 1) + '…'
                        }

                        args[1] = splitText(ctx, text, width)
                            .filter(e => e !== '')
                            .join('\n')
                    }
                    break
                case 'maxWidth':
                    text = this.text.replace(/(\r\n|\n|\r|\s)+/igm, ' ')
                    ctx = this.getContext()

                    this.text = splitText(ctx, text, /*.58 */ args[1])
                        .filter(e => e !== '')
                        .join('\n')

                    break
                case 'fontFamily':
                    text = this.text.replace(/(\r\n|\n|\r|\s)+/igm, ' ')
                    ctx = this.getContext({ fontFamily: args[1] })

                    this.text = splitText(ctx, text, width)
                        .filter(e => e !== '')
                        .join('\n')

                    break
                case 'fontSize':
                    text = this.text.replace(/(\r\n|\n|\r|\s)+/igm, ' ')
                    ctx = this.getContext({ fontSize: args[1] })

                    this.text = splitText(ctx, text, width)
                        .filter(e => e !== '')
                        .join('\n')

                    break
                case 'chars':
                    text = this.text.replace(/(\r\n|\n|\r|\s)+/igm, ' ')
                    ctx = this.getContext()

                    if (text.length < args[1]) {
                        text = this.originalString
                    }
                    if (text.length > args[1]) {
                        text = text.substring(0, args[1] - 1) + '…'
                    }

                    this.text = splitText(ctx, text, width)
                        .filter(e => e !== '')
                        .join('\n')
            }

            this.callSuper('_set', ...args)
        }
    })

    fabric.RssItem.fromObject = function(object, callback) {
        fabric.Object._fromObject('RssItem', object, callback, 'text')
    }

    fabric.WeatherItem = fabric.util.createClass(fabric.Text, {
        type: 'weather-item',

        dims: sorted,
        mtxt: null,

        smtl: {
            humidity: 'Влажность: 100%',
            pressure: 'Давление: 760 мм рт.ст.',
            wind: 'Ветер: 15.7 м/с, северо-восточный',
            cond: 'Облачно с прояснениями',
            temp: '32 °C'
        },

        initDimensions,

        _set(...args)
        {
            this.callSuper('_set', ...args)

            if ((this.group || {}).type !== 'widget-weather') return

            switch (args[0]) {
                case 'charSpacing':
                case 'fontFamily':
                case 'fontWeight':
                case 'fontSize':
                case 'canvas':
                    initDimensions.call(this)
            }
        }
    })

    fabric.WeatherItem.fromObject = function(object, callback) {
        fabric.Object._fromObject('WeatherItem', object, callback, 'text')
    }

    fabric.Count = fabric.util.createClass(fabric.Text, {
        type: 'count',

        prevent: true,

        lockUniScaling: false,
        lockScalingX: false,
        lockScalingY: false,

        textAlign: 'center',
        originX: 'center',
        originY: 'center',

        toObject()
        {
            return this.callSuper('toObject', ['interval','mark'])
        },

        _render(ctx)
        {
            this.callSuper('_render', ctx)

            if (!this.mark.visible) return

            ctx.font = this.mark.font

            if (!this.mark.left) {
                this.mark.left = -ctx.measureText(this.mark.text).width / 2
            }

            ctx.fillText(
                this.mark.text,
                this.mark.left,
                this.fontSize / 2 + 10
            )
        }
    })

    fabric.Count.prototype.initialize = (function(initialize) {
        return function(...args) {
            initialize.call(this, ...args)

            browser && preventSubObjects(this)

            let text
            switch (args[1].interval) {
                case 'year':   text = 'year'; break
                case 'month':  text = 'mon';  break
                case 'day':    text = 'day';  break
                case 'hour':   text = 'hr';   break
                case 'minute': text = 'min';  break
            }

            this.set(unlock({
                mark: {
                    visible: true,
                    font: getFontDeclaration(),
                    left: null,
                    text
                }
            }))
        }

    })(fabric.Count.prototype.initialize)

    fabric.Count.fromObject = function(object, callback) {
        fabric.Object._fromObject('Count', object, callback, 'text')
    }

    /**
    * @see https://overcoder.net/q/121351/%D1%80%D0%B0%D0%B7%D0%BD%D0%B8%D1%86%D0%B0-%D0%BC%D0%B5%D0%B6%D0%B4%D1%83-%D0%B4%D0%B2%D1%83%D0%BC%D1%8F-%D0%B4%D0%B0%D1%82%D0%B0%D0%BC%D0%B8-%D0%B2-%D0%B3%D0%BE%D0%B4%D0%B0%D1%85-%D0%BC%D0%B5%D1%81%D1%8F%D1%86%D0%B0%D1%85-%D0%B4%D0%BD%D1%8F%D1%85-%D0%B2-javascript#840688
    * @note npm i -S locutus [for strtotime]
    * @param {Number} d1
    * @param {Number} d2
    * @param {Boolean} started
    * @return {{month: number, hour: number, year: number, day: number, minute: number}|Boolean}
    */
    function dateDiff(d1, d2, started = false)
    {
        if (d1 >= d2) return false

        let d3, diffs = { year: 0, month: 0, day: 0, hour: 0, minute: 0 }

        Object.keys(diffs).forEach(interval => {
            while (d2 >= (d3 = strtotime(`+1 ${interval}`, d1))) {
                ++diffs[interval]
                d1 = d3
            }

            if (started && !diffs[interval]) {
                delete diffs[interval]
                started = true
            } else {
                started = false
            }
        })

        return diffs
    }

    /**
    * @see https://overcoder.net/q/121351/%D1%80%D0%B0%D0%B7%D0%BD%D0%B8%D1%86%D0%B0-%D0%BC%D0%B5%D0%B6%D0%B4%D1%83-%D0%B4%D0%B2%D1%83%D0%BC%D1%8F-%D0%B4%D0%B0%D1%82%D0%B0%D0%BC%D0%B8-%D0%B2-%D0%B3%D0%BE%D0%B4%D0%B0%D1%85-%D0%BC%D0%B5%D1%81%D1%8F%D1%86%D0%B0%D1%85-%D0%B4%D0%BD%D1%8F%D1%85-%D0%B2-javascript#840685
    * @see https://obninsksite.ru/blog/javascript-and-jquery/timer-js
    */
    function setTimeRemaining(point)
    {
        if (this.target || this.rest.length) return

        const reload = typeof point !== 'undefined'

        point || (point = this.point || strtotime('+6 day 23 hour 59 minute', null))

        let intervals, left, top, previousCounts, objects, finish, time

        finish = !(time = dateDiff(new Date().getTime() / 1000, point, reload))
        objects = this._objects.filter(o => o.type === 'count')

        time || (time = { day: 0, hour: 0, minute: 0 })

        if ((!reload || finish) && objects.length) {
            objects.forEach(o => o.set('text', pad(time[o.interval] || 0)))

        } else {
            intervals = Object.keys(time)
            left = this.left + 75
            top = this.top - 25

            if (!intervals.length) {
                intervals = ['day','hour','minute']
            }

            this._restoreObjectsState()
            fabric.util.resetObjectTransform(this)

            previousCounts = this._objects.filter(o => o.type === 'count')
            this._objects = this._objects.filter(o => o.type !== 'count')

            intervals.forEach((interval, i) => {
                const old = previousCounts.find(o => o.interval === interval),
                    t = pad(time[interval] || 0)

                if (old) {
                    left = old.left
                    top = old.top
                }

                this._objects.push(new fabric.Count(t, {
                    fontFamily: this.fontFamily,
                    fontSize: this.fontSize,
                    fill: this.textFill,
                    canvas: this.canvas,
                    group: this,

                    left,
                    top,

                    interval
                }))

                left += (70 * i)
            })

            this._calcBounds()
            this._updateObjectsCoords()
            this.setCoords()
        }

        this.point = point
        this.dirty = true
    }

    setControls(fabric.Object.prototype, {
        tl: { action: 'scale',  cursor: 'nw-resize' },
        tr: { action: 'scale',  cursor: 'ne-resize' },
        bl: { action: 'remove',   cursor: 'pointer' },
        br: { action: 'moveUp',   cursor: 'pointer' },
        mb: { action: 'moveDown', cursor: 'pointer' },
        mtr: { action: 'rotate' }
    },{
        settings: {
            borderColor: '#0094dd',
            cornerBackgroundColor: '#0094dd',
            cornerShape: 'circle',
            cornerPadding: 7,
            cornerSize: 20
        },

        mtr: { icon: rotate },
        tr:  { icon: null  },
        mb:  { icon: down },
        br:  { icon: up },
        bl:  { icon: remove }
    })

    Object.entries({
        calendar: {},
        currency: { curr: 'USD', rate: 'RUB', short: false },
        traffic: { clist: trafficList },
        weather: { city: null },
        profile: {
            profile: 'last-subscriber',
            userId: null,
            user: null
        },
        countdown: { tid: 0 },
        time: { tid: 0 },
        feed: { tid: 0 },
        json: { sid: '' },
        info: {},
        rss: {
            channel: 'https://news.yandex.ru/index.rss',
            charset: 'utf-8',
            item: 'random'
        }

    }).forEach(function([w, options]) {
        const props = ['charSpacing','lineHeight','textAlign','fontFamily','fontSize','textFill']
                .concat(w === 'rss' ? ['visibleTitle','visibleContent','visibleDate','charsCount','textWidth'] : [])
                .concat(w === 'json' ? ['charsCount','textWidth'] : [])
                .concat(w === 'countdown' ? ['point','marks'] : [])
                .concat(w === 'profile' ? ['rounded'] : ['icon'])
                .concat(w === 'traffic' ? ['code'] : [])
                .concat(w === 'weather' ? ['info'] : [])
                .concat(w === 'time' ? ['timezone'] : [])
                .concat(w === 'info' ? ['info'] : [])
                .concat(w === 'feed' ? ['feed'] : []),

            W = `Widget${w[0].toUpperCase()}${w.slice(1)}`,

            marks = props.reduce((set, p) => {
                let list = w === 'traffic' ? trafficList.slice() : [], v = true

                switch (p) {
                    case 'visibleTitle':    v = true;            break
                    case 'visibleContent':  v = true;            break
                    case 'visibleDate':     v = true;            break
                    case 'charsCount':      v = 160;             break
                    case 'charSpacing':     v = 0;               break
                    case 'lineHeight':      v = 1;               break
                    case 'textAlign':       v = 'left';          break
                    case 'textFill':        v = 'rgba(0,0,0,1)'; break
                    case 'fontFamily':      v = 'Archive';       break
                    case 'fontSize':        v = 32;              break
                    case 'textWidth':       v = 520;             break
                    case 'timezone':        v = 180;             break
                    case 'point':           v = 0;               break
                    case 'info':            v = [];              break
                    case 'feed':            v = [];              break
                    case 'code':            v = list[0];         break
                    case 'marks':           v = true;            break
                }

                return { ...set, [p]: v }

            }, {})

        fabric[W] = fabric.util.createClass(fabric.Group, {
            type: `widget-${w}`,

            subTargetCheck: true,
            ungrouped: false,

            target: null,
            rest: [],

            originX: 'left',
            originY: 'top',

            height: 0,
            width: 0,
            left: 0,
            top: 0,

            ...options,
            ...marks
        })

        fabric[W].prototype._ungroup = fabric[W].prototype._modify = fabric[W].prototype._check = noop

        fabric[W].prototype.initialize = (function(initialize) {
            return function({ objects, ...options })
            {
                this.stopFix = true

                this.on('removed', () => this.tid && clearTimeout(this.tid))

                this.on('added', () => {
                    if (browser) {
                        this.canvas.on('draw:state', this.drawState)

                        if (['redo','undo'].includes(options.stateAction)) {
                            this.canvas.stackManagerStop = true
                        }

                        setTimeout(() => {
                            this.canvas.stackManagerStop = false
                            this.stopFix = false

                        }, 200)
                    }

                    const ldts = this.canvas.localeDateString

                    switch (this.type) {
                        case 'widget-info': browser && this.setinfo(); break
                        case 'widget-feed': browser && this.looping(); break
                        case 'widget-time': this.timing();  break
                        case 'widget-json': this.setJson(); break
                        case 'widget-rss': this.initFeed(); break

                        case 'widget-calendar':
                            this.toSet({ text: getDate(ldts, this.locale) }, 'text')
                            break
                        case 'widget-weather':
                            browser && this.setweather({}, !!options.init)
                            break
                        case 'widget-countdown':
                            this.counting()
                            break
                        case 'widget-currency':
                            this.setcurrency()
                            break
                        case 'widget-traffic':
                            this.settraffic()
                            break
                    }
                })

                initialize.call(this, objects, { ...unlock(options) })

                if (!browser) return

                switch (this.type) {
                    case 'widget-currency':
                        this.initcurrency()
                        break
                    case 'widget-traffic':
                        this.inittraffic()
                        break
                }

                this.on('mousedblclick', e => setTimeout(this._ungroup.bind(this, e)))

                this._modify = this._modify.bind(this)
                this._check = this._check.bind(this)

                this._objects.forEach(o => {
                    o.on('mousedblclick', this._ungroup.bind(this, { subTargets: [o] }))
                    preventSubObjects(o)
                    o.set(unlock())
                })

                setControls(this, {
                    tr: {
                        cursor: 'pointer',
                        action: () => {
                            this.stopFix = true
                            this.canvas.trigger('widget:settings', this)
                            setTimeout(() => {
                                this.stopFix = false
                            }, 200)
                        }
                    }
                })
            }

        })(fabric[W].prototype.initialize)

        fabric[W].prototype.drawState = function({ state }) {
            this.still = state
        }

        fabric[W].prototype.stackManager = function(value) {
            this.canvas && (this.canvas.stackManagerStop = !!value)

            this.stopFix = !!value
        }

        fabric[W].prototype.toObject = (function(toObject) {
            return function(include = []) {
                return toObject.call(this, properties.concat(include))
            }

        })(fabric[W].prototype.toObject)

        fabric[W].prototype.initDimensions = function(skip = false) {
            const type = getSubObjectsType(this)

            this._objects.forEach(o => {
                if (o.type === type) {
                    o.__skipDimension = skip
                    o.initDimensions(this.info || [])
                }
                if (this.width < o.width) {
                    this.width = o.width
                }

                o.setCoords()
            })

            skip || this.setCoords()

            fabric.request()
        }

        fabric[W].prototype.shake = function() {
            if (!this.canvas) return Promise.resolve()

            return new Promise(resolve => {
                if (!this.target && !this.rest.length) {
                    this._ungroup({ subTargets: [this._objects[0]] })
                }

                setTimeout(resolve)

            }).then(() => {
                this._modify({ suppress: true })
            })
                .catch(noop)
        }

        fabric[W].prototype.requestRender = debounce(function() {
            !this.still && this.canvas && this.canvas.requestRenderAll()

        }, 0)

        fabric[W].prototype.widgetUpdate = debounce(function({ resolve, shake = true, skip = false } = {}) {
            this.stackManager(1)

            this.initDimensions(skip)

            if (typeof resolve !== 'function') {
                resolve = noop
            }
            if (shake && browser) {
                return this.shake().finally(() => {
                    this.stackManager(0)
                    resolve()
                })
            }

            this.stackManager(0)

            resolve()

        }, 0)

        fabric[W].prototype.distort = function(...args) {
            this.canvas && this.canvas.trigger('canvas:distort', ...args)
        }

        fabric[W].prototype.toSet = function(set, type) {
            return new Promise(resolve => {
                this._objects.every(o => {
                    if (!type || type === o.type) {
                        o.set(set)
                    }

                    return true
                })

                if (!['redo','undo'].includes(this.stateAction)) {
                    return this.widgetUpdate({ resolve })
                }

                resolve()
            })
        }

        if (w === 'profile') {
            fabric[W].prototype.rounding = function() {
                let rect, r = this.rounded

                return new Promise(resolve => {
                    if ((rect = this._objects.find(o => o.type === 'rect'))) {
                        rect.set({ rx: r ? rect.height / 2 : 0, ry: r ? rect.width / 2 : 0 })

                        if (!['redo','undo'].includes(this.stateAction)) {
                            return this.widgetUpdate({ resolve })
                        }
                    }

                    resolve()
                })
            }
        } else if (w === 'currency') {
            fabric[W].prototype.initcurrency = function() {
                Object.keys(currency).length || apiRequest('currency').then(c => currency = c).catch(noop)
            }
            fabric[W].prototype.setcurrency = async function() {
                if (!browser) return

                let v, text

                if ((text = this._objects.find(o => o.type === 'text'))) {
                    await currencyAwaiting()

                    v = convert(this.curr, this.rate)
                    text.set({ text: this.short ? `${this.curr} ${v}` : `1 ${this.curr} ${v} ${this.rate}` })

                    if (!['redo','undo'].includes(this.stateAction)) {
                        return this.widgetUpdate({})
                    }
                }
            }
        } else if (w === 'traffic') {
            fabric[W].prototype.inittraffic = function() {
                traffic || apiRequest('traffic').then(c => { traffic = c }).catch(noop)
            }
            fabric[W].prototype.settraffic = async function() {
                if (!browser) return

                await trafficAwaiting()

                const condition = t => t.code === this.code.geoid || t.code === this.code.code,
                    { icon, level, hint } = (traffic || []).find(condition) || {}

                if (icon) {
                    this._objects.find(o => o.type === 'circle')
                        .set({ fill: icon, color: icon })
                }
                if (level && hint) {
                    this._objects.find(o => o.type === 'text')
                        .set('text', `${hint}\n${level}`)
                }
                if (!['redo','undo'].includes(this.stateAction)) {
                    return this.widgetUpdate({})
                }
            }
        } else if (w === 'info') {
            fabric[W].prototype.setinfo = function(data = {}) {
                let $t, text

                return new Promise(resolve => {
                    if ((text = this._objects.find(o => o.type === 'text'))) {
                        $t = this.canvas.$t || translate.bind(null, iDict, this.locale || 'ru')
                        text.set({ text: this.info.map(p => $t(`graph.${p}`) + `: ${data[p] || iMock[p]}`).join('\n') })

                        if (!['redo','undo'].includes(this.stateAction)) {
                            return this.widgetUpdate({ resolve })
                        }
                    }

                    resolve()
                })
            }
        } else if (w === 'rss') {
            fabric[W].prototype.setVisibilityItem = setVisibilityItem

            fabric[W].prototype.randomEvent = function() {
                rssdump && this.setFeed(rssdump[Math.floor(Math.random() * rssdump.length)])
            }
            fabric[W].prototype.initFeed = function() {
                if (!browser || !this.channel) return

                if ((rssdump || []).length) {
                    return this.randomEvent()
                }

                getFeed(this.channel, this.charset)
                    .then(({ response: r }) => {
                        if (r.feed?.length) {
                            rssdump = r.feed

                            this.randomEvent()
                        }

                    }).catch(noop)
            }
            fabric[W].prototype.setFeed = function(feed) {
                if (this.target || this.rest.length) this._modify({ suppress: true })

                let text, i = 0

                this._objects.some(o => {
                    if (!['title', 'content', 'date'].includes(o.label)) return false

                    text = cleanString(feed[o.label])

                    o.set({ text, originalString: text })

                    return ++i > 2
                })

                if (!['redo','undo'].includes(this.stateAction)) {
                    return this.widgetUpdate()
                }
            }
            fabric[W].prototype.setCharsCount = function(chars) {
                if (this.target || this.rest.length) this._modify({ suppress: true })

                let i = 0

                this._objects.some(o => {
                    if (!['title', 'content'].includes(o.label)) return false

                    o.set({ chars })

                    return ++i > 1
                })
            }
        } else if (w === 'json') {
            fabric[W].prototype.setJson = function({ width, size, chars, text } = {}) {
                if (this.target || this.rest.length) this._modify({ suppress: true })

                if (typeof text === 'undefined') {
                    text = Lorem.get()
                }

                chars || (chars = this.charsCount)
                width || (width = this.textWidth)
                size  || (size = this.fontSize)

                let obj, ctx = this.getContext({ fontSize: size })

                if (ctx && (obj = this._objects.find(o => o.type === 'text'))) {
                    text = text.replace(/(\r\n|\n|\r|\s)+/igm, ' ')

                    obj.set({ fontSize: size, width, })

                    if (text.length > chars) {
                        text = text.substring(0, chars - 1).trim() + '…'
                    }

                    text = splitText(ctx, text, width)
                        .filter(e => e !== '')
                        .join('\n')

                    return this.toSet({ text }, 'text')
                        .then(this.distort.bind(this))
                }

                return Promise.resolve()
            }
        } else if (['countdown', 'time', 'feed'].includes(w)) {
            fabric[W].prototype.next = function(fn, ms) {
                this.tid && clearTimeout(this.tid)
                this.tid = setTimeout(fn, ms)

                this.initDimensions()
                this.dirty = true
            }

            switch (w) {
                case 'countdown':
                    fabric[W].prototype.counting = function() {
                        const self = this

                        ;(function loop() {
                            setTimeRemaining.call(self)
                            self.next(loop, 1000 * (60 - new Date().getSeconds()))
                        })()
                    }
                    fabric[W].prototype.switchMarks = function(v) {
                        this._objects.forEach(o => {
                            if (o.type === 'count') {
                                o.set('mark', { ...o.mark, visible: v })
                            }
                        })
                    }
                    break
                case 'time':
                    fabric[W].prototype.timing = function() {
                        let text = this._objects.find(o => o.type === 'text'),
                            ldts = this.canvas.localeDateString,
                            self = this

                        ;(function loop() {
                            text.text = getTime(ldts, self.locale, self.timezone)
                            self.next(loop, 1000 * (60 - new Date().getSeconds()))
                        })()
                    }
                    fabric[W].prototype.setTimezone = function(offset) {
                        this.timezone = offset
                        this.timing()
                    }
                    break
                case 'feed':
                    fabric[W].prototype.looping = browser
                        ? function() {
                            let text = this._objects.find(o => o.type === 'text'),
                                self = this,
                                i = 0

                            ;(function loop() {
                                i %= self.feed.length
                                self.feed = self.feed.filter(f => typeof f === 'string')
                                text.text = self.feed[i++] || ''
                                self.next(loop, 1e4)
                            })()
                        }
                        : function(n) {
                            this._objects.find(o => o.type === 'text')
                                .set('text', this.feed[n] || '')
                        }
            }
        } else if (w === 'weather') {
            fabric[W].prototype.find = yaGeoRequest

            fabric[W].prototype.setweather = function(data = {}, update = false) {
                let text

                return new Promise(resolve => {
                    if ((text = this._objects.find(o => o.type === 'weather-item'))) {
                        text.set({ text: this.info.map(p => `${data[p] || wMock[p]}`).join('\n') })

                        if (update && !['redo','undo'].includes(this.stateAction)) {
                            return this.widgetUpdate({ resolve, skip: true })
                        }
                    }

                    resolve()
                })
            }
        }

        fabric[W].fromObject = ({ objects, ...options }, callback) => {
            options = fabric.util.object.clone(options, true)

            fabric.util.enlivenObjects(objects, objects => {
                callback(new fabric[W]({ objects, ...options }))
            })
        }

        fabric[W].async = true

        if (!browser) return

        fabric[W].prototype.onChangeFix = debounce(function() {
            if (this.stopFix || !this.canvas) {
                this.stopFix = false
                return
            }

            this.canvas.trigger('programmatic')

        }, 0)

        fabric[W].prototype._check = function({ target }) {
            if (target !== this.target && !this.rest.find(o => o === target)) {
                this._modify()
            }
        }

        fabric[W].prototype._ungroup = function({ subTargets: [target] }) {
            if (this.ungrouped || !target || !this.canvas || this.target) return

            this.ungrouped = this.canvas.stackManagerStop = true
            this.rest = this._objects.filter(o => o !== target)
            this.target = target

            this.canvas.trigger('leave:events', [])
            this.canvas.on('mouse:down', this._check)
            this.target.on('modified', this._modify)

            this.rest.forEach(o => {
                o.on('modified', this._modify)
            })

            this.initDimensions()
            this.canvas.discardActiveObject()
            this.removeWithUpdate(target)
            this.canvas.insertTo(target)

            if (this.rest.length) {
                this.rest.forEach(this.removeWithUpdate, this)
                this.rest.forEach(this.canvas.insertTo, this.canvas)
            }

            this.canvas.setActiveObject(target)
        }

        fabric[W].prototype._modify = function({ suppress, e = {} } = {}) {
            if (!this.target || !this.canvas) return

            this.canvas.off('mouse:down', this._check)
            this.target.off('modified', this._modify)

            this.rest.forEach(o => {
                o.off('modified', this._modify)
            })

            this.canvas.discardActiveObject()
            this.canvas.remove(this.target)
            this.addWithUpdate(this.target)

            if (this.rest.length) {
                this.canvas.remove(...this.rest)
                this.rest.forEach(this.addWithUpdate, this)
            }

            this.initDimensions()
            this.canvas.setActiveObject(this)

            this.ungrouped = this.canvas.stackManagerStop = false
            this.target = null
            this.rest = []

            this.canvas.trigger('restore:events', [])

            if (!suppress || e.type === 'mouseup') {
                this.canvas.trigger('programmatic')
            }
        }

        fabric[W] = new Proxy(fabric[W], {
            construct(T, args)
            {
                const target = new T(...args)

                const proxy = new Proxy(target, {
                    set(target, prop, value) {
                        switch (prop) {
                            case 'charSpacing':
                            case 'lineHeight':
                            case 'textAlign':
                            case 'fontFamily':
                            case 'fontSize':
                                target.dirty = Reflect.set(target, prop, value)
                                target.toSet({ [prop]: value }, getSubObjectsType(target))
                                if (target.type === 'widget-json') {
                                    target.setJson()
                                }
                                break
                            case 'textFill':
                                target.dirty = Reflect.set(target, prop, value)
                                target.toSet({ fill: value }, ['widget-traffic','widget-profile'].includes(target.type) ? 'text' : null)
                                break
                            case 'textWidth':
                                target.dirty = Reflect.set(target, prop, value)
                                switch (target.type) {
                                    case 'widget-rss':
                                        target.toSet({ maxWidth: value }, 'rss-item')
                                        break
                                    case 'widget-json':
                                        target.setJson({ width: value })
                                        break
                                }
                                break
                            case 'charsCount':
                                target.dirty = Reflect.set(target, prop, value)
                                switch (target.type) {
                                    case 'widget-rss':
                                        target.setCharsCount(value)
                                        break
                                    case 'widget-json':
                                        target.setJson({ chars: value })
                                        break
                                }
                                break
                            case 'channel':
                            case 'charset':
                                target.dirty = Reflect.set(target, prop, value)
                                target.initFeed()
                                break
                            case 'visibleContent':
                            case 'visibleTitle':
                            case 'visibleDate':
                                target.dirty = Reflect.set(target, prop, value)
                                target.setVisibilityItem(prop, value)
                                break
                            case 'rounded':
                                target.dirty = Reflect.set(target, prop, value)
                                target.rounding()
                                break
                            case 'marks':
                                target.dirty = Reflect.set(target, prop, value)
                                target.switchMarks(value)
                                break
                            case 'icon':
                                target.dirty = Reflect.set(target, prop, value)
                                target.toSet({ visible: value }, target.type === 'widget-traffic' ? 'circle' : 'path')
                                break
                            case 'short':
                            case 'curr':
                            case 'rate':
                                target.dirty = Reflect.set(target, prop, value)
                                target.setcurrency()
                                break
                            case 'code':
                                target.dirty = Reflect.set(target, prop, value)
                                target.settraffic()
                                break
                            case 'info':
                                target.dirty = Reflect.set(target, prop, value)
                                switch (target.type) {
                                    case 'widget-weather':
                                        target.setweather()
                                        break
                                    case 'widget-info':
                                        target.setinfo()
                                        break
                                }
                                break
                            case 'point':
                                setTimeRemaining.call(target, value)
                                target.dirty = true
                                break

                            default:
                                Reflect.set(target, prop, value)
                        }

                        if (browser && prop in marks) {
                            target.onChangeFix()
                        }
                        if (browser) {
                            fabric.request()
                        }

                        return true
                    }
                })

                proxy.originalTarget = target

                return proxy
            }
        })
    })

    fabric.Object.prototype.initialize = initialize(fabric.Object.prototype.initialize)
    fabric.Object.prototype.isOnScreen = isOnScreen(fabric.Object.prototype.isOnScreen)
    fabric.Object.prototype.toObject = toObject(fabric.Object.prototype.toObject)

    fabric.Object.prototype.customName = customName()
    fabric.Object.prototype.getContext = getContext()
    fabric.Object.prototype.setUnique = setUnique()

    fabric.Triangle = shapeAddFunctionality(fabric.Triangle, fabric)
    fabric.Ellipse = shapeAddFunctionality(fabric.Ellipse, fabric)
    fabric.Line = shapeAddFunctionality(fabric.Line, fabric)
    fabric.Rect = shapeAddFunctionality(fabric.Rect, fabric)

    fabric = frameAddFunctionality(fabric)
    fabric = textAddFunctionality(fabric)
    fabric = imgAddFunctionality(fabric)
    fabric = svgAddFunctionality(fabric)

    return fabric
}
