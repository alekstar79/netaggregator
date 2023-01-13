<?php declare(strict_types=1);

namespace App\VkApi;

/**
* Class APIAccount
* @package App\VkApi
*/
class APIAccount extends API
{
    private const PERMISSIONS = '/account.getAppPermissions';

    /**
     * @param string $access_token
     * @return int
     * @throws RejectInterface
     */
    public function getAppPermissions(string $access_token): int
    {
        return $this->api(self::PERMISSIONS, compact('access_token'));
    }
}
