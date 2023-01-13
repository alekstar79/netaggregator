<?php declare(strict_types=1);

namespace App\Generic;

use Psr\Container\ContainerInterface;
use League\OAuth2\Client\Provider\GenericProvider;

use Helpers\TServerUtility;

/**
* Class OkAuthGeneric
* @package App\Generic
*/
class OkAuthGenericFactory
{
    use TServerUtility;

    public function __invoke(ContainerInterface $c): GenericProvider
    {
        $ok = $c->get('config')['socials']['ok'];

        $baseUrl = $this->baseUri();

        return new GenericProvider([
            'clientId'     => $ok['client_id'],
            'clientSecret' => $ok['client_secret'],
            'redirectUri'  => "$baseUrl/login/ok",

            'urlAuthorize'            => $ok['oauth_url'] . '/authorize',
            'urlAccessToken'          => $ok['api_url'] . '/oauth/token.do',
            'urlResourceOwnerDetails' => $ok['api_url'],
            'accessTokenMethod'       => 'POST',
            'scopeSeparator'          => ';',

            'scopes' => $ok['scope']
        ]);
    }
}
