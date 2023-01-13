<?php declare(strict_types=1);

namespace App\Generic;

use Psr\Container\ContainerInterface;
use League\OAuth2\Client\Provider\GenericProvider;

use Helpers\TServerUtility;

/**
* Class FbAuthGeneric
* @package App\Generic
*/
class FbAuthGenericFactory
{
    use TServerUtility;

    public function __invoke(ContainerInterface $c): GenericProvider
    {
        $fb = $c->get('config')['socials']['fb'];

        $baseUrl = $this->baseUri();

        return new GenericProvider([
            'clientId'     => $fb['client_id'],
            'clientSecret' => $fb['client_secret'],
            'redirectUri'  => "$baseUrl/login/fb",

            'urlAuthorize'            => $fb['oauth_url'] . '/oauth',
            'urlAccessToken'          => $fb['api_url'] . '/oauth/access_token',
            'urlResourceOwnerDetails' => $fb['api_url'],

            'scopes' => $fb['scope']
        ]);
    }
}
