<?php declare(strict_types=1);

namespace App\Model;

/**
* Interface VkGroupRepositoryInterface
* @package App\Model
*/
interface VkGroupRepositoryInterface extends StoreInterface
{
    public const AT_FIELD = ['t.accessToken AS access_token'];

    public const REPO_FIELDS = [
        'r.groupId AS group_id',
        'r.userId AS user_id',
        'r.groupToken AS group_token',
        'r.confirmationKey AS confirmation_key',
        'r.serverId AS server_id'
    ];

    public function countAll(): int;

    public function all(int $offset = null, int $limit = null): array;

    public function allGids(): array;

    public function tokensByUserId(int $userId): array;

    public function find(int $id): ?array;

    public function findByGroupId(int $groupId): ?array;

    public function allByGroupIds(array $gids): array;

    public function update(int $groupId, iterable $dataset);

    public function remove(int $groupId): bool;
}
