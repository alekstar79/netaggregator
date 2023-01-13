<?php declare(strict_types=1);

namespace App\Service\VkCopier;

/**
* Interface VideoCopierInterface
* @package App\Service\VkCopier
*/
interface VideoCopierInterface
{
    // public const PERM = 4096;

    public function generateVideos(int $oid): bool;

    public function run(int $from, int $to);
}
