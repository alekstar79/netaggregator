<?php
/**
* @noinspection PhpUndefinedFieldInspection
* @noinspection DuplicatedCode
*/

declare(strict_types=1);

namespace App\Service\Rss;

use MongoDB\{Database, Client };

use SimplePie;

use Throwable;

/**
* Class PieClient
* @package App\Service\Rss
*/
class PieClient implements PieClientInterface
{
    /** @var SimplePie */
    private SimplePie $pie;

    /** @var Database */
    private Database $db;

    public function __construct(Client $mongo, SimplePie $pie)
    {
        $pie->set_input_encoding('utf-8');
        $pie->enable_cache(false);

        $this->db = $mongo->app;
        $this->pie = $pie;
    }

    public function updateOne(int $_id): bool
    {
        try {

            if ($doc = $this->db->dcover->findOne($filter = compact('_id'), self::MAP))
            {
                $this->pie->set_feed_url($doc['rss']['channel']);

                if (!$this->pie->init() || $this->pie->error()) {
                    return $this->db->dcover->updateOne($filter, [
                        ['$set' => ['rss.error' => true]],
                        ['upsert' => true]
                    ])->isAcknowledged();
                }

                $feed = [];
                foreach ($this->pie->get_items(0, 5) as $i => $item) {
                    $feed[$i]['title'] = $item->get_title();
                    $feed[$i]['content'] = $item->get_content();
                    $feed[$i]['date'] = $item->get_date('j M Y, g:i');
                }

                if (count($feed)) {
                    return $this->db->dcover->updateOne(
                        $filter,
                        ['$set' => ['rss.error' => false, 'rss.feed' => $feed, 'changed' => true]],
                        ['upsert' => true]
                    )->isAcknowledged();
                }
            }

        } catch (Throwable $e) {
        }

        return false;
    }

    public function update(array $ids): bool
    {
        try {

            // file_put_contents(__DIR__ . '/update.json', json_encode($ids, JSON_THROW_ON_ERROR));
            if ($docs = $this->db->dcover->find(['_id' => ['$in' => $ids]], self::MAP)->toArray())
            {
                $this->pie->set_feed_url($docs[0]['rss']['channel']);

                if (!$this->pie->init() || $this->pie->error()) {
                    return $this->db->dcover->bulkWrite(
                        array_map(static function($doc): array {
                            return ['updateOne' => [
                                ['_id' => $doc['_id']],
                                ['$set' => ['rss.error' => true]],
                                ['upsert' => true]
                            ]];

                        }, $docs)

                    )->isAcknowledged();
                }

                $feed = [];
                foreach ($this->pie->get_items(0, 5) as $i => $item) {
                    $feed[$i]['title'] = $item->get_title();
                    $feed[$i]['content'] = $item->get_content();
                    $feed[$i]['date'] = $item->get_date('j M Y, g:i');
                }

                return $this->db->dcover->bulkWrite(
                    array_map(static function($doc) use($feed): array {
                        return ['updateOne' => [
                            ['_id' => $doc['_id']],
                            ['$set' => [
                                'rss.error' => false,
                                'rss.feed' => $feed,
                                'changed' => true
                            ]],
                            ['upsert' => true]
                        ]];

                    }, $docs)

                )->isAcknowledged();
            }

        } catch (Throwable $e) {
        }

        return false;
    }

    public function fetch(): void
    {
        if ($docs = $this->db->dcover->find(['rss' => ['$exists' => true, '$ne' => null]], self::MAP)->toArray())
        {
            $this->db->dcover->bulkWrite(array_values(array_filter(
                array_map(function($doc): ?array {
                    try {

                        $this->pie->set_feed_url($doc['rss']['channel']);

                        if (!$this->pie->init() || $this->pie->error()) {
                            return ['updateOne' => [
                                ['_id' => $doc['_id']],
                                ['$set' => ['rss.error' => true]],
                                ['upsert' => true]
                            ]];
                        }

                        $feed = [];
                        foreach ($this->pie->get_items(0, 5) as $i => $item) {
                            $feed[$i]['title'] = $item->get_title();
                            $feed[$i]['content'] = $item->get_content();
                            $feed[$i]['date'] = $item->get_date('j M Y, g:i');
                        }

                        return ['updateOne' => [
                            ['_id' => $doc['_id']],
                            ['$set' => [
                                'rss.error' => false,
                                'rss.feed' => $feed,
                                'changed' => true
                            ]],
                            ['upsert' => true]
                        ]];

                    } catch (Throwable $e) {
                    }

                    return null;

                }, $docs)
            )));
        }
    }
}
