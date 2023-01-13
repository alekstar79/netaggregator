<?php declare(strict_types=1);

namespace App\Auxiliary\Auth;

use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Expressive\Session\SessionInterface;
use Zend\Diactoros\Response\RedirectResponse;
use Zend\Diactoros\Response\HtmlResponse;

use League\OAuth2\Client\Token\AccessTokenInterface;
use League\OAuth2\Client\Provider\GenericProvider;

use App\Middleware\ServicesRouterMiddleware;
use App\Model\TokensRepositoryInterface;

use MongoDB\{ Client, Collection };
use Throwable;

/**
* Class Assistant
* @package App\Auxiliary\Auth
* @github https://github.com/socialconnect/auth
*/
class Assistant implements AssistantInterface
{
    /** @var ServerRequestInterface */
    private ServerRequestInterface $request;

    /** @var SessionInterface */
    private SessionInterface $session;

    /** @var KeeperInterface */
    private KeeperInterface $keeper;

    /** @var Collection */
    private Collection $utokens;

    /** @var string|null */
    private ?string $ref;

    /** @var string */
    private string $sid;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->utokens = $client->app->utokens;
    }

    private function referer(): string
    {
        $server = $this->request->getServerParams();

        if (!$referer = $server['HTTP_REFERER'] ?? null) {
            $referer = $this->request->getUri()->withQuery('')->withPath('');
        }

        return (string) $referer;
    }

    private function getRepository(): TokensRepositoryInterface
    {
        return $this->request->getAttribute(ServicesRouterMiddleware::REPOSITORY);
    }

    private function getProvider(): GenericProvider
    {
        return $this->request->getAttribute(ServicesRouterMiddleware::AUTH_PROVIDER);
    }

    public function set(string $key, $val): void
    {
        $this->session->set($key, $val);
    }

    public function get(string $key)
    {
        return $this->session->get($key);
    }

    public function clear(): self
    {
        $this->session->unset('oauth2state');
        $this->session->unset('group_auth');
        $this->session->unset('referer');
        $this->session->unset('ref');

        return $this;
    }

    public function redirect(?string $referer = null): ResponseInterface
    {
        return new RedirectResponse($referer ?: $this->ref);
    }

    public function verify(array $params): bool
    {
        return isset($params['state']) && $params['state'] === $this->get('oauth2state');
    }

    public function rehab(?AccessTokenInterface $token): ResponseInterface
    {
        $this->session->unset('oauth2state');

        $lnk = $token instanceof AccessTokenInterface
            ? $this->session->get('group_auth')
            : null;

        if ($lnk) {
            return $this->redirect($lnk);
        }

        $this->session->unset('referer');

        return new HtmlResponse(
            file_get_contents(__DIR__ . '/response.html')
        );
    }

    private function inviteHandler(int $uid, int $ref): void
    {
        $doc = $this->utokens->findOne(['userId' => $uid], ['typeMap' => ['root' => 'array', 'document' => 'array']]);

        if (!$doc['ref'] || $doc['ref'] === 0) {
            $this->utokens->bulkWrite([
                ['updateOne' => [['userId' => $ref], ['$push' => ['invited' => $uid]], ['upsert' => false]]],
                ['updateOne' => [['userId' => $uid], ['$set' => ['ref' => $ref]], ['upsert' => false]]]
            ]);
        }
    }

    public function setMark(int $uid = null): self
    {
        $socials = $this->get('socials') ?: [];
        $socials[$this->sid] = $uid;

        $this->set('socials', $socials);

        try {

            if ($uid && ($ref = $this->get('ref'))) {
                $this->inviteHandler($uid, $ref);
            }

        } catch (Throwable $e) {
        }

        return $this;
    }

    public function authorize(): ResponseInterface
    {
        $provider = $this->getProvider();

        $link = $provider->getAuthorizationUrl();
        $state = $provider->getState();

        $this->set('oauth2state', $state);

        return $this->redirect($link);
    }

    public function handle(array $params): ResponseInterface
    {
        $token = null;

        if ($this->verify($params)) {
            $repository = $this->getRepository();
            $provider = $this->getProvider();

            try {

                $token = $provider->getAccessToken('authorization_code', $params);
                $this->setMark($this->keeper->store($repository, $token));

            } catch (IdentityProviderException $e) {
            }
        }

        $this->clear();

        return $this->rehab($token);
    }

    public function setCallback(KeeperInterface $keeper): void
    {
        $this->keeper = $keeper;
    }

    public function setRequest(ServerRequestInterface $request): void
    {
        $this->session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $this->sid = $request->getAttribute('srv') ?: 'group';
        $this->request = $request;

        if (!$this->ref = $this->get('referer')) {
            $this->set('referer', $this->ref = $this->referer());
        }
    }
}
