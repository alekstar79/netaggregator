<?php declare(strict_types=1);

namespace App\Model;

/**
* Interface StreamRepositoryInterface
* @package App\Model
*/
interface StreamRepositoryInterface extends RepositoryInterface
{
    public function getAllTags(): array;

    public function findByTags(array $tags): array;

    public function increment(array $tags): bool;

    public function getLineChart(array $tags, int $stamp): array;

    public function updateLinesChart(array $tags): bool;

    public function sliceLineChart(): bool;

    public function clear(int $userId): bool;

    public function save($object, bool $flush = false);

    public function flush(): void;
}
