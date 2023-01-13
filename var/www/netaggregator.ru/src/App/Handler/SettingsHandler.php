<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\Collection;
use MongoDB\Client;

use App\Service\Groups\AdmGroupsDetermine;
use App\Model\StreamRepositoryInterface;
use App\Model\TokensRepositoryInterface;
use App\VkApi\TransportInterface;

use Throwable;

/**
* Class SettingsHandler
* @package App\Handler
*/
class SettingsHandler implements RequestHandlerInterface
{
    private const

        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        SOCIALS = ['vk','ok','fb'];

    /** @var TokensRepositoryInterface */
    private TokensRepositoryInterface $tokens;

    /** @var StreamRepositoryInterface */
    private StreamRepositoryInterface $repo;

    /** @var AdmGroupsDetermine */
    private AdmGroupsDetermine $groups;

    /** @var Collection */
    private Collection $subscribe;

    /** @var Collection */
    private Collection $gtoken;

    /** @var TransportInterface */
    private TransportInterface $vk;

    /** @var array|null */
    private ?array $error;

    /** @var string */
    private string $token;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(TokensRepositoryInterface $tokens, StreamRepositoryInterface $repo, AdmGroupsDetermine $groups, TransportInterface $vk, Client $mongo)
    {
        $this->subscribe = $mongo->app->subscribe;
        $this->gtoken = $mongo->app->gtokens;

        $this->tokens = $tokens;
        $this->groups = $groups;

        $this->repo = $repo;
        $this->vk = $vk;

        $this->error = null;
        $this->token = '';
    }

    protected function parseError(array $error): void
    {
        $this->error = $error['error_code'] === 5 ? ['server_side_auth' => false] : $error;
    }

    private function compose(array $tags): array
    {
        $ret = [];

        foreach ($tags as $tag => $set) {
            $ret[] = [
                'tag' => $set['tag'] ?? $tag,
                'mark' => $set['mark'],
                'count' => $set['stat']
            ];
        }

        return $ret;
    }

    private function settings(int $uid): array
    {
        if (!$settings = $this->repo->findByUserId($uid)) {
            $settings = [];
        }

        $stop = $settings['stop'] ?? [];
        $tags = $settings['tags'] ?? [];
        $query = $settings['query'] ?? [];
        $stamp = $settings['stamp'] ?? null;
        $marks = array_column($tags, 'mark');
        $stats = $this->compose($tags);

        $chart = (object)($stamp
            ? $this->repo->getLineChart(
                array_map(static fn($s) => $s['tag'], $stats),
                $stamp
            )
            : []);

        return compact('marks','stats','stamp','chart','stop','query');
    }

    private function purchase(int $uid): ?array
    {
        return $this->subscribe->findOne(compact('uid'), self::MAP);
    }

    private function user(int $user_id): ?array
    {
        if (!$user = $this->tokens->findByUserId($user_id)) {
            $user = [];
        }
        if (!$token = $user['access_token'] ?? $user['accessToken'] ?? '') {
            $this->error = ['server_side_auth' => false];
            return null;
        }

        $available = $user['available'] ?? 0.0;
        $invited = $user['invited'] ?? [];
        $clicked = $user['clicked'] ?? 0;

        $this->vk->setToken($this->token = $token);
        $user = $this->vk->api('/users.get', [
            'fields' => 'photo_100,photo_200,status,sex,timezone',
            'user_id' => $user_id
        ]);

        if (isset($user['error'])) {
            $this->parseError($user['error']);
            $user = null;

        } else if (isset($user['response'])) {
            $user = $user['response'][0] ?? null;
        }
        if ($user !== null) {
            $user = array_merge($user, compact('clicked','invited','available'));
        }

        return $user;
    }

    private function converter(array $params): callable
    {
        $tokens = array_column(
            $this->gtoken->find([
                'group_id' => ['$in' => array_column($params, 'id')],
                'group_token' => ['$exists' => true, '$ne' => null]
            ], self::MAP)->toArray(),
            'group_token',
            'group_id'
        );

        return static function($t) use($tokens) {
            $t['token'] = $tokens[$t['id']] ?? null;
            return $t;
        };
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $params = $request->getQueryParams();
        $body = $request->getParsedBody();

        if (isset($params['dummy_stub'])) {
            $socials['vk'] = 25520481;
        }

        $credentials = array_merge(array_fill_keys(self::SOCIALS, null), $socials);
        $uid = (int) ($socials['vk'] ?? $params['uid'] ?? $body['uid'] ?? null);

        $subscribe = null;
        $settings = null;
        $user = null;
        $groups = [];

        try {

            if ($uid && $user = $this->user($uid)) {
                $groups = $this->groups->get($uid, $this->token)['items'] ?? [];
                $subscribe = $this->purchase($uid);
                $settings = $this->settings($uid);
            }
            if (count($groups)) {
                $groups = array_map($this->converter($groups), $groups);
            }

        } catch (Throwable $e) {
            $this->error = ['server_error' => $e->getMessage()];
        }

        $error = $this->error;

        return new JsonResponse(
            compact('credentials','subscribe','settings','groups','user','error')
        );
    }
}
