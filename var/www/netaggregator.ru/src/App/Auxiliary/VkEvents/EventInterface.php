<?php declare(strict_types=1);

namespace App\Auxiliary\VkEvents;

/**
* Interface EventInterface
* @package App\Auxiliary\VkEvents
*/
interface EventInterface
{
    public const

        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        PROJECTION = ['projection' => ['_id' => 0]];

    public static function create(array $data): self;

    public function perform(): void;

    public function extract(string $key);
}
