<?php declare(strict_types=1);

namespace App\VkApi;

/**
* Interface TokenManagerInterface
* @package App\VkApi
*/
interface TokenManagerInterface
{
    public const ZERRO_TIMEOUT_LIMIT = 15, TIMEOUT = 3000000; // 1700000

    public function setTokens(array $tokens = []): TokenManager;

    public function perform(array $params): ?string;

    public function success(array $r): bool;
}
