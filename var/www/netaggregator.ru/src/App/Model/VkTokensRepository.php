<?php declare(strict_types=1);

namespace App\Model;

use MongoDB\Client;
use MongoDB\Collection;

/**
* Class VkTokensRepository
* @package App\Model
*/
class VkTokensRepository implements TokensRepositoryInterface
{
    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var Collection */
    private Collection $utokens;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $mongo)
    {
        $this->utokens = $mongo->app->utokens;
    }

    public function update(int $userId, array $dataset): bool
    {
        return $this->utokens->updateOne(
            $doc = compact('userId'),
            [
                '$setOnInsert' => ['invited' => [],'ref' => 0,'clicked' => 0,'available' => 0.0],
                '$set' => array_merge($doc, $dataset)
            ],
            ['upsert' => true]
        )->isAcknowledged();
    }

    public function countAll(): int
    {
        return $this->utokens->countDocuments();
    }

    public function all(int $offset = null, int $limit = null): array
    {
        return $this->utokens->find([], self::MAP)->toArray();
    }

    public function find(string $id): array
    {
        return $this->utokens->findOne(['_id' => $id], self::MAP);
    }

    public function findByUserId(int $userId): ?array
    {
        return $this->utokens->findOne(['userId' => $userId], self::MAP);
    }

    public function remove(int $userId): bool
    {
        return true;
    }

    public function delete($object, bool $flush = false): bool
    {
        return true;
    }

    public function save($object, bool $flush = false): void
    {
    }

    public function flush(): void
    {
    }
}
