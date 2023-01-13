const defaults = [
    'Мда, я чувствую себя неловко, но я не понимаю тебя...',
    'Прошу задавать вопросы только по группе и без орфографических ошибок.',
    'Я пока не знаю, как на это ответить',
    'Хм...',
    'Что?',
    'Надо же! Такое знакомое слово, а я его забыла!',
    'Я вижу, у тебя были хорошие в школе отметки. А я так себе училась',
    'Что-то тут не сходится...',
    'Эээ...',
    'Свежая идея!',
    'Я НЕ ЗНАЮ',
    'Ты что?',
    'Можно сказать и так.',
    'Ты с кем такое обсуждаешь?',
    'Нужно что-то делать.',
    'Даже не знаю, что сказать.',
    'Да что ты говоришь! Кто бы мог подумать!',
    'Говори-говори, я внимательно слушаю.',
    'Самый умный что-ли?',
    'С ума сойти! Кто бы мог подумать!',
    'Нам есть о чем поболтать.',
    'Я не всегда знаю, о чем говорю, но знаю, что права...',
    'Всякое бывает.',
    'Продолжай, я внимательно слушаю.',
    'Прикольно. Но непонятно.',
    'Верится с трудом.',
    'По-моему, это не так.',
    'Зачем ты так со мной?',
    'Не умеешь нормально общаться?',
    'Всё не так уж просто',
    'Я тебя не совсем понимаю.',
    'В твоих словах точно есть подвох.',
    'Ты о чем?',
    'Продолжайте, продолжайте. Я люблю когда невоспитанные сердятся.',
    'Какая планета больше нравиться?',
    'У нас возникло недопонимание.',
    'Ага, может быть',
    'Не понимаю. Извини.',
    'С тобой интересно.',
    'Интересная идея!',
    'Надо будет подумать над этим на досуге.',
    'Давай лучше поговорим о чем нибудь-другом?',
    'Мне часто задают вопрос об инопланетянах.',
    'Прикольно. Но непонятно.'
]

