export const ratio = { age: 'bdate', bdate: 'bdate', cities: 'city', firstnames: 'firstname', lastnames: 'lastname' }
export const akeys = { bdate: 1, city: 1, country: 1, interests: 1, relation: 1, sex: 1, firstname: 1, lastname: 1 }
export const skeys = { cities: 1, platform: 1, relation: 1, interests: 1, firstname: 1, lastname: 1, users: 1 }
export const pkeys = { platform: 1, lang: 1, uid: 1 }
export const names = { firstname: 1, lastname: 1 }
export const other = { member: 1, notmember: 1 }
export const dirty = { age: 1, day: 1, now: 1 }
export const tkeys = { age: 1, bdate: 1 }
export const avoid = { time: 1 }

export const build = m => Object.keys(m).reduce((w, t) => ({ ...w, [t]: m[t]() }), {})
export const empty = () => ({ value: 'empty', module: 'Empty', cmp: null })

export const empty510 = { id: null, images: [{ url: '/img/icons/1530x384.jpg' }] }
export const empty480 = { id: null, images: [{ url: '/img/icons/480x720.jpg'  }] }
export const empty150 = { id: null, images: [{ url: '/img/icons/150x150.png'  }] }

export const extended = ['appellation','readers','compact','skid','type']
export const passkeys = ['goal','funded','backers','team_a','team_b']
export const stopkeys = ['src','variables','logic']

export const modules = [
    { entity: 'text',       text: 'text',   module: 'Text',     cmp: 'widget-text'     },
    { entity: 'list',       text: 'list',   module: 'List',     cmp: 'widget-list'     },
    { entity: 'table',      text: 'table',  module: 'Table',    cmp: 'widget-table'    },
    { entity: 'tiles',      text: 'tiles',  module: 'Tiles',    cmp: 'widget-tiles'    },
    { entity: 'cover_list', text: 'covers', module: 'Covers',   cmp: 'widget-covers'   },
    { entity: 'match',      text: 'match',  module: 'Match',    cmp: 'widget-match'    },
    { entity: 'donation',   text: 'donat',  module: 'Donation', cmp: 'widget-donation' }
]

export const sizes = [
    { type: '510x128', width: 1530, height: 384 },
    { type: '160x240', width: 480,  height: 720 },
    { type: '160x160', width: 480,  height: 480 },
    { type: '50x50',   width: 150,  height: 150 },
    { type: '24x24',   width: 72,   height: 72  }
]

export const payment = {
    qiwi: {
        icon: 'payouts__icon-qiwi',
        mask: '+7##########',
        title: 'QIWI кошелек',
        descr: 'Введите номер кошелька QIWI',
        valid: v => v.length === 11,
        label: '+79991112233'
    },
    yandex: {
        icon: 'payouts__icon-yandex',
        mask: '##############',
        title: 'Яндекс.Деньги',
        descr: 'Введите номер кошелька Яндекс',
        valid: v => /^4100\d{10,11}/.test(v),
        label: '41001112223334'
    },
    webmoney: {
        icon: 'payouts__icon-webmoney',
        mask: 'R############',
        title: 'Webmoney',
        descr: 'Введите номер кошелька Webmoney',
        valid: v => /^[ZER]\d{12}/.test(v),
        label: 'R111222333444'
    },
    mobile: {
        icon: 'payouts__icon-mobile',
        mask: '+7##########',
        title: 'Счёт мобильного телефона',
        descr: 'Введите номер телефона',
        valid: v => v.length === 11,
        label: '+79991112233'
    },
    card: {
        icon: 'payouts__icon-card',
        mask: 'credit-card',
        title: 'Банковская карта',
        descr: 'Введите номер банковской карты',
        label: '4276-5500-1111-2222',
        /**
        * @see https://qna.habr.com/answer?answer_id=1861989
        */
        valid: v => {
            let num = v.replace(/ /g, ''),
                sum = 0

            for (let intVal, i = 0; i < num.length; i++) {
                intVal = parseInt(num.substr(i, 1))

                if (i % 2 === 0) {
                    intVal *= 2

                    if (intVal > 9) {
                        intVal = 1 + (intVal % 10)
                    }
                }

                sum += intVal
            }

            return sum % 10 === 0
        }
    }
}

