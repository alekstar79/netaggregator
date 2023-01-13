// not used

export const state = () => ({
    APP_USCOPE: 'groups',
    APP_GSCOPE: 'photos,app_widget,messages,docs,manage',
    PIXABAY_API: 'https://pixabay.com/api/',
    TARGET_URL: 'https://netaggregator.ru',
    QUERY_PREFIX: '/api',
    models: [],
    months: {
        ru: {
            full: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            short: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
        },
        en: {
            full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
    },
    days: {
        ru: {
            full: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            short: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
        },
        en: {
            full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        }
    }
})
