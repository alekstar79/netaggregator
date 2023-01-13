/* Базовые переменные

Args.uid - идентификатор текущего пользователя.
Args.platform - тип платформы, с которой открыта группа:
    web, mobile, android, iphone

Args.lang - идентификатор языка пользователя:
    0 — русский
    1 — украинский
    2 — белорусский
    3 — английский
    4 — испанский
    5 — финский
    6 — немецкий
    7 — итальянский
*/

export const variables = `var users = API.users.get({ fields: 'sex' }),
    platform = Args.platform,
    lang = Args.lang,
    uid = Args.uid,
    firstname = null,
    lastname = null,
    sex = null;

if (users.length) {
    firstname = users[0].first_name;
    lastname = users[0].last_name;
    sex = users[0].sex;
}`

/* var peer = 'заглянул';
var decide = 'Решил';

if (sex != 2) {
    peer = 'заглянула';
    decide = 'Решила';
}

var main_title = "Спасибо что " + peer + " ко мне на огонек, ";
var row_title = decide + " полакомиться клубничкой?";
var text = "У тебя прекрасный вкус! Может расскажешь о нас друзьям, пусть тоже подсядут на porn stack... ;)";

if (Args.lang != 0) {
    main_title = "Thank you for stopping by my place ";
    row_title = "Decided to enjoy the obscene?";
    text = "You have great taste! Maybe you can tell your friends about us, let them get hooked on porn stack too... ;)";
}

return {
    title: main_title + firstname + '!',
    rows: [
        {
            icon_id: 'id' + uid,
            title: row_title,
            text: text
        }
    ]
} */

// main_title: Спасибо что заглянул ко мне на огонек. Thank you for stopping by my place
// main_title: С новым годом тебя, ... Happy new year to you ...
// main_title: Я рада тебе. I'm glad to see you
export const list1 = `${variables}

var data = {
    title: 'Спасибо что заглянул ко мне на огонек, ' + firstname + '!',
    rows: [{
        icon_id: 'id' + uid,
        title: 'Решил полакомиться клубничкой?',
        text: 'У тебя прекрасный вкус! Может расскажешь о нас друзьям, пусть тоже подсядут на porn stack... ;)'
    }]
};

if (sex != 2) {
    data.title = 'Спасибо что заглянула ко мне на огонек, ' + firstname + '!';
    data.rows[0].title = 'Решила полакомиться клубничкой?';
}
if (lang != 0) {
    data.title = 'Thank you for stopping by my place ' + firstname + '!';
    data.rows[0].title = 'Decided to enjoy the obscene?';
    data.rows[0].text = 'You have great taste! Maybe you can tell your friends about us, let them get hooked on porn stack too... ;)';
}

return data;`

export const list2 = `${variables}

var data = {
    title: 'Приветствуем тебя, ' + firstname + '!',
    rows: [{
        icon_id: 'id' + uid,
        title: 'Это официальная страничка приложения Netaggregator.',
        text: 'Удобный инструмент, с помощью которого, ты легко сможешь кастомизировать свою группу, тем самым придать выразительности и повысить узнаваемость своего сообщества.'
    }]
};

if (lang != 0) {
    data.title = 'Hello ' + firstname + '!';
    data.rows[0].title = 'This is the official page of the Netaggregator App.';
    data.rows[0].text = 'A handy tool with which you can easily customize your group, thereby giving expressiveness and raising awareness of your community.';
}

return data;`

/* export const list = `${variables}
return {
    title: 'Рестораны',
    rows: [
        {
            title: "Корюшка",
            // title_url: '/porn_on_stack',
            button: "Забронировать стол",
            button_url: "/porn_on_stack",
            icon_id: 'id' + Args.uid,
            address: "Петропавловская крепость, д. 3",
            time: "Каждый день с 12:00 до 1:00",
            text: "Если бы Петр I решил построить ресторан, это была бы «Корюшка» — заведение с видом на стрелку Васильевского острова, прямо у Петропавловской вблизи шумных вод Невы."
        },
        {
            title: 'Food Park',
            // title_url: '/porn_on_stack',
            button: 'Забронировать стол',
            button_url: '/osheller',
            icon_id: 'id' + Args.uid,
            address: 'Александровский парк, д. 4/3, лит. А',
            time: 'Каждый день с 12:00 до 1:00',
            text: 'Давно ли вы красиво, с чувством и толком ели в парке? Главное украшение Александровского парка — Food Park приглашает на еду со всех концов света на четвертый этаж ТРЦ «Великан».'
        }
    ],
    more: 'Перейти',
    more_url: '/'
}` */

