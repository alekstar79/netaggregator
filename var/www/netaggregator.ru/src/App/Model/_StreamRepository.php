<?php declare(strict_types=1);

namespace App\Model;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Stream\Rules;

/**
* Class StreamRepository
* @package App\Model
*/
class _StreamRepository extends EMStoreLayer implements StreamRepositoryInterface
{
    private const

        JSON = ['tags','stop','query'],
        INT  = ['id','user_id'];

    /** @var SimpleDBInterface */
    private SimpleDBInterface $pg;

    public function __construct(EntityManagerInterface $em, SimpleDBInterface $pg)
    {
        parent::__construct(Rules::class, $em);
        $this->pg = $pg;
    }

    private function decode(array $set): array
    {
        $json = array_intersect_key($set, array_flip(self::JSON));
        $int = array_intersect_key($set, array_flip(self::INT));
        $int = array_map('intval', $int);

        return array_merge($int, array_map(static function($item) {
            /** @noinspection JsonEncodingApiUsageInspection */
            return $item ? json_decode($item, true) : $item;
        }, $json));
    }

    public function countAll(): int
    {
        return (int) $this->pg->getOne('SELECT count(id) FROM rules;');
    }

    public function all(int $offset = null, int $limit = null): array
    {
        $q = /** @lang GenericSQL */ 'SELECT * FROM rules ORDER BY id OFFSET ?i LIMIT ?i;';

        if ($ret = $this->pg->getInd('user_id', $q, $offset, $limit)) {
            return array_map(function(array $set) {
                return $this->decode($set);
            }, $ret);
        }

        return [];
    }

    public function find(string $id): array
    {
        $q = /** @lang GenericSQL */ 'SELECT * FROM rules WHERE id = ?i;';

        if ($set = $this->pg->getRow($q, $id)) {
            return $this->decode($set);
        }

        return [];
    }

    public function findByUserId(int $userId): array
    {
        $q = /** @lang GenericSQL */ 'SELECT * FROM rules WHERE user_id = ?i;';

        if ($set = $this->pg->getRow($q, $userId)) {
            return $this->decode($set);
        }

        return [];
    }

    public function findByTags(array $tags): array
    {
        $q = /** @lang GenericSQL */ 'SELECT * FROM rules WHERE tags ?| array[?a] ORDER BY id;';

        if ($ret = $this->pg->getInd('user_id', $q, $tags)) {
            return array_map(function(array $set) {
                return $this->decode($set);
            }, $ret);
        }

        return [];
    }

    public function increment(array $tags): bool
    {
        $query = '';

        foreach ($tags as $t => $c) {
            $query .= "UPDATE rules SET tags = jsonb_set(tags, '{\"$t\",\"stat\"}', to_jsonb((tags->'$t'->>'stat')::int + $c)) WHERE tags ? '$t';";
        }

        $this->pg->async($query);

        return true;
    }

    public function clear(int $userId): bool
    {
        return $this->pg->async(
            /** @lang GenericSQL */ 'UPDATE rules SET tags = ?p WHERE user_id = ?i;',
            'regexp_replace(tags::text, \'"stat": \d*\', \'"stat": 0\', \'g\')::jsonb',
            $userId
        );
    }

    public function update(int $userId, iterable $dataset): bool
    {
        $c = compact('userId');

        if ($rules = $this->repository->findOneBy($c)) {
            return (bool) $this->save($rules->update($dataset));
        }

        return false;
    }

    /* public function insert(int $user_id, iterable $dataset): bool
    {
        if ($set = $this->pg->filterArray((array) $dataset, self::JSON)) {
            $values = implode(',', array_map(static function($v) {
                return "'" . (is_scalar($v) ? $v : json_encode($v)) . "'";
            }, array_values($set)));

            $keys = implode(',', array_keys($set));
            $id = 1 + $this->countAll();

            $q = "INSERT INTO rules (id, user_id, {$keys}) VALUES ({$id}, {$user_id}, {$values});";

            return $this->pg->async($q);
        }

        return false;
    } */

    /* public function update(int $user_id, iterable $dataset): bool
    {
        $q = 'UPDATE rules SET ?u WHERE user_id = ?i;';

        if ($set = $this->pg->filterArray((array) $dataset, self::JSON)) {
            return $this->pg->async($q, $set, $user_id);
        }

        return false;
    } */

    public function remove(int $userId): bool
    {
        return $this->pg->async(/** @lang GenericSQL */ 'DELETE FROM rules WHERE user_id = ?i;', $userId);
    }

    public function getLineChart(array $tags, int $stamp): array
    {
        return [];
    }

    public function updateLinesChart(array $tags): bool
    {
        return true;
    }

    public function sliceLineChart(): bool
    {
        return true;
    }
}
