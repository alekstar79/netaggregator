<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Db\Fixtures;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

use App\Entity\Dcover\Owner;

/**
 * Class DcoverFixture
 * @package Db\Fixtures
 */
class DcoverFixture implements FixtureInterface
{
    // club156494956 NewCommunity
    private function getCovers(): array
    {
        return [
            25520481 => [
                125629607 => [
                    'lastSubscriber' => [
                        'h' => 180,
                        'w' => 180,
                        'layer' => 0,
                        'photo_x' => 737,
                        'photo_y' => 147,
                        'rounding' => true,
                        'font_size' => 22,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'topCommentor' => [
                        'h' => 180,
                        'w' => 180,
                        'layer' => 0,
                        'photo_x' => 995,
                        'photo_y' => 147,
                        'rounding' => true,
                        'font_size' => 22,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'topLiker' => [
                        'h' => 180,
                        'w' => 180,
                        'layer' => 0,
                        'photo_x' => 1250,
                        'photo_y' => 147,
                        'rounding' => true,
                        'font_size' => 22,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'time' => [
                        'layer' => 0,
                        'text_x' => 200,
                        'text_y' => 320,
                        'font_size' => 26,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'date' => [
                        'layer' => 0,
                        'text_x' => 200,
                        'text_y' => 355,
                        'font_size' => 26,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'time_zone' => 'Europe/Moscow',
                    'text' => null,
                    'shape' => null,
                    'weather' => null
                ],
                169906699 => [
                    'lastSubscriber' => [
                        'h' => 180,
                        'w' => 180,
                        'layer' => 0,
                        'photo_x' => 680,
                        'photo_y' => 160,
                        'rounding' => true,
                        'font_size' => 22,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'topCommentor' => [
                        'h' => 180,
                        'w' => 180,
                        'layer' => 0,
                        'photo_x' => 935,
                        'photo_y' => 160,
                        'rounding' => true,
                        'font_size' => 22,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'topLiker' => [
                        'h' => 180,
                        'w' => 180,
                        'layer' => 0,
                        'photo_x' => 1190,
                        'photo_y' => 160,
                        'rounding' => true,
                        'font_size' => 22,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'time' => [
                        'layer' => 0,
                        'text_x' => 250,
                        'text_y' => 320,
                        'font_size' => 26,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'date' => [
                        'layer' => 0,
                        'text_x' => 250,
                        'text_y' => 355,
                        'font_size' => 26,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'time_zone' => 'Europe/Moscow',
                    'text' => null,
                    'shape' => null,
                    'weather' => null
                ],
                141729661 => [
                    'lastSubscriber' => [
                        'h' => 180,
                        'w' => 180,
                        'layer' => 0,
                        'photo_x' => 820,
                        'photo_y' => 123,
                        'rounding' => true,
                        'font_size' => 22,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'topCommentor' => [
                        'h' => 180,
                        'w' => 180,
                        'layer' => 0,
                        'photo_x' => 1075,
                        'photo_y' => 123,
                        'rounding' => true,
                        'font_size' => 22,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'topLiker' => [
                        'h' => 180,
                        'w' => 180,
                        'layer' => 0,
                        'photo_x' => 1330,
                        'photo_y' => 123,
                        'rounding' => true,
                        'font_size' => 22,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'time' => [
                        'layer' => 0,
                        'text_x' => 60,
                        'text_y' => 345,
                        'font_size' => 26,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'date' => [
                        'layer' => 0,
                        'text_x' => 60,
                        'text_y' => 380,
                        'font_size' => 26,
                        'font_color' => 'rgb(255,255,255)'
                    ],
                    'time_zone' => 'Europe/Samara',
                    'text' => [
                        [
                            'font' => 'BananaBrick.otf',
                            'text' => 'Привет Мир!!!',
                            'align' => 1,
                            'layer' => 0,
                            'text_x' => 200,
                            'text_y' => 100,
                            'opacity' => .5,
                            'font_size' => 52,
                            'font_color' => 'rgb(255,255,255)'
                        ]
                    ],
                    'shape' => null,
                    'weather' => [
                        'city' => 'Samara',
                        'icon' => [
                            'x' => 100,
                            'y' => 200
                        ],
                        'layer' => 0,
                        'shape' => [
                            'h' => 100,
                            'r' => 25,
                            'w' => 250,
                            'x' => 75,
                            'y' => 200,
                            'type' => 'rectangle',
                            'opacity' => .8,
                            'visible' => true,
                            'fill_color' => '#eee'
                        ],
                        'text_x' => 220,
                        'text_y' => 265,
                        'country' => 'RU',
                        'font_size' => 42,
                        'font_color' => '#555'
                    ]
                ]
            ]
        ];
    }

    public function load(ObjectManager $manager): void
    {
        $data = $this->getCovers();

        /** @var array $covers */
        foreach ($data as $uid => $covers) {
            $owner = new Owner($uid);

            foreach ($covers as $gid => $cover) {
                $owner->addCover($gid, $cover);
            }

            $manager->persist($owner);
        }

        $manager->flush();
    }
}