export const currency = [
    { id: 'RUB', desc: 'Рубль',                 sign: '₽'        }, // Рубль (₽)
    { id: 'USD', desc: 'Доллар',                sign: '$'        }, // Доллар ($)
    { id: 'UAH', desc: 'Гривна',                sign: '₴'        }, // Гривна (₴)
    { id: 'BYN', desc: 'Белорусский рубль',     sign: 'бел.руб.' }, // Белорусский рубль (rub)
    { id: 'EUR', desc: 'Евро',                  sign: '€'        }, // Евро (€)
    { id: 'MDL', desc: 'Молдавский лей',        sign: 'лей'      }, // Молдавский лей (lei)
    { id: 'AZN', desc: 'Азербайджанский манат', sign: 'ман'      }, // Азербайджанский манат (man)
    { id: 'GEL', desc: 'Грузинский лари',       sign: 'лари'     }, // Грузинский лари (lari)
    { id: 'AMD', desc: 'Армянский драм',        sign: 'драм'     }, // Армянский драм (d)
    { id: 'ILS', desc: 'Израильский шекель',    sign: 'шекель'   }, // Израильский шекель (₪)
    { id: 'GBP', desc: 'Фунт стерлингов',       sign: '£'        }, // Фунт стерлингов (£)
    { id: 'TMT', desc: 'Туркменский манат',     sign: 'манат'    }, // Туркменский манат (m)
    { id: 'KGS', desc: 'Киргизский сом',        sign: 'сом'      }, // Киргизский сом (som)
    { id: 'KZT', desc: 'Казахский тенге',       sign: '₸'        }  // Казахский тенге (₸)
]

export const declin = {
    currency: {
        ru: {
            ILS: ['шекель', 'шекеля', 'шекелей'],
            TMT: ['манат', 'маната', 'манатов'],
            KGS: ['сом', 'сома', 'сомов']
        },
        en: {
            ILS: 'shekel',
            TMT: 'manat',
            KGS: 'som'
        }
    },
    humans: {
        ru: ['человек', 'человека', 'человек'],
        en: ['person', 'people', 'people']
    }
}

export const values = () => ({
    age: 0,
    alter: '{}',
    bdate: "''",
    now: "''",
    city: '{}',
    gid: null,
    gids: '[]',
    interests: "''",
    firstname: "''",
    lastname: "''",
    member: 0,
    notmember: 1,
    relation: 0,
    set: '[]',
    sex: 0
})

export const readers = () => ({
    age: { current: { from: null, to: null } },
    relation: { current: 0 },
    bdate: { current: 0 },
    sex: { current: 0 },
    firstnames: [],
    lastnames: [],
    interests: [],
    notmember: [],
    platform: [],
    cities: [],
    member: [],
    users: []
})

export const clearText = () => ({
    readers: readers(),
    variables: null,
    logic: null,
    type: 'text',
    title: '',
    descr: '',
    text: '',
    more: '',
    more_url: null
})

export const listrow = () => ({
    src: '/img/icons/150x150.png',
    title: '',
    title_url: null,
    button: '',
    button_url: null,
    icon_id: null,
    address: '',
    time: '',
    text: ''
})

export const clearList = () => ({
    readers: readers(),
    variables: null,
    logic: null,
    type: 'compact_list',
    compact: true,
    title: '',
    rows: [listrow()],
    more: '',
    more_url: null
})

export const tableHead = () => ({ text: '', align: null })
export const tableBody = () => ({ text: '', url: null, src: '/img/icons/150x150.png' })

export const clearTable = () => ({
    readers: readers(),
    variables: null,
    logic: null,
    type: 'table',
    title: '',
    head: [tableHead()],
    body: [[tableBody()]],
    more: '',
    more_url: null
})

export const tile = () => ({
    src: '/img/icons/480x480.jpg',
    title: '',
    descr: '',
    link: '',
    link_url: null,
    icon_id: null,
    url: null
})

export const clearTiles = () => ({
    readers: readers(),
    variables: null,
    logic: null,
    compact: true,
    type: 'tiles',
    title: '',
    tiles: Array.from({ length: 10 }, () => tile()),
    more: '',
    more_url: null
})

export const cover = () => ({
    src: '/img/icons/1530x384.jpg',
    title: '',
    descr: '',
    button: '',
    button_url: null,
    cover_id: null,
    url: null
})

export const clearCovers = () => ({
    readers: readers(),
    variables: null,
    logic: null,
    type: 'cover_list',
    title: '',
    rows: [cover()],
    more: '',
    more_url: null
})

export const match = () => ({
    team_a: { name: '', descr: '', icon_id: null, src: '/img/icons/150x150.png' },
    team_b: { name: '', descr: '', icon_id: null, src: '/img/icons/150x150.png' },
    events: { team_a: [], team_b: [] },
    score:  { team_a: 0, team_b: 0 },
    state: ''
})

export const clearMatch = () => ({
    readers: readers(),
    variables: null,
    logic: null,
    type: 'match',
    title: '',
    match: match(),
    more: '',
    more_url: null
})

export const clearDonat = () => ({
    readers: readers(),
    variables: null,
    logic: null,
    type: 'donation',
    title: '',
    text: '',
    data: { start: null, end: null },
    goal: 0,
    funded: 0,
    backers: 0,
    currency: null,
    more: '',
    more_url: null,
    button_url: null
})

export const map = {
    text: clearText,
    list: clearList,
    table: clearTable,
    tiles: clearTiles,
    cover_list: clearCovers,
    match: clearMatch,
    donation: clearDonat
}

export const widget = () => build(map)
