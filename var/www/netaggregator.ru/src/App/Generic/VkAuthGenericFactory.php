<?php declare(strict_types=1);

namespace App\Generic;

use Psr\Container\ContainerInterface;
use League\OAuth2\Client\Provider\GenericProvider;

use Helpers\TServerUtility;

/**
* Class VkAuthGeneric
* @package App\Generic
*/
class VkAuthGenericFactory
{
    use TServerUtility;

    public function __invoke(ContainerInterface $c): GenericProvider
    {
        $vk = $c->get('config')['socials']['vk'];

        $baseUrl = $this->baseUri();

        return new GenericProvider([
            'clientId'     => $vk['client_id'],
            'clientSecret' => $vk['client_secret'],
            'redirectUri'  => "$baseUrl/login/vk",

            'urlAuthorize'            => $vk['oauth_url'] . '/authorize',
            'urlAccessToken'          => $vk['oauth_url'] . '/access_token',
            'urlResourceOwnerDetails' => $vk['api_url'],

            'scopes' => $vk['scope']
        ]);
    }
}
