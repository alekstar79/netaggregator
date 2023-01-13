<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection DuplicatedCode
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\VkApi;

use Throwable;

/**
* Class APIVideo
* @package App\VkApi
*/
class APIVideo extends API
{
    public const

        ALBUMS = '/video.getAlbums',
        SAVE   = '/video.save',
        GET    = '/video.get';

    /**
     * @param int $owner_id
     * @param int|null $album_id
     * @param int $gcp
     * @param null $videos
     * @param int $extended
     * @return array
     */
    public function get(int $owner_id, int $album_id = null, int $gcp = PHP_INT_MAX, $videos = null, int $extended = 0): array
    {
        $all = $count = 200;
        $offset = 0;
        $flag = 0;
        $list = [];

        $videos = $this->modify($videos);

        do {

            try {

                $offset += $flag * $count;
                $query = new Execute(self::GET, compact('owner_id','album_id','videos','offset','count','extended'));

                if ($all > $offset + $count) {
                    $offset = $query->dynamic($all);
                }

                $ret = $this->api(...$query->getCode());
                $all = $ret[0]['count'];

                if ($all > $gcp) {
                    $all = $gcp;
                }

                $list[] = array_merge(...array_column($ret, 'items'));

            } catch (Throwable $e) {
            }

            $flag = 1;

        } while ($all > $offset + $count);

        return count($list) > 0 ? array_merge(...$list) : [];
    }

    /**
     * @param int $owner_id
     * @param int $offset
     * @param int $count
     * @param int $extended
     * @param int $need_system
     * @return array
     * @throws RejectInterface
     */
    public function getAlbums(int $owner_id, int $offset = 0, int $count = 100, int $extended = 0, int $need_system = 0): array
    {
        return $this->api(self::ALBUMS, compact('owner_id','offset','count','extended','need_system'));
    }

    /**
     * @param int $group_id
     * @param string $name
     * @param string $description
     * @param string|null $access_token
     * @return array
     * @throws RejectInterface
     */
    public function save(int $group_id, string $name, string $description = '', string $access_token = null): array
    {
        $group_id = (int) abs($group_id);

        return $this->api(self::SAVE, compact('group_id','name','description','access_token'));
    }
}
