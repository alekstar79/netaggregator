<?php declare(strict_types=1);

namespace App\VkApi;

use Throwable;

/**
* Class Reject
* @package App\VkApi
*/
interface RejectInterface extends Throwable
{
    public const

     // PRIVACY_SETTINGS = 902,

        REQUEST_ERROR  = 502,
     // REQUEST_ENTITY = 413,

        LIMIT_REACHED = 29,
        ACCESS_DENIED = 15,

        FLOOD_CONTROL = 9,
        ACTION_DENIED = 7,
        MANY_REQUESTS = 6,
        AUTH_FAILED   = 5;

    public static function create(array $e): Reject;

    public static function errors(array $r): ?Reject;

    public function getParams(): array;
}
