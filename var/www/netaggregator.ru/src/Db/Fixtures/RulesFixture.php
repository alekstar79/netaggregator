<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Db\Fixtures;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

use App\Entity\Stream\Rules;

/**
 * Class RulesFixture
 * @package Db\Fixtures
 */
class RulesFixture implements FixtureInterface
{
    private function getRules(): array
    {
        $query = ['method' => 'POST', 'url' => '', 'data' => []];

        return [
            [
                'user_id' => 25520481,
                'tags' => [
                    '{1}' => ['mark' => 'юмор',       'stat' => 0],
                    '{2}' => ['mark' => 'сообщество', 'stat' => 0],
                    '{3}' => ['mark' => 'контакт',    'stat' => 0],
                    '{4}' => ['mark' => 'дружба',     'stat' => 0],
                    '{5}' => ['mark' => 'погода',     'stat' => 0],
                    '{10}' => ['mark' => 'погода',    'stat' => 0],
                    '{12}' => ['mark' => 'азарт',     'stat' => 0]
                ],
                'stop' => [
                    'swear' => true,
                    'list' => [
                        'жидкое стекло',
                        'добавлю всех',
                        'добавляю всех',
                        'срочные деньги',
                        'мoнокуляр bushnуll',
                        'JBL CHARGE2+',
                        'Водонепроницаемая беспроводная колонка'
                    ]
                ],
                'query' => $query
            ],
            [
                'user_id' => 2985476,
                'tags' => [
                    '{6}' => ['mark' => 'кот',       'stat' => 0],
                    '{7}' => ['mark' => 'собака',    'stat' => 0],
                    '{8}' => ['mark' => 'навальный', 'stat' => 0],
                    '{9}' => ['mark' => 'трамп',     'stat' => 0]
                ],
                'stop' => [
                    'swear' => true,
                    'list' => []
                ],
                'query' => []
            ],
            /* [ // Aleksandra Yarkaya
                'user_id' => 438806195,
                'tags' => [
                    '{1}'  => ['mark' => 'юмор',   'stat' => 0],
                    '{5}'  => ['mark' => 'погода', 'stat' => 0],
                    '{10}' => ['mark' => 'погода', 'stat' => 0],
                    '{12}' => ['mark' => 'азарт',  'stat' => 0],
                ],
                'stop' => [
                    'swear' => true,
                    'list' => [
                        'жидкое стекло',
                        'добавляю всех',
                        'добавлю всех',
                        'срочные деньги',
                        'мoнокуляр bushnуll',
                        'JBL CHARGE2+',
                    ]
                ],
                'query' => [],
            ], */
            [
                'user_id' => 68938508,
                'tags' => [],
                'stop' => [],
                'query' => []
            ],
            [
                'user_id' => 15758277,
                'tags' => [],
                'stop' => [],
                'query' => []
            ],
            [
                'user_id' => 1655945,
                'tags' => [],
                'stop' => [],
                'query' => []
            ],
            [
                'user_id' => 71140979,
                'tags' => [
                    '{11}' => ['mark' => 'спорт', 'stat' => 0]
                ],
                'stop' => [],
                'query' => []
            ],
            [
                'user_id' => 465174119,
                'tags' => [],
                'stop' => [],
                'query' => []
            ]
        ];
    }

    public function load(ObjectManager $manager): void
    {
        $data = $this->getRules();

        foreach ($data as $item) {
            $manager->persist(new Rules(
                $item['user_id'],
                $item['tags'],
                $item['stop'],
                $item['query']
            ));
        }

        $manager->flush();
    }
}
