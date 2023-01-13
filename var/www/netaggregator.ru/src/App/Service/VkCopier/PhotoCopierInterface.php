<?php declare(strict_types=1);

namespace App\Service\VkCopier;

/**
* Interface PhotoCopierInterface
* @package App\Service\VkCopier
*/
interface PhotoCopierInterface
{
    // public const PERM = 4096;

    public function generateAlbums(int $oid): bool;

    public function generatePhotos(int $oid, $aid): bool;

    public function run(int $from, int $to): bool;

    public function wallCopy(int $from, int $to): bool;

    public function links(int $oid, $aid): array;
}