export const list = [
    {
        _id: '5e9c97981667f365561f9c62',
        connections: [
            169906699
        ],
        keyboard: {
            component: 'keyboard-layout',
            props: {
                orientation: 'vertical'
            },
            children: [
                {
                    component: 'keyboard-layout',
                    props: {
                        orientation: 'horizontal'
                    },
                    children: [
                        {
                            component: 'keyboard-btn',
                            display: {
                                weight: 1
                            },
                            props: {
                                background: '#4bb34b',
                                text: 'Video',
                                payload: {
                                    cmd: '#video'
                                }
                            },
                            id: 2
                        },
                        {
                            component: 'keyboard-btn',
                            display: {
                                weight: 1
                            },
                            props: {
                                background: '#e64646',
                                text: 'Music',
                                payload: {
                                    cmd: '#music'
                                }
                            },
                            id: 3
                        },
                        {
                            component: 'keyboard-btn',
                            display: {
                                weight: 1
                            },
                            props: {
                                background: '#4bb34b',
                                text: 'Photo',
                                payload: {
                                    cmd: '#photo'
                                }
                            },
                            id: 4
                        }
                    ],
                    id: 1
                }
            ],
            id: 0
        },
        dialogs: [
            {
                id: '5e9c97981667f365561f9c63',
                on: true,
                global: true,
                exact: false,
                keyboard: {
                    component: 'keyboard-layout',
                    props: {
                        orientation: 'vertical'
                    },
                    children: [],
                    id: 0
                },
                keywords: [
                    'привет'
                ],
                reply: [
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [
                            {
                                value: 1,
                                text: 'member'
                            },
                            {
                                value: 2,
                                text: 'sex'
                            }
                        ],
                        keyboard: {},
                        text: 'Привет, {first_name}! Я на тебя надеюсь.😀',
                        value: 0
                    },
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [],
                        keyboard: {},
                        text: 'Здравствуй. {first_name}',
                        value: 1
                    }
                ],
                ref: null,
                use: 0,
                random: false,
                children: [
                    {
                        id: '5e9c97981667f365561f9c64',
                        on: true,
                        global: true,
                        exact: true,
                        keyboard: {},
                        keywords: [
                            'как дела',
                            'как настроение'
                        ],
                        reply: [
                            {
                                notifications: [],
                                email: [],
                                attachments: [],
                                conditions: [],
                                keyboard: {},
                                text: 'Отлично, а у тебя?👌',
                                value: 0
                            }
                        ],
                        ref: null,
                        use: 0,
                        random: true,
                        children: [],
                        attachments: []
                    },
                    {
                        id: '5e9c97981667f365561f9c65',
                        on: true,
                        global: true,
                        exact: true,
                        keyboard: {},
                        keywords: [
                            'здорово',
                            'круто',
                            'лучше всех',
                            'прекрасно'
                        ],
                        reply: [
                            {
                                notifications: [],
                                email: [],
                                attachments: [],
                                conditions: [],
                                keyboard: {},
                                text: 'Рад за тебя!',
                                value: 0
                            }
                        ],
                        ref: null,
                        use: 0,
                        random: true,
                        children: [],
                        attachments: [
                            {
                                src: 'https://sun9-59.userapi.com/c628420/v628420481/a273/dmtld5eVy7Q.jpg',
                                mark: 'photo-25267591_371174060',
                                entity: 'photo'
                            },
                            {
                                src: 'https://sun9-60.userapi.com/c628420/v628420481/a27a/IxuffThTqZU.jpg',
                                mark: 'photo-25267591_371174061',
                                entity: 'photo'
                            },
                            {
                                src: 'https://sun9-18.userapi.com/c628420/v628420481/a281/9U7WaUmdve4.jpg',
                                mark: 'photo-25267591_371174062',
                                entity: 'photo'
                            }
                        ]
                    }
                ],
                attachments: [
                    /* {
                        src: 'https://sun9-19.userapi.com/c849220/v849220449/4b945/IW1MT4z7rGk.jpg',
                        mark: 'photo-169906699_456254200',
                        entity: 'photo'
                    },
                    {
                        src: 'https://sun9-14.userapi.com/c849220/v849220449/4b9fc/D7-JvxK4vzE.jpg',
                        mark: 'photo-169906699_456254220',
                        entity: 'photo'
                    },
                    {
                        src: 'https://sun9-7.userapi.com/c849220/v849220449/4ba3c/w4n8h753ULU.jpg',
                        mark: 'photo-169906699_456254227',
                        entity: 'photo'
                    },
                    {
                        src: 'https://sun9-23.userapi.com/c855520/v855520942/1cb8ba/nuTtzUz3aZg.jpg',
                        mark: 'photo-169906699_457268113',
                        entity: 'photo'
                    },
                    {
                        src: 'https://sun9-60.userapi.com/c855520/v855520942/1cbda8/4dE07C8pRe0.jpg',
                        mark: 'photo-169906699_457268247',
                        entity: 'photo'
                    },
                    {
                        src: 'https://sun9-13.userapi.com/c855520/v855520942/1cbf68/SB0W78vGTAg.jpg',
                        mark: 'photo-169906699_457268294',
                        entity: 'photo'
                    } */
                    {
                        entity: 'photo',
                        mark: 'photo-169906699_456254200',
                        src: '/img/fake/n1.jpg'
                    },
                    {
                        entity: 'photo',
                        mark: 'photo-169906699_456254220',
                        src: '/img/fake/n2.jpg'
                    },
                    {
                        entity: 'photo',
                        mark: 'photo-169906699_456254227',
                        src: '/img/fake/n3.jpg'
                    },
                    {
                        entity: 'photo',
                        mark: 'photo-169906699_457268113',
                        src: '/img/fake/n4.jpg'
                    },
                    {
                        entity: 'photo',
                        mark: 'photo-169906699_457268247',
                        src: '/img/fake/n5.jpg'
                    },
                    {
                        entity: 'photo',
                        mark: 'photo-169906699_457268294',
                        src: '/img/fake/n6.jpg'
                    }
                ]
            },
            {
                id: '5e9c97981667f365561f9c66',
                on: true,
                global: true,
                exact: true,
                keyboard: {},
                keywords: [
                    'картинка',
                    'фото'
                ],
                reply: [
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [
                            {
                                value: 1,
                                text: 'member'
                            }
                        ],
                        keyboard: {},
                        text: '👍👍👍',
                        value: 0
                    }
                ],
                ref: null,
                use: 0,
                random: false,
                children: [],
                attachments: []
            }
        ],
        default: defaults,
        name: 'Стартовый',
        uid: 25520481
    },
    {
        _id: '5e9c97981667f365561f9c67',
        connections: [],
        keyboard: {},
        dialogs: [
            {
                id: '5e9c97981667f365561f9c68',
                on: true,
                global: true,
                exact: true,
                keyboard: {},
                keywords: [
                    'привет'
                ],
                reply: [
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [],
                        keyboard: {},
                        text: 'Привет, {first_name}!',
                        value: 0
                    },
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [],
                        keyboard: {},
                        text: 'Здравствуй.',
                        value: 1
                    }
                ],
                ref: null,
                use: 0,
                random: false,
                children: [
                    {
                        id: '5e9c97981667f365561f9c69',
                        on: true,
                        global: true,
                        exact: true,
                        keyboard: {},
                        keywords: [
                            'картинка',
                            'фото'
                        ],
                        reply: [
                            {
                                notifications: [],
                                email: [],
                                attachments: [],
                                conditions: [],
                                keyboard: {},
                                text: '👍👍👍',
                                value: 0
                            }
                        ],
                        ref: null,
                        use: 0,
                        random: true,
                        children: [
                            {
                                id: '5e9c97981667f365561f9c6a',
                                on: true,
                                global: true,
                                exact: true,
                                keyboard: {},
                                keywords: [
                                    'здорово',
                                    'круто',
                                    'лучше всех',
                                    'нормально',
                                    'прекрасно'
                                ],
                                reply: [
                                    {
                                        notifications: [],
                                        email: [],
                                        attachments: [],
                                        conditions: [],
                                        keyboard: {},
                                        text: 'Рад за тебя!',
                                        value: 0
                                    }
                                ],
                                ref: null,
                                use: 0,
                                random: true,
                                children: [],
                                attachments: []
                            }
                        ],
                        attachments: []
                    }
                ],
                attachments: []
            },
            {
                id: '5e9c97981667f365561f9c6b',
                on: true,
                global: true,
                exact: true,
                keyboard: {},
                keywords: [
                    'как дела'
                ],
                reply: [
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [],
                        keyboard: {},
                        text: 'Отлично, а у тебя?',
                        value: 0
                    }
                ],
                ref: null,
                use: 0,
                random: true,
                children: [],
                attachments: []
            }
        ],
        default: defaults,
        name: 'Стартовый (копия 1584615134310)',
        uid: 25520481
    },
    {
        _id: '5e9c97981667f365561f9c71',
        connections: [],
        keyboard: {},
        dialogs: [
            {
                id: '5e9c97981667f365561f9c72',
                on: true,
                global: true,
                exact: true,
                keyboard: {},
                keywords: [
                    'привет'
                ],
                reply: [
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [],
                        keyboard: {},
                        text: 'Привет, {first_name}!',
                        value: 0
                    },
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [],
                        keyboard: {},
                        text: 'Здравствуй.',
                        value: 1
                    }
                ],
                ref: null,
                use: 0,
                random: true,
                children: [],
                attachments: []
            },
            {
                id: '5e9c97981667f365561f9c73',
                on: true,
                global: true,
                exact: true,
                keyboard: {},
                keywords: [
                    'как дела'
                ],
                reply: [
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [],
                        keyboard: {},
                        text: 'Отлично, а у тебя?',
                        value: 0
                    }
                ],
                ref: null,
                use: 0,
                children: [],
                attachments: [],
                random: true
            },
            {
                id: '5e9c97981667f365561f9c74',
                on: true,
                global: true,
                exact: true,
                keyboard: {},
                keywords: [
                    'здорово',
                    'круто',
                    'лучше всех',
                    'нормально',
                    'прекрасно'
                ],
                reply: [
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [],
                        keyboard: {},
                        text: 'Рад за тебя!',
                        value: 0
                    }
                ],
                ref: null,
                use: 0,
                children: [],
                attachments: [],
                random: true
            },
            {
                id: '5e9c97981667f365561f9c75',
                on: true,
                global: true,
                exact: true,
                keyboard: {},
                keywords: [
                    'картинка',
                    'фото'
                ],
                reply: [
                    {
                        notifications: [],
                        email: [],
                        attachments: [],
                        conditions: [],
                        keyboard: {},
                        text: '👍👍👍',
                        value: 0
                    }
                ],
                ref: null,
                use: 0,
                random: true,
                children: [],
                attachments: []
            }
        ],
        default: defaults,
        name: 'Стартовый (копия last)',
        uid: 25520481
    }
]

export const attachments = {
    count: 12,
    items: [{
        id: -6,
        thumb_id: 456239025,
        owner_id: -169906699,
        title: 'Фотографии со страницы сообщества',
        size: 1,
        thumb_src: '/img/fake/n11.jpg'
    },{
        id: 256059113,
        thumb_id: 456255753,
        owner_id: -169906699,
        title: 'Sweets Dump',
        size: 10,
        thumb_src: '/img/fake/n6.jpg'
    },{
        id: 256065143,
        thumb_id: 456256303,
        owner_id: -169906699,
        title: 'Stack Legacy',
        size: 3439,
        thumb_src: '/img/fake/n12.jpg'
    },{
        id: 269955508,
        thumb_id: 457269107,
        owner_id: -169906699,
        title: 'Ultra 2020',
        size: 1000,
        thumb_src: '/img/fake/n4.jpg'
    },{
        id: 273716815,
        thumb_id: 457423871,
        owner_id: -169906699,
        title: 'Leaf',
        size: 250,
        thumb_src: '/img/fake/n5.jpg'
    },{
        id: 259941259,
        thumb_id: 456262418,
        owner_id: -169906699,
        title: 'Nature',
        size: 475,
        thumb_src: '/img/fake/n1.jpg'
    }]
}
