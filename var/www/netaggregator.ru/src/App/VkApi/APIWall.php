<?php
/**
* @noinspection PhpMultipleClassDeclarationsInspection
* @noinspection UnknownInspectionInspection
* @noinspection DuplicatedCode
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\VkApi;

use Generator;

use JsonException;
use Throwable;

/**
* Class APIWall
* @package App\VkApi
*/
class APIWall extends API
{
    public const

        GET         = '/wall.get',
        GETBYID     = '/wall.getById',
        GETCOMMENTS = '/wall.getComments',
        GETREPOSTS  = '/wall.getReposts';

    /**
     * @param int $owner_id
     * @param int $gcp
     * @param string $filter
     * @param null $fields
     * @param int $extended
     * @return array
     */
    public function get(int $owner_id, int $gcp = PHP_INT_MAX, string $filter = 'owner', $fields = null, int $extended = 0): array
    {
        $all = $count = 80;
        $posts = [];
        $offset = 0;
        $flag = 0;

        $fields = $this->modify($fields);

        do {

            try {

                $offset += $flag * $count;
                $query = new Execute(
                    self::GET,
                    compact('owner_id','count','offset','filter','fields','extended')
                );

                if ($all > $offset + $count) {
                    $offset = $query->dynamic($all);
                }

                $ret = $this->api(...$query->getCode());
                $all = $ret[0]['count'];

                if ($all > $gcp) {
                    $all = $gcp;
                }

                $posts[] = array_merge(...array_column($ret, 'items'));

            } catch (Throwable $e) {
            }

            $flag = 1;

        } while ($all > $offset + $count);

        return count($posts) > 0
            ? array_slice(array_merge(...$posts), 0, $gcp)
            : [];
    }

    /**
     * @param array $posts
     * @param null $fields
     * @param int $copy_history_depth
     * @param int $extended
     * @return Generator
     */
    public function getById(array $posts, $fields = null, int $copy_history_depth = 2, int $extended = 0): Generator
    {
        $count = 80;
        $chunk = Execute::MAX_API_CALLS * $count;
        $pids = array_chunk($posts, $chunk);

        $fields = $this->modify($fields);

        foreach ($pids as $pack) { try {
            yield $this->api(
                ...Execute::multiple(
                    self::GETBYID,
                    array_map(function($posts) use($fields, $copy_history_depth, $extended) {
                        $posts = $this->modify($posts);
                        return compact('posts','fields','copy_history_depth','extended');
                    }, array_chunk($pack, $count))
                )
                    ->setWrapper('return {{code}};')
                    ->getCode('+')
            );

        } catch (Throwable $e) {
        } }

        // return \count($ret) > 0 ? array_merge(...$ret) : [];
    }

    /**
     * @param int $owner_id
     * @param int $post_id
     * @param int $need_likes
     * @return array
     */
    public function getComments(int $owner_id, int $post_id, int $need_likes = 1): array
    {
        $all = $count = 100;
        $comments = [];
        $page = 0;

        do {

            try {

                $offset = $page * $count;
                $ret = $this->api(self::GETCOMMENTS, compact('owner_id','post_id','count','offset','need_likes'));

                $all = $ret['count'];
                $comments[] = $ret['items'];

            } catch (Throwable $e) {
            }

            $page++;

        } while ($all > $offset + $count);

        return count($comments) > 0 ? array_merge(...$comments) : [];
    }

    /**
     * @throws JsonException
     */
    private function multiquery(string $method, array $pids, array $data): Execute
    {
        $post_id = array_splice($pids, 0, 1)[0];

        /** @noinspection AdditionOperationOnArraysInspection */
        $query = new Execute($method, compact('post_id') + $data, 'items');

        foreach ($pids as $id) {
            $query->addCode(['post_id' => $id] + $data, 'items');
        }

        return $query;
    }

    public function getLast100(int $owner_id, $post_ids, int $need_likes = 0, string $token = null): array
    {
        if (!$post_ids) {
            return [];
        }

        $chunks = array_chunk((array) $post_ids, Execute::MAX_API_CALLS);
        $sort = 'desc';
        $count = 100;
        $offset = 0;

        $data = compact('owner_id','count','offset','need_likes','sort');
        $comments = [];

        do {

            try {

                $post_ids = current($chunks);

                $query = count($post_ids) > 1
                    ? $this->multiquery(self::GETCOMMENTS, $post_ids, $data)
                    : new Execute(
                        self::GETCOMMENTS,
                        ['post_id' => $post_ids[0]] + $data,
                        'items'
                    );

                $comments[] = array_merge(...$this->api(...$query->getCode('+', $token)));

            } catch (Throwable $e) {
            }

        } while (next($chunks));

        $comments = array_filter($comments, static fn($v): bool => (bool) $v);

        return count($comments) > 0 ? array_merge(...$comments) : [];
    }

    public function getLast200Reposts(int $owner_id, $post_ids, string $token = null): array
    {
        if (!$post_ids) {
            return [];
        }

        $chunks = array_chunk((array) $post_ids, Execute::MAX_API_CALLS);
        $count = 200;
        $offset = 0;

        $data = compact('owner_id','count','offset');
        $reposts = [];

        do {

            try {

                $post_ids = current($chunks);

                $query = count($post_ids) > 1
                    ? $this->multiquery(self::GETREPOSTS, $post_ids, $data)
                    : new Execute(
                        self::GETREPOSTS,
                        ['post_id' => $post_ids[0]] + $data,
                        'items'
                    );

                $reposts[] = array_merge(...$this->api(...$query->getCode('+', $token)));

            } catch (Throwable $e) {
            }

        } while (next($chunks));

        $reposts = array_filter($reposts, static fn($v): bool => (bool) $v);

        return count($reposts) > 0 ? array_merge(...$reposts) : [];
    }
}
