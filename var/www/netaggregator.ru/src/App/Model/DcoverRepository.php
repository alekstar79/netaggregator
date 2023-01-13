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

use App\Entity\Dcover\Owner;
use App\Entity\Dcover\Cover;

/**
* Class DcoverRepository
* @package App\Model
*/
class DcoverRepository extends EMStoreLayer implements DcoverRepositoryInterface
{
    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct(Owner::class, $em);
    }

    public function countAll(): int
    {
        $q = $this->repository->createQueryBuilder('t')->select('count(t)')->getQuery();

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
        $qb = $this->repository->createQueryBuilder('o')
            ->select(implode(',', self::ALL_FIELDS));

        $qb/* ->innerJoin(\App\Entity\Token\VkToken::class, 't', 'WITH', 'o.userId = t.userId') */
            ->innerJoin(Cover::class, 'c', 'WITH', 'o.id = c.owner');

        if ($offset) {
            $qb->setFirstResult($offset);
        }
        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }

    public function find(string $id): array
    {
        /** @var Owner $owner */
        if ($owner = $this->repository->find($id)) {
            return $owner->getCovers();
        }

        return [];
    }

    public function findByUserId(int $userId): array
    {
        $c = compact('userId');

        /** @var Owner $owner */
        if ($owner = $this->repository->findOneBy($c)) {
            return $owner->getCovers();
        }

        return [];
    }

    public function update(int $userId, array $dataset)
    {
        $c = compact('userId');

        /** @var Owner $owner */
        if ($owner = $this->repository->findOneBy($c)) {
            return $this->save($owner->update($dataset));
        }

        return false;
    }

    public function remove(int $userId): bool
    {
        $c = compact('userId');

        if ($owner = $this->repository->findOneBy($c)) {
            return $this->delete($owner);
        }

        return false;
    }

    public function addCover(int $userId, array $dataset): bool
    {
        $c = compact('userId');

        /** @var Owner $owner */
        if ($owner = $this->repository->findOneBy($c)) {
            return (bool) $this->save(
                $owner->addCover($dataset['gid'], $dataset['cover'])
            );
        }

        return false;
    }

    public function removeCover(int $userId, int $gid): bool
    {
        $c = compact('userId');

        /** @var Owner $owner */
        if ($owner = $this->repository->findOneBy($c)) {
            return (bool) $this->save($owner->removeCover($gid));
        }

        return false;
    }

    public function notNull(string $field): array
    {
        $field = sprintf('c.%s', $field);

        $qb = $this->repository->createQueryBuilder('o')
            ->select(implode(',', ['c.groupId AS group_id', $field]));

        $qb->innerJoin(Cover::class, 'c', 'WITH', 'o.id = c.owner');
        $qb->where($field . ' is not NULL');

        return $qb->getQuery()->getResult();
    }
}
