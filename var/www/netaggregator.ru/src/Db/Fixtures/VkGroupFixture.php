<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Db\Fixtures;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

use App\Entity\Group\VkGroupToken;

/**
 * Class VkGroupFixture
 * @package Db\Fixtures
 */
class VkGroupFixture implements FixtureInterface
{
    private function getTokens(): array
    {
        return [
            [
                'group_id' => 169906699,
                'user_id' => 25520481,
                'group_token' => 'd3e0f8da3c843aff492d34b02f8e760885792ccf4a1ec6670af82ac32517768601c86f4634d832d5d897d',
                'confirmation_key' => '8d83daab'
            ],
            [
                'group_id' => 125629607,
                'user_id' => 25520481,
                'group_token' => '0dfb809f22c9216a388caba3661fd6489938451c266c960bd9f72494286415303a41b24a42dc3e8d9d667',
                'confirmation_key' => 'd043d48d'
            ],
            [
                'group_id' => 141729661,
                'user_id' => 25520481,
                'group_token' => '80e9ef5b7bf35889d1ffbecbf4a581359d39dd521b5601ecfcb4cab771454c6fa095b4f190a214a7b72cf',
                'confirmation_key' => '8581b3b9'
            ],
            /* [
                'group_id' => 167582006,
                'user_id' => 25520481,
                'group_token' => 'f9d34036bafe9ba2dba2dc8893b77d3a217d76b9cde91eb8fe5d6f9b7b19e8eab6085fd217128c769ac31',
                'confirmation_key' => 'c41c2906'
            ],
            [
                'group_id' => 169905893,
                'user_id' => 25520481,
                'group_token' => 'f0cf12490c76f19281c053cd57c44816ad48a75062ba0e25daa548e4b30c7261d5584a17b0b346ba3b0f5',
                'confirmation_key' => 'bb07d3fa'
            ], */
            [
                'group_id' => 147718403,
                'user_id' => 25520481,
                'group_token' => 'd9a81630d45b6ca3baf710ce51acbac0a82826ca467c98ff1bcb098034a215c4f8ab563be99aceea7b7c4',
                'confirmation_key' => 'e4e72adc'
            ]
        ];
    }

    public function load(ObjectManager $manager): void
    {
        $data = $this->getTokens();

        foreach ($data as $item) {
            $token = new VkGroupToken(
                $item['group_id'],
                $item['user_id'],
                $item['group_token'],
                $item['confirmation_key']
            );

            $manager->persist($token);
        }

        $manager->flush();
    }
}
