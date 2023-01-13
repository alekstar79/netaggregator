<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use MongoDB\Operation\BulkWrite;
use MongoDB\Collection;
use MongoDB\Client;

use App\Service\Groups\VkGroupAuthProvider;
use App\Service\Groups\AdmGroupsDetermine;
use App\Auxiliary\Auth\AssistantInterface;

use App\VkApi\TransportInterface;

/**
 * Class GroupAuthHandler
 * @package App\Handler
 * @requires /auth/group?list[0]=gid_1&list[1]=gid_2
 *
 * How do I get the app_widget permission for the community key?
 * Only via VK Bridge in an application with the VK Mini Apps type.
 * @example bridge.send("VKWebAppGetCommunityToken", {"app_id": 6909581, "group_id": 1, "scope": "app_widget"})
 * @see https://vk.com/faq11760
 */
class GroupAuthHandler implements RequestHandlerInterface
{
    public const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var AssistantInterface */
    private AssistantInterface $assistant;

    /** @var VkGroupAuthProvider */
    private VkGroupAuthProvider $provider;

    /** @var AdmGroupsDetermine */
    private AdmGroupsDetermine $groups;

    /** @var Collection */
    private Collection $tokens;

    //** @var TransportInterface */
    //private TransportInterface $http;

    /** @var array */
    private array $list;

    /** @var int|null */
    private ?int $uid;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(AssistantInterface $assistant, VkGroupAuthProvider $provider, AdmGroupsDetermine $groups, Client $mongo /*, TransportInterface $http */)
    {
        $this->assistant = $assistant;
        $this->provider = $provider;

        $this->groups = $groups;
        $this->tokens = $mongo->app->gtokens;

        // $this->http = $http;
        $this->list = [];
    }

    private function store(array $tokens): void
    {
        $this->tokens->bulkWrite(
            array_map(function(array $item) {
                $set = ['group_id' => (int) $item['group_id'], 'user_id' => $this->uid, 'group_token' => $item['group_token']];

                return [BulkWrite::UPDATE_ONE => [
                    ['group_id' => $set['group_id']],
                    ['$set' => $set],
                    ['upsert' => true]
                ]];

            }, $tokens)
        );
    }

    private function getAdm(): array
    {
        $adm = $this->groups->get($this->uid);
        $ret = [];

        if (isset($adm['items'])) {
            $ret = array_column($adm['items'], 'id');
        }

        return $ret;
    }

    private function link(array $list): string
    {
        $lnk = VkGroupAuthProvider::REDIRECT_URI . '?';

        foreach ($list as $i => $gid) {
            $lnk .= sprintf('list[%d]=%d%s', $i, $gid, '&');
        }

        return trim($lnk, '&');
    }

    private function getList(array $params): ?array
    {
        return isset($params['list']) ? array_filter(array_map('intval', (array) $params['list'])) : null;
    }

    /* private function isInvalideToken(string $token): bool
    {
        return isset($this->http->setToken($token)->api('/groups.getTokenPermissions')['error']);
    }

    private function onTheNeedNewToken(array $groups): array
    {
        $tokens = array_column(
            $this->tokens->find(['group_id' => ['$in' => $groups]], self::MAP)->toArray(),
            'group_token',
            'group_id'
        );

        return array_filter($groups, function($gid) use($tokens) {
            return !$tokens[$gid] || $this->isInvalideToken($tokens[$gid]);
        });
    } */

    private function fine(array $list): array
    {
        $adm = [];

        if ($groups = array_intersect($list, $this->getAdm())) {
            $adm = $groups; // $this->onTheNeedNewToken($groups);
        }

        return $adm;
    }

    private function getAuthUrl(array $group_ids): string
    {
        return $this->provider->getAuthorizationUrl([
            'group_ids' => implode(',', $group_ids),
            'scope' => VkGroupAuthProvider::SCOPE,
            'redirect_uri' => $this->assistant->get('group_auth'),
            'v' => TransportInterface::VER
        ]);
    }

    private function perform(array $params): ?ResponseInterface
    {
        if ($list = $this->getList($params)) {
            $socials = $this->assistant->get('socials') ?: [];

            if (!$this->assistant->get('group_auth')) {
                $this->assistant->set('group_auth', $this->link($list));
            }
            if (!isset($socials['vk'])) {
                return $this->assistant->redirect(AssistantInterface::USER_AUTH_PATH);
            }
            if ($this->uid = $socials['vk'] ?? null) {
                $this->list = $this->fine($list);
            }
        }

        return !$this->list
            ? $this->assistant->clear()->rehab(null)
            : null;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $this->assistant->setRequest($request);
        $params = $request->getQueryParams();

        if (isset($params['error'])) {
            return $this->assistant->clear()->rehab(null);
        }
        if ($response = $this->perform($params)) {
            return $response;
        }
        if (!isset($params['code'])) {
            $link = $this->getAuthUrl($this->list);

            $this->assistant->set('oauth2state', $this->provider->getState());

            return $this->assistant->redirect($link);
        }
        if ($this->assistant->verify($params)) {
            $this->store($this->provider->getGroupAccessToken(
                'authorization_code', [
                    'redirect_uri' => $this->assistant->get('group_auth'),
                    'code' => $params['code']
                ]
            ));
        }

        return $this->assistant->clear()->rehab(null);
    }
}
