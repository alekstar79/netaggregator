<?php declare(strict_types=1);

namespace App\Service\Chat;

/**
 * Interface MakerInterface
 * @package App\Service\Chat
 */
interface MakerInterface
{
    public const AUDIO = 'audio', PHOTO = 'photo', VIDEO = 'video';

    public function make(): ?string;
}
