<?php
/**
* @noinspection PhpMultipleClassDeclarationsInspection
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\VkApi;

use JsonException;
use Throwable;

/**
* Class APIGroups
* @package App\VkApi
*/
class APIGroups extends API
{
    public const

        GET         = '/groups.get',
        GETBYID     = '/groups.getById',
        SEARCH      = '/groups.search',
        ISMEMBER    = '/groups.isMember',
        GETMEMBERS  = '/groups.getMembers',
        REMOVEUSER  = '/groups.removeUser',
        GETSETTINGS = '/groups.getSettings';

    /**
     * @param int $user_id
     * @param int $group_id
     * @return int
     * @throws RejectInterface
     */
    public function isMember(int $user_id, int $group_id): int
    {
        return $this->api(self::ISMEMBER, compact('group_id','user_id'));
    }

    /**
     * @param array $user_ids
     * @param int $group_id
     * @return array
     */
    public function isMembers(array $user_ids, int $group_id): array
    {
        $cids = array_chunk($user_ids, Execute::MAX_API_CALLS * 500);
        $users = [];

        foreach ($cids as $pack) { try {
            $users[] = $this->api(
                ...Execute::multiple(
                    self::ISMEMBER,
                    array_map(static function($uids) use($group_id) {
                        $user_ids = implode(',', $uids);
                        return compact('user_ids','group_id');
                    }, array_chunk($pack, 500))
                )
                    ->setWrapper('return {{code}};')
                    ->getCode('+')
            );

        } catch (Throwable $e) {
        } }

        return count($users) > 0 ? array_merge(...$users) : [];
    }

    /**
     * @param int $user_id
     * @param int $group_id
     * @param string $access_token
     * @return int
     * @throws RejectInterface
     */
    public function removeUser(int $user_id, int $group_id, string $access_token = ''): int
    {
        return $this->api(self::REMOVEUSER, compact('user_id','group_id','access_token'));
    }

    /**
     * @param int $user_id
     * @param null $fields
     * @param null $filter
     * @return array
     */
    public function get(int $user_id, $fields = null, $filter = null): array
    {
        $all = $count = 1000;
        $offset = 0;
        $flag = 0;
        $list = [];

        $fields = $this->modify($fields);
        $filter = $this->modify($filter);

        $extended = $fields ? 1 : 0;

        do {

            try {

                $offset += $flag * $count;
                $query = new Execute(self::GET, compact('user_id','count','offset','fields','filter','extended'));

                if ($all > ($offset + $count)) {
                    $offset = $query->dynamic($all);
                }

                $ret = $this->api(...$query->getCode());
                $all = $ret[0]['count'];

                $list[] = array_merge(...array_column($ret, 'items'));

            } catch (Throwable $e) {
            }

            $flag = 1;

        } while ($all > $offset + $count);

        return count($list) > 0 ? array_merge(...$list) : [];
    }

    /**
     * @param $gids
     * @param string|null $fields
     * @return array
     */
    public function getById($gids, $fields = 'members_count'): array
    {
        $chunk = Execute::MAX_API_CALLS * 500 * .5;
        $cids = array_chunk((array)$gids, (int)$chunk);
        $groups = [];

        $fields = $this->modify($fields);

        foreach ($cids as $pack) { try {
            $groups[] = $this->api(
                ...Execute::multiple(
                    self::GETBYID,
                    array_map(static function($gids) use($fields) {
                        $group_ids = implode(',', $gids);
                        return compact('group_ids','fields');
                    }, array_chunk($pack, 500))
                )
                    ->setWrapper('return {{code}};')
                    ->getCode('+')
            );

        } catch (Throwable $e) {
        } }

        return count($groups) > 0 ? array_merge(...$groups) : [];
    }

    /**
     * @param int|null $group_id
     * @param int $count
     * @param int $offset
     * @param null $fields
     * @param string $sort
     * @return array
     * @throws JsonException
     */
    public function getMembers(
        int $group_id = null,
        int $count = PHP_INT_MAX,
        int $offset = 0,
        $fields = null,
        string $sort = 'id_asc'
    ): array {

        $fields = $this->modify($fields);
        $params = compact('sort','fields');

        if ($group_id) {
            $params['group_id'] = $group_id;
        }

        return $this->dynamicQuery(
            self::GETMEMBERS,
            $params,
            $offset,
            1000 > $count ? $count : 1000,
            $count
        );
    }

    /**
     * @param int $group_id
     * @param string $access_token
     * @return mixed
     * @throws RejectInterface
     */
    public function getSettings(int $group_id, string $access_token = '')
    {
        return $this->api(self::GETSETTINGS, compact('group_id','access_token'));
    }

    private function unique(array $groups): array
    {
        $ids = [];

        foreach ($groups as $g) {
            if (!in_array($g['id'], $ids, false)) {
                $ids[] = $g['id'];
            }
        }

        return $ids;
    }

    /**
     * @param $querys
     * @return array
     */
    public function search($querys): array
    {
        $limit = round(Execute::MAX_API_CALLS / 6, 0, 2);
        $querys = array_unique((array) $querys);
        $all = count($querys);

        $groups = [];
        $i = 0;

        do {

            try {

                $query = new Execute(self::SEARCH);
                $query->setWrapper('return {{code}};');

                $step = 0;

                while ($step < $limit && isset($querys[$i])) {
                    $q = $querys[$i++];
                    $count = 1000;
                    $offset = 0;

                    for ($sort = 0; $sort <= 5; $sort++) {
                        $query->addCode(compact('count','offset','sort','q'), 'items');
                    }

                    $step++;
                }

                $groups[] = $this->api(...$query->getCode('+'));

            } catch (Throwable $e) {
            }

        } while ($i < $all);

        return $this->unique(count($groups) > 0 ? array_merge(...$groups) : []);
    }
}
