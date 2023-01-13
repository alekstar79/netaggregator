<?php declare(strict_types=1);

namespace App\Model;

/**
* Class DcoverRepository
* @package App\Model
*/
interface DcoverRepositoryInterface extends RepositoryInterface, StoreInterface
{
    public const ALL_FIELDS = [
        // 't.accessToken AS access_token',
        'c.groupId AS group_id',
        'c.lastSubscriber',
        'c.topCommentor',
        'c.topLiker',
        'c.time',
        'c.date',
        'c.timeZone AS time_zone',
        'c.text',
        'c.shape',
        'c.weather'
    ];

    public function addCover(int $userId, array $dataset): bool;

    public function removeCover(int $userId, int $gid): bool;

    public function notNull(string $field): array;
}
