<?php declare(strict_types=1);

namespace App\Service\Weather;

/**
* Interface ReceiverInterface
* @package App\Service\Weather
*/
interface ReceiverInterface
{
    public const TIMER = 3600, MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    public function fetch(): void;
}
