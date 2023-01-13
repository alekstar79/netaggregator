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
* Class APILikes
* @package App\VkApi
*/
class APILikes extends API
{
    private const GETLIST = '/likes.getList', ADD = '/likes.add';

    /**
     * @param int $owner_id
     * @param int $item_id
     * @param string $type
     * @return array
     * @throws RejectInterface
     */
    public function add(int $owner_id, int $item_id, string $type): array
    {
        return $this->api(self::ADD, compact('owner_id','item_id','type'));
    }

    /**
     * @param int $owner_id
     * @param int $item_id
     * @param string $type
     * @param string $filter
     * @return array
     */
    public function getList(int $owner_id, int $item_id, string $type = 'post', string $filter = 'likes'): array
    {
        $all = $count = 1000;
        $offset = 0;
        $flag = 0;
        $users = [];

        do {

            try {

                $offset += $flag * $count;
                $query = new Execute(self::GETLIST, compact('owner_id','item_id','type','filter','count','offset'));

                if ($all > $offset + $count) {
                    $offset = $query->dynamic($all);
                }

                $ret = $this->api(...$query->getCode());
                $all = $ret[0]['count'] ?? $all;

                if ($items = array_column($ret, 'items')) {
                    $users[] = array_merge(...$items);
                }

            } catch (Throwable $e) {
            }

            $flag = 1;

        } while ($all > $offset + $count);

        return count($users) > 0 ? array_merge(...$users) : [];
    }

    /**
     * @throws JsonException
     */
    private function multiquery(array $ids, array $data): Execute
    {
        $item_id = array_splice($ids, 0, 1)[0];

        /** @noinspection AdditionOperationOnArraysInspection */
        $query = new Execute(self::GETLIST, compact('item_id') + $data);

        foreach ($ids as $id) {
            $query->addCode(['item_id' => $id] + $data);
        }

        return $query;
    }

    public function getLast1000(int $owner_id, $item_id, string $type = 'post', string $filter = 'likes'): array
    {
        if (!$item_id) {
            return [];
        }

        $chunks = array_chunk((array) $item_id, Execute::MAX_API_CALLS);
        $count = 1000;
        $offset = 0;

        $data = compact('owner_id','type','filter','count','offset');
        $likes = [];

        do {

            try {

                $item_id = current($chunks);
                $query = count($item_id) > 1
                    ? $this->multiquery($item_id, $data)
                    : new Execute(self::GETLIST, ['item_id' => $item_id[0]] + $data);

                $ret = $this->api(...$query->getCode());

                if ($items = array_column($ret, 'items')) {
                    $likes[] = array_merge(...$items);
                }

            } catch (Throwable $e) {
            }

        } while (next($chunks));

        return count($likes) > 0 ? array_merge(...$likes) : [];
    }
}
