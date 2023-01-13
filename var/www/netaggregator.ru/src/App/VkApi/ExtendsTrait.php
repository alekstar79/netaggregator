<?php declare(strict_types=1);

namespace App\VkApi;

use GuzzleHttp\Promise\Utils;

/**
* Trait ExtendsTrait
* @package App\VkApi
*/
trait ExtendsTrait
{
    public function hasToken(array $params): bool
    {
        return isset($params['access_token']) && $params['access_token'];
    }

    public function wait($promises)
    {
        return Utils::settle($promises)->wait();
    }
}
