<?php /** @noinspection PhpMissingReturnTypeInspection */

declare(strict_types=1);

namespace App\Model;

use App\Entity\Token\BaseTokenInterface;
use Throwable;

/**
* Class TokensRepository
* @package App\Model
*/
abstract class TokensRepository extends EMStoreLayer implements TokensRepositoryInterface
{
    public function countAll(): int
    {
        $q = $this->repository->createQueryBuilder('t')->select('count(t)')->getQuery();

        try {
            return $q->getSingleScalarResult();
        } catch (Throwable $e) {
        }

        return 0;
    }

    /**
     * @param int $offset
     * @param int $limit
     * @return array
     * @noinspection PhpDocSignatureInspection
     */
    public function all(int $offset = null, int $limit = null): array
    {
        $qb = $this->repository->createQueryBuilder('t');

        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }
        if ($limit !== null) {
            $qb->setMaxResults($limit);
        }

        return array_map(
            static fn(BaseTokenInterface $token) => $token->toArray(),
            $qb->getQuery()->getResult()
        );
    }

    /**
     * @param string $id
     * @return array
     */
    public function find(string $id): array
    {
        if ($token = $this->repository->find($id)) {
            return $token->toArray();
        }

        return [];
    }

    public function findByUserId(int $userId): array
    {
        $c = compact('userId');

        if ($token = $this->repository->findOneBy($c)) {
            return $token->toArray();
        }

        return [];
    }

    public function update(int $userId, iterable $dataset)
    {
        $c = compact('userId');

        if ($token = $this->repository->findOneBy($c)) {
            return $this->save($token->update($dataset));
        }

        return false;
    }

    public function remove(int $userId): bool
    {
        $c = compact('userId');

        if ($token = $this->repository->findOneBy($c)) {
            return $this->delete($token);
        }

        return false;
    }
}
