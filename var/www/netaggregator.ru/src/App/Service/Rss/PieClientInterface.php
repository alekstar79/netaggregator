<?php declare(strict_types=1);

namespace App\Service\Rss;

/**
* Interface PieClientInterface
* @package App\Service\Rss
*/
interface PieClientInterface
{
    public const

        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        TIMER = 300;
}
