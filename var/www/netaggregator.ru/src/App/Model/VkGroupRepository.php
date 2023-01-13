<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Model;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;

use App\Entity\Group\VkGroupToken;
use App\Entity\Token\VkToken;

/**
* Class VkGroupRepository
* @package App\Model
*/
class VkGroupRepository extends EMStoreLayer implements VkGroupRepositoryInterface
{
    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct(VkGroupToken::class, $em);
    }

    public function countAll(): int
    {
        $q = $this->repository->createQueryBuilder('r')->select('count(r)')->getQuery();

        try {
            return $q->getSingleScalarResult();
        } catch (NonUniqueResultException | NoResultException $e) {
        }

        return 0;
    }

    /**
     * @param int|null $offset
     * @param int|null $limit
     * @return array
     */
    public function all(int $offset = null, int $limit = null): array
    {
        $qb = $this->repository->createQueryBuilder('r');

        $offset && $qb->setFirstResult($offset);
        $limit && $qb->setMaxResults($limit);

        return array_map(
            static fn(VkGroupToken $token) => $token->toArray(),
            $qb->getQuery()->getResult()
        );
    }

    public function allGids(): array
    {
        $qb = $this->repository->createQueryBuilder('r')->select('r.groupId AS group_id');

        return array_column($qb->getQuery()->getResult(), 'group_id');
    }

    public function tokensByUserId(int $userId): array
    {
        $qb = $this->repository->createQueryBuilder('r')
            ->select(implode(',', [
                'r.groupToken AS group_token',
                'r.groupId AS group_id'
            ]));

        $qb->where('r.userId = '. $userId);

        if ($ret = $qb->getQuery()->getResult()) {
            return array_column($ret, 'group_token', 'group_id');
        }

        return [];
    }

    /**
     * @param int $id
     * @return array
     */
    public function find(int $id): ?array
    {
        if ($token = $this->repository->find($id)) {
            return $token->toArray();
        }

        return null;
    }

    public function findByGroupId(int $groupId): array
    {
        $fields = array_merge(self::AT_FIELD, self::REPO_FIELDS);

        $qb = $this->repository->createQueryBuilder('r')->select(implode(',', $fields));

        $qb->innerJoin(VkToken::class, 't', 'WITH', 'r.userId = t.userId');
        $qb->where('r.groupId = '. $groupId);

        try {
            return $qb->getQuery()->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
        }

        return [];
    }

    public function allByGroupIds(array $gids): array
    {
        $qb = $this->repository->createQueryBuilder('r')->select(implode(',', self::REPO_FIELDS));

        $qb->where('r.groupId IN (' . implode(',', $gids) . ')');

        return $qb->getQuery()->getResult();
    }

    public function update(int $groupId, iterable $dataset)
    {
        $c = compact('groupId');

        if ($token = $this->repository->findOneBy($c)) {
            return $this->save($token->update($dataset));
        }

        return false;
    }

    public function remove(int $groupId): bool
    {
        $c = compact('groupId');

        if ($token = $this->repository->findOneBy($c)) {
            return $this->delete($token);
        }

        return false;
    }
}