export const table = `{
    title: 'Таблица',
    title_url: '/',
    head: [
        { text: 'Первая колонка' },
        { text: 'Вторая колонка', align: 'center' }
    ],
    body: [
        [
            { text: 'Первая ячейка первой строки', icon_id: null },
            { text: 'Вторая ячейка первой строки', url: '/wall-12345_54321' }
        ],
        [
            { text: 'Первая ячейка второй строки', icon_id: null },
            { text: 'Вторая ячейка второй строки', url: '/wall-12345_54321' }
        ]
    ],
    more: 'Перейти',
    more_url: '/'
}`

export const tiles = `{
    title: 'Фильмы',
    title_url: '/',
    tiles: [
        {
            title: 'Доктор Стрэндж',
            descr: 'Фэнтези',
            link: 'Купить билеты',
            link_url: '/app7185564#link1',
            icon_id: '32254235_1524257',
            url: '/app7185564#link2'
        },
        {
            title: 'Фантастические твари',
            descr: 'Фэнтези',
            link: 'Купить билеты',
            link_url: '/app7185564#link3',
            icon_id: '32254235_1552138',
            url: '/app7185564#link4'
        },
        {
            title: 'Прибытие',
            descr: 'Триллер',
            link: 'Купить билеты',
            link_url: '/app7185564#link5',
            icon_id: '32254235_1552139',
            url: '/app7185564#link6'
        },
        {
            title: 'Новый доктор Стрэндж',
            descr: 'Фэнтези, комедия',
            link: 'Купить билеты',
            link_url: '/app7185564#link7',
            icon_id: '32254235_1524257',
            url: '/app7185564#link8'
        },
        {
            title: 'Фантастические твари 2',
            descr: 'Фантастика',
            link: 'Купить билеты',
            link_url: '/app7185564#link9',
            icon_id: '32254235_1552138',
            url: '/app7185564#link10'
        },
        {
            title: 'Прибытие 3',
            descr: 'Триллер, драма',
            link: 'Купить билеты',
            link_url: '/app7185564#link11',
            icon_id: '32254235_1552139',
            url: '/app7185564#link12'
        }
    ],
    more: 'Перейти',
    more_url: '/'
}`

export const cover_list = `{
    title: 'Рестораны',
    title_url: '/',
    rows: [
        {
            title: 'Корюшка',
            button: 'Забронировать',
            button_url: '/app7185564#link2',
            descr: 'Петропавловская крепость, д. 3',
            cover_id: '32254235_1564404',
            url: '/app7185564#link1'
        },
        {
            title: 'Food Park',
            button: 'Забронировать стол',
            button_url: '/app7185564#link4',
            descr: 'Александровский парк, д. 4/3, лит. А',
            cover_id: '32254235_1564404',
            url: '/app7185564#link3'
        }
    ],
    more: 'Перейти',
    more_url: '/',
}`

export const donation = `{
    title: 'Поддержать',
    title_counter: 3,
    button_url: '/app7185564_-1',
    text: 'На помощь бездомным животным',
    currency: 'RUB',
    goal: 50000,
    funded: 7000,
    backers: 20,
    more: 'Перейти',
    more_url: '/'
}`

export const match = `{
    title: 'My Match',
    match: {
        state: 'Первый тайм',
        team_a: {
            name: 'Зенит',
            descr: 'Санкт-Петербург',
            // icon_id: '3484735_23434324'
        },
        team_b: {
            name: 'Спартак',
            descr: 'Москва',
            // icon_id: '3484735_23434324'
        },
        score: {
            team_a: 2,
            team_b: 0
        },
        events: {
            team_a: [
                { event: 'Иванов', minute: '3' },
                { event: 'Петров', minute: '5' }
            ],
            team_b: [
                { event: 'Сидоров', minute: '2' }
            ]
        }
    },
    more: 'Перейти к трансляции',
    more_url: "/app7185564#source=from_footer"
}`

export default { cover_list, donation, match, list, table, tiles }
