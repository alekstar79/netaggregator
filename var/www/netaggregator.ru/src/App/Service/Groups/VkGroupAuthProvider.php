<?php declare(strict_types=1);

namespace App\Service\Groups;

use League\OAuth2\Client\Provider\GenericProvider;
use Throwable;

/**
* Class VkGroupAuthProvider
* @package App\Service\Groups
*/
class VkGroupAuthProvider extends GenericProvider
{
    public const

        REDIRECT_URI = 'https://netaggregator.ru/auth/group',
        SCOPE = ['photos','messages','manage'];

    public function getGroupAccessToken($grant, array $options = []): array
    {
        $grant = $this->verifyGrant($grant);

        $params = [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri' => $this->redirectUri
        ];

        $params = $grant->prepareRequestParameters($params, $options);
        $request = $this->getAccessTokenRequest($params);
        $ret = [];

        try {

            $response = $this->getParsedResponse($request);

            unset($response['expires_in'], $response['groups']);

            foreach ($response as $key => $group_token) {
                $str = strrchr($key, '_');

                if ($str && $group_id = substr($str, 1)) {
                    $ret[] = compact('group_id','group_token');
                }
            }

        } catch (Throwable $e) {
        }

        return $ret;
    }
}
