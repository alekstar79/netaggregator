<?php declare(strict_types=1);

namespace App\Service\Birthday;

/**
* Interface BirthdaysCollectorInterface
* @package App\Service\Birthday
*/
interface BirthdaysCollectorInterface
{
    public const

        PROJECT = ['_id' => 0, 'user_id' => 0, 'user._id' => 0, 'user.expiresIn' => 0, 'confirmation_key' => 0, 'server_id' => 0],
        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        TIMER = 60;

    public function run(): void;
}
