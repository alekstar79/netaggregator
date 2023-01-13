<?php declare(strict_types=1);

namespace App\Model;

/**
* Interface PostReadRepositoryInterface
* @package App\Model
*/
interface PostReadRepositoryInterface
{
    public function countAll(): int;

    public function all(int $offset, int $limit): array;

    public function find(int $id): ?array;
}
