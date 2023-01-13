<?php declare(strict_types=1);

namespace App\Service\Info;

/**
* Interface InformerInterface
* @package App\Service\Info
*/
interface InformerInterface
{
    public const

        PROJECT = ['_id' => 0, 'user_id' => 0, 'user._id' => 0, 'user.expiresIn' => 0, 'confirmation_key' => 0, 'server_id' => 0],
        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        TIMER = 300;

    public function fetch(): void;

    public function run(): void;
}
