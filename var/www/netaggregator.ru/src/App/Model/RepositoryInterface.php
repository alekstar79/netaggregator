<?php declare(strict_types=1);

namespace App\Model;

/**
* Interface RepositoryInterface
* @package App\Model
*/
interface RepositoryInterface
{
    public function countAll(): int;

    public function all(int $offset = null, int $limit = null): array;

    public function find(string $id): array;

    public function findByUserId(int $userId): ?array;

    public function update(int $userId, array $dataset);

    public function remove(int $userId): bool;
}
