<?php declare(strict_types=1);

namespace App\Model;

use MongoDB\{ Driver\CursorInterface, Client, Collection, BSON\ObjectId, Operation\FindOneAndUpdate };
use Traversable;

use DateTimeZone;
use DateTime;

use App\Service\Stream\HttpClient;

use Throwable;

/**
* Class StreamRepository
* @package App\Model
*/
class StreamRepository implements StreamRepositoryInterface
{
    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var HttpClient */
    private HttpClient $client;

    /** @var Collection */
    private Collection $stream;

    /** @var Collection */
    private Collection $lines;

    /** @var int */
    private int $today;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $mongo, HttpClient $client)
    {
        $this->stream = $mongo->app->stream;
        $this->lines = $mongo->app->lines;

        $this->client = $client;
        $this->today = 0;
    }

    public function countAll(): int
    {
        try {

            return $this->stream->countDocuments();

        } catch (Throwable $e) {
        }

        return 0;
    }

    public function all(int $offset = null, int $limit = null): array
    {
        try {

            $raw = $this->stream->find([], self::MAP)->toArray();

            return array_combine(
                array_column($raw, 'userId'),
                $raw
            );

        } catch (Throwable $e) {
        }

        return [];
    }

    public function getAllTags(): array
    {
        try {

            return $this->stream->distinct('tags.tag');

        } catch (Throwable $e) {
        }

        return [];
    }

    public function find(string $id): array
    {
        try {

            return $this->stream->findOne(['_id' => new ObjectId($id)], self::MAP);

        } catch (Throwable $e) {
        }

        return [];
    }

    public function findByUserId(int $userId): array
    {
        try {

            return $this->stream->findOne(compact('userId'), self::MAP);

        } catch (Throwable $e) {
        }

        return [];
    }

    public function findByTags(array $tags): array
    {
        try {

            return $this->stream->find(['tags.tag' => ['$in' => $tags]], self::MAP)->toArray();

        } catch (Throwable $e) {
        }

        return [];
    }

    public function increment(array $tags): bool
    {
        try {

            if ($docs = $this->stream->find(['tags.tag' => ['$in' => array_keys($tags)]], self::MAP)->toArray())
            {
                return $this->stream->bulkWrite(
                    array_map(static function($set) use ($tags) {
                        foreach ($set['tags'] as $i => $value) {
                            if (isset($tags[$value['tag']])) {
                                $set['tags'][$i]['stat'] += $tags[$value['tag']];
                            }
                        }

                        return ['updateOne' => [
                            ['_id' => $set['_id']],
                            ['$set' => $set]
                        ]];
                    }, $docs)

                )->isAcknowledged();
            }

        } catch (Throwable $e) {
        }

        return false;
    }

    private function convert(Traversable $raw, array $tags): array
    {
        $empty = ['dataset' => [], 'labels' => []];
        $dataset = [];

        $ret = $raw instanceof CursorInterface
            ? $raw->toArray()[0] ?? $empty
            : ((array) $raw)[0] ?? $empty;

        foreach ($tags as $tag) {
            $dataset[$tag] = array_column($ret['dataset'], $tag);
        }

        $ret['dataset'] = $dataset;
        $ret['labels'] = array_map(
            static fn($p) => $p * 1000,
            $ret['labels']
        );

        return $ret;
    }

    public function getLineChart(array $tags, int $stamp): array
    {
        return $this->convert(
            $this->lines->aggregate([
                ['$match' => ['_id' => ['$gte' => $stamp]]],
                [
                    '$group' => [
                        '_id' => 'lineschart',
                        'labels' => ['$push' => '$_id'],
                        'dataset' => [
                            '$push' => array_combine($tags, array_map(static fn($t) => "$$t", $tags))
                        ]
                    ]
                ],
                ['$project' => ['_id' => 0]]

            ], self::MAP), $tags
        );
    }

    public function updateLinesChart(array $tags): bool
    {
        try {

            $today = (new DateTime('now 00:00:00', new DateTimeZone('Europe/Moscow')))->getTimestamp();

            if ($this->today !== $today) {
                $this->today = $today;

                // $dump = array_fill_keys($this->getAllTags(), 0);
                $dump = array_fill_keys(array_keys($this->client->get()), 0);
                $tags = array_merge($dump, $tags);
            }
            if ($doc = $this->lines->findOneAndUpdate(
                ['_id' => $today],
                ['$setOnInsert' => $tags],
                [
                    'typeMap' => ['root' => 'array', 'document' => 'array'],
                    'returnDocument' => FindOneAndUpdate::RETURN_DOCUMENT_BEFORE,
                    'projection' => ['_id' => 0],
                    'upsert' => true,
                ]
            )) {
                foreach ($tags as $tag => $value) {
                    if (isset($doc[$tag])) {
                        $tags[$tag] += $doc[$tag];
                    }
                }

                return $this->lines
                    ->updateOne(['_id' => $today], ['$set' => $tags])
                    ->isAcknowledged();
            }

            return true;

        } catch (Throwable $e) {
        }

        return false;
    }

    public function sliceLineChart(): bool
    {
        try {

            /** @see https://www.cyberforum.ru/post12965040.html */
            $rem = (new DateTime('now 00:00:00', new DateTimeZone('Europe/Moscow')))->modify('-93 day')->getTimestamp();

            return $this->lines->deleteMany(['_id' => ['$lte' => $rem]])->isAcknowledged();

        } catch (Throwable $e) {
        }

        return false;
    }

    public function clear(int $userId): bool
    {
        try {

            /** @see https://question-it.com/questions/1587625/mongodb-izmenjaet-pole-massiva-obektov-po-nomeru-elementa-bez-findandmodify-ili-zaprosa-na-obnovlenie */
            return $this->stream->updateOne(
                compact('userId'),
                [
                    '$set' => array_merge(
                        ['stamp' => (new DateTime('now', new DateTimeZone('Europe/Moscow')))->getTimestamp()],
                        ["tags.$[].stat" => 0]
                    )
                ]
            )->isAcknowledged();

        } catch (Throwable $e) {
        }

        return false;
    }

    public function update(int $userId, iterable $dataset): StreamRepository
    {
        try {

            $stamp = (new DateTime('now', new DateTimeZone('Europe/Moscow')))->getTimestamp();

            $this->stream->findOneAndUpdate(
                compact('userId'),
                ['$set' => array_merge(compact('stamp'), $dataset)],
                ['upsert' => true]
            );

        } catch (Throwable $e) {
        }

        return $this;
    }

    public function remove(int $userId): bool
    {
        try {

            return $this->stream->deleteOne(compact('userId'))->isAcknowledged();

        } catch (Throwable $e) {
        }

        return false;
    }

    public function save($object, bool $flush = false): StreamRepository
    {
        return $this;
    }

    public function flush(): void
    {
    }
}
