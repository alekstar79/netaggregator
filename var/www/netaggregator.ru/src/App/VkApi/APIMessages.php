<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\VkApi;

use Generator;
use Throwable;

/**
* Class APIMessages
* @package App\VkApi
*/
class APIMessages extends API
{
    public const

        SEND          = '/messages.send',
        HISTORY       = '/messages.getHistory',
        ACTIVITY      = '/messages.setActivity',
     // ALLOWED       = '/messages.isMessagesFromGroupAllowed',
        CONVERSATIONS = '/messages.getConversations';

    /**
     * @param int $group_id
     * @param int $user_id
     * @param string $access_token
     * @return bool
     * @throws RejectInterface
     */
    /* public function isMessagesFromGroupAllowed(int $group_id, int $user_id, string $access_token = null): bool
    {
        $ret = $this->api(self::ALLOWED, compact('group_id','user_id','access_token'));
        return 1 === (int) $ret['is_allowed'];
    } */

    /**
     * @param int $user_id
     * @param string $type
     * @param string|null $access_token
     * @return mixed
     */
    public function setActivity(int $user_id, string $type = 'typing', string $access_token = '')
    {
        try {
            return $this->api(self::ACTIVITY, compact('user_id','type','access_token'));
        } catch (Throwable $e) {
        }

        return false;
    }

    /**
     * @param array $data
     * @return array
     */
    public function send(array $data): array
    {
        $chunks = array_chunk((array) $data['receiver'], Execute::MAX_API_CALLS * 100);
        $responces = [];

        $data['dont_parse_links'] = 1;
        unset($data['receiver']);

        foreach ($chunks as $set) { try {
            if ($raw = $this->api(
                ...Execute::multiple(
                    self::SEND,
                    array_reduce(array_chunk($set, 100), static function($acc, $ids) use($data) {
                        $acc[] = array_merge(['user_ids' => implode(',', $ids)], $data);
                        return $acc;
                    }, [])
                )->getCode()
            )) {
                $responces[] = array_merge(...$raw);
            }

        } catch (Throwable $e) {
        } }

        return is_array($responces) && count($responces) > 0
            ? array_merge(...$responces)
            : [];
    }

    /**
     * @param int $user_id
     * @param int $offset
     * @param int $count
     * @param int|null $peer_id
     * @param string|null $access_token
     * @return array
     * @throws RejectInterface
     */
    public function getHistory(int $user_id, int $offset = 0, int $count = 200, int $peer_id = null, string $access_token = ''): array
    {
        return $this->api(self::HISTORY, compact('user_id','offset','count','peer_id','access_token'));
    }

    public function getConversations(int $limit = PHP_INT_MAX, string $filter = 'all', $fields = null): Generator
    {
        $fields = $this->modify($fields);

        $all = $count = 200 > $limit ? $limit : 200;
        $offset = 0;
        $flag = 0;

        do {

            try {

                $offset += $flag * $count;
                $query = new Execute(self::CONVERSATIONS, compact('count','offset','fields','filter'));

                if ($all > $offset + $count) {
                    $offset = $query->dynamic($all);
                }

                $ret = $this->api(...$query->getCode());
                $all = $ret[0]['count'] ?? $all;

                if ($all > $limit) {
                    $all = $limit;
                }

                yield isset($ret[0]['items'])
                    ? array_merge(...array_column($ret, 'items'))
                    : [];

            } catch (Throwable $e) {
            }

            $flag = 1;

        } while($all > $offset + $count);
    }
}
