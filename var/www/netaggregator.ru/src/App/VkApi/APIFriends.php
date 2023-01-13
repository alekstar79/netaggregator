<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\VkApi;

/**
* Class APIFriends
* @package App\VkApi
*/
class APIFriends extends API
{
    private const

        DELETE   = '/friends.delete',
        SEARCH   = '/friends.search',
        REQUESTS = '/friends.getRequests';

    /**
     * @param int $user_id
     * @param string $access_token
     * @return bool
     * @throws RejectInterface
     */
    public function delete(int $user_id, string $access_token = ''): bool
    {
        $ret = $this->api(self::DELETE, compact('user_id','access_token'));

        return $ret['success'] === 1;
    }

    /**
     * @param int $out
     * @param string $access_token
     * @return array
     */
    public function getRequests(int $out = 0, string $access_token = ''): array
    {
        $all = $count = 1000;
        $users = [];
        $page = 0;

        do {

            try {

                $offset = $page * $count;
                $ret = $this->api(self::REQUESTS, compact('offset','count','out','access_token'));

                $all = $ret['count'];
                $users += $ret['items'];

            } catch (RejectInterface $e) {
            }

            $page++;

        } while ($all > $offset + $count);

        return $users;
    }

    /**
     * @param int $user_id
     * @param string $q
     * @return array
     */
    public function search(int $user_id, string $q = ''): array
    {
        $all = $count = 1000;
        $users = [];
        $page = 0;

        do {

            try {

                $offset = $page * $count;
                $ret = $this->api(self::SEARCH, compact('q','user_id','offset','count'));

                $all = $ret['count'];
                $users += $ret['items'];

            } catch (RejectInterface $e) {
            }

            $page++;

        } while ($all > $offset + $count);

        return $users;
    }
}
