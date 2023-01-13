<?php declare(strict_types=1);

return [
    'component' => 'keyboard-layout',
    'props' => [
        'orientation' => 'vertical'
    ],
    'children' => [
        [
            'component' => 'keyboard-layout',
            'props' => [
                'orientation' => 'horizontal'
            ],
            'children' => [
                [
                    'component' => 'keyboard-btn',
                    'display' => [
                        'weight' => 1
                    ],
                    'props' => [
                        'background' => '#4bb34b',
                        'text' => 'Photo',
                        'payload' => [
                            'cmd' => '#photo'
                        ]
                    ],
                    'id' => 2
                ],
                [
                    'component' => 'keyboard-btn',
                    'display' => [
                        'weight' => 1
                    ],
                    'props' => [
                        'background' => '#e64646',
                        'text' => 'Video',
                        'payload' => [
                            'cmd' => '#video'
                        ]
                    ],
                    'id' => 3
                ],
                [
                    'component' => 'keyboard-btn',
                    'display' => [
                        'weight' => 1
                    ],
                    'props' => [
                        'background' => '#e64646',
                        'text' => 'Music',
                        'payload' => [
                            'cmd' => '#music'
                        ]
                    ],
                    'id' => 4
                ],
                [
                    'component' => 'keyboard-btn',
                    'display' => [
                        'weight' => 1
                    ],
                    'props' => [
                        'background' => '#4bb34b',
                        'text' => 'Signa',
                        'payload' => [
                            'cmd' => '#signa'
                        ]
                    ],
                    'id' => 5
                ]
            ],
            'id' => 1
        ],
        [
            'component' => 'keyboard-layout',
            'props' => [
                'orientation' => 'horizontal'
            ],
            'children' => [
                [
                    'component' => 'keyboard-btn',
                    'display' => [
                        'weight' => 1
                    ],
                    'props' => [
                        'background' => '#5181b8',
                        'text' => 'Help',
                        'payload' => [
                            'cmd' => 'help'
                        ]
                    ],
                    'id' => 7
                ]
            ],
            'id' => 6
        ]
    ],
    'id' => 0
];
