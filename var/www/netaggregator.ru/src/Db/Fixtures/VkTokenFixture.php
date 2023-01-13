<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Db\Fixtures;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

use App\VkApi\APIClientFactory;
use App\VkApi\RejectInterface;
use App\Entity\Token\VkToken;

/**
 * Class VkTokenFixture
 * @package Db\Fixtures
 */
class VkTokenFixture implements FixtureInterface
{
    private function getTokens(): array
    {
        return [
            [
                'user_id' => 2985476,
                'access_token' => 'd8a4122367184c8732ab5b73c571b202bdea930bddf30dc1fd8d41734880d0617f96ec6e3184e0f1b2222',
                'expires_in' => null
            ],
            [
                'user_id' => 68938508,
                'access_token' => 'adc6c221149ce04f4550ac3309d2bb9f56a8667206464771130fc1415c3664928c01835aed4522e263e6f',
                'expires_in' => null
            ],
            [
                'user_id' => 315546158,
                'access_token' => 'd40c674e4563a0a61c1cf266654b045ec0caf813ac36ca2f6e50decb65196a0bbe259149686169f762d7c',
                'expires_in' => null
            ],
            [
                'user_id' => 487767627,
                'access_token' => 'dc2a8e6e661690aaac7156425da285f1dc856b959139d301cf3394d415bf5c60a822fc587ccdb9a2043aa',
                'expires_in' => null
            ],
            [
                'user_id' => 465174119,
                'access_token' => '7e7f18b4265822f9da31e6d1a48fcb7862bb690a6cf39fcaaea55e9d52e9b5b5ed256b0ccf796d0fd72c6',
                'expires_in' => null
            ],
            [
                'user_id' => 466483621,
                'access_token' => '8fd97e2e6c6f15d9bb2e2f5d0ffacc79f04b79918ea96f7215dbf8f7e5c5f20e91021d4d421881f8e8dd9',
                'expires_in' => null
            ],
            [
                'user_id' => 486926717,
                'access_token' => 'c02f582748e859058b0b22ef27559a29f25f6cd0543e62e74c2a8dc305f3c40d74ed1d4fadaa3e068289e',
                'expires_in' => null
            ],
            [
                'user_id' => 487269939,
                'access_token' => '8125d5e9e2b68b2ed4a0fc7879e053baeddca937d08d2832a239a00f106886c98f8fee6519a510192eb45',
                'expires_in' => null
            ],
            [
                'user_id' => 487894428,
                'access_token' => '87bcaf004bdec6ab38b2bc4f8bd60c06174e081044d97b9c7b47a8221b62646152a20322af459347d0c85',
                'expires_in' => null
            ],
            [
                'user_id' => 487899554,
                'access_token' => 'ff35a106cf8a88c6e094979edcc3881fd76ed6244187dd89a2ff057be26a2d2a23059faedbfa69223d49d',
                'expires_in' => null
            ],
            [
                'user_id' => 486939909,
                'access_token' => 'b8e6e4721db5fd687152f2134ea9d630de53fa6d59f36c04dea9cd2039b65ce74192e28a15b328f4015e0',
                'expires_in' => null
            ],
            [
                'user_id' => 487320428,
                'access_token' => '2300b14b5755e098420e3bcde909d8d61c260d24b5e6c9d3087235b8761c95475a54bf3e33f401c4fcbe7',
                'expires_in' => null
            ],
            [
                'user_id' => 487329730,
                'access_token' => '9f8f8b659a6169685270f2b73b2541d45ecc67931ea74b46ca9699209b0ac6298158203836eb851f51397',
                'expires_in' => null
            ],
            [
                'user_id' => 25520481,
                'access_token' => 'e3b92150532751b344cf5dc465036021de9465fc0fa9f60c5979a154cd4d01d759bd9db68d565d5e62c0c',
                'expires_in' => null
            ]
        ];
    }

    public function load(ObjectManager $manager): void
    {
        $api = APIClientFactory::create();
        $data = $this->getTokens();

        foreach ($data as $item) {
            try {
                $api->account->getAppPermissions($item['access_token']);
            } catch (RejectInterface $e) {
                continue;
            }

            $token = new VkToken(
                $item['user_id'],
                $item['access_token'],
                $item['expires_in']
            );

            $manager->persist($token);
        }

        $manager->flush();
    }
}
