<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\VkApi;

use MongoDB\Driver\Exception\InvalidArgumentException;

use Generator;
use Throwable;

/**
* Class APIUsers
* @package App\VkApi
*/
class APIUsers extends API
{
    public const GET = '/users.get', FOLLOWERS  = '/users.getFollowers';

    /**
     * @param int $user_id
     * @return array
     */
    public function getFollowers(int $user_id): array
    {
        $all = $count = 1000;
        $users = [];
        $page = 0;

        do {

            try {

                $offset = $page * $count;
                $ret = $this->api(self::FOLLOWERS, compact('user_id','count','offset'));

                $users[] = $ret['items'];
                $all = $ret['count'];

            } catch (Throwable $e) {
            }

            $page++;

        } while ($all > $offset + $count);

        return count($users) > 0 ? array_merge(...$users) : [];
    }

    /**
     * @param $uids
     * @param null $fields
     * @param string|null $access_token
     * @return array
     * @throws RejectInterface
     * @throws InvalidArgumentException
     */
    public function get($uids, $fields = null, string $access_token = null): array
    {
        if (count((array) $uids) > 900) {
            throw new InvalidArgumentException('Exceeded the ID limit');
        }

        return $this->api(self::GET, [
            'user_ids' => implode(',', (array) $uids),
            'fields' => $this->modify($fields),
            'access_token' => $access_token
        ]);
    }

    /**
     * @param $uids
     * @param null $fields
     * @return Generator
     */
    public function gen($uids, $fields = null): Generator
    {
        $uids = array_chunk((array) $uids, Execute::MAX_API_CALLS * 450);
        $fields = $this->modify($fields);

        foreach ($uids as $pack) { try {
            yield $this->api(
                ...Execute::multiple(
                    self::GET,
                    array_map(static function($user_ids) use($fields) {
                        $user_ids = implode(',', $user_ids);
                        return compact('user_ids','fields');
                    }, array_chunk($pack, 900))
                )
                    ->setWrapper('return {{code}};')
                    ->getCode('+')
            );

        } catch (Throwable $e) {
        } }
    }
}
