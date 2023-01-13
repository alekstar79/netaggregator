<?php declare(strict_types=1);

namespace App\Auxiliary\Auth;

use App\VkApi\TransportInterface;

use App\Model\TokensRepositoryInterface;
use App\Model\FbTokensRepository;
use App\Model\OkTokensRepository;

use App\Entity\Token\VkToken;
use App\Entity\Token\FbToken;
use App\Entity\Token\OkToken;

use JsonSerializable;
use stdClass;

use Throwable;

/**
* Class UserKeeper
* @package App\Auxiliary\Auth
*/
class UserKeeper implements KeeperInterface
{
    /** @var TransportInterface */
    private TransportInterface $http;

    /** @var array */
    private array $ok;

    public function __construct(TransportInterface $http, array $ok)
    {
        $this->http = $http;
        $this->ok = $ok;
    }

    private function safeDecode(string $json): stdClass
    {
        try {

            return json_decode($json, false, 512, JSON_THROW_ON_ERROR);

        } catch (Throwable $e) {
        }

        return new stdClass;
    }

    private function fbCredentials(string $access_token)
    {
        $url = 'https://graph.facebook.com/v2.9/me';
        $query = compact('access_token');

        $ret = $this->http->request('GET', $url, compact('query'));

        return $this->safeDecode($ret)->id;
    }

    private function hash(string $access_token): string
    {
        $secret = md5("$access_token{$this->ok['client_secret']}");

        return md5(sprintf(
            'application_key=%sformat=jsonmethod=users.getCurrentUser%s',
            $this->ok['application_key'],
            $secret
        ));
    }

    private function okCredentials(string $access_token)
    {
        $application_key = $this->ok['application_key'];
        $sig = $this->hash($access_token);

        $url = 'https://api.ok.ru/fb.do';
        $method = 'users.getCurrentUser';
        $format = 'json';

        $query = compact('method','access_token','application_key','format','sig');
        $ret = $this->http->request('GET', $url, compact('query'));

        return $this->safeDecode($ret)->uid;
    }

    public function store(TokensRepositoryInterface $repository, JsonSerializable $token): int
    {
        $info = $token->jsonSerialize();

        $expiresIn = $info['expires'] ?? null;
        $accessToken = $info['access_token'];

        switch (true) {
            case $repository instanceof FbTokensRepository:
                $uid = $this->fbCredentials($accessToken);
                $entity = FbToken::class;
                break;

            case $repository instanceof OkTokensRepository:
                $uid = $this->okCredentials($accessToken);
                $entity = OkToken::class;
                break;

            default:
                $uid = $info['user_id'];
                $entity = VkToken::class;
        }

        if (!$repository->update((int) $uid, compact('accessToken','expiresIn'))) {
            $repository->save(new $entity((int) $uid, $accessToken, $expiresIn));
        }

        $repository->flush();

        return (int) $uid;
    }
}
