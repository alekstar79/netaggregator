<?php declare(strict_types=1);

namespace App\Service\Groups;

use Psr\Container\ContainerInterface;

/**
* Class VkGroupAuthGenericFactory
* @package App\Service\Groups
*/
class VkGroupAuthProviderFactory
{
    public function __invoke(ContainerInterface $c): VkGroupAuthProvider
    {
        $vk = $c->get('config')['socials']['vk'];

        return new VkGroupAuthProvider([
            'clientId'     => $vk['client_id'],
            'clientSecret' => $vk['client_secret'],
            'redirectUri'  => VkGroupAuthProvider::REDIRECT_URI,

            'urlAuthorize'            => $vk['oauth_url'] .'/authorize',
            'urlAccessToken'          => $vk['oauth_url'] .'/access_token',
            'urlResourceOwnerDetails' => $vk['api_url'],

            'scopes' => VkGroupAuthProvider::SCOPE
        ]);
    }
}
