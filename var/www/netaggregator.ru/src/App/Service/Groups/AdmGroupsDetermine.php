<?php declare(strict_types=1);

namespace App\Service\Groups;

use App\Model\VkTokensRepository;
use App\VkApi\TransportInterface;

/**
* Class AdmGroupsDetermine
* @package App\Service\Groups
*/
class AdmGroupsDetermine
{
    /** @var VkTokensRepository */
    private VkTokensRepository $tokens;

    /** @var TransportInterface */
    private TransportInterface $vk;

    /** @var string */
    public string $token;

    public function __construct(VkTokensRepository $tokens, TransportInterface $vk)
    {
        $this->tokens = $tokens;
        $this->vk = $vk;
    }

    // filter: admin,editor
    public function get(int $uid, string $token = ''): array
    {
        $this->token = $token;
        $ret = [];

        if (!$this->token && ($user = $this->tokens->findByUserId($uid))) {
            $this->token = $user['access_token'] ?? $user['accessToken'];
        }
        if ($this->token) {
            $this->vk->setToken($this->token);

            $ret = $this->vk->api('/groups.get', [
                'filter' => 'admin',
                'extended' => 1
            ], 'POST');
        }

        return $ret['response'] ?? $ret;
    }
}
