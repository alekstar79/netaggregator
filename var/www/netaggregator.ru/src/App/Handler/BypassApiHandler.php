<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use App\Model\TokensRepositoryInterface;
use App\VkApi\TransportInterface;

use RuntimeException;
use Throwable;

/**
 * Class BypassApiHandler
 * @package App\Handler
 */
class BypassApiHandler implements RequestHandlerInterface
{
    private const SERVICE_TOKEN = '88c59ebb88c59ebb88c59ebbb188a83a27888c588c59ebbd570d95d9f471532ac0f7d6c';

    /** @var TokensRepositoryInterface */
    private TokensRepositoryInterface $tokens;

    /** @var TransportInterface */
    private TransportInterface $http;

    public function __construct(TransportInterface $http, TokensRepositoryInterface $tokens)
    {
        $this->tokens = $tokens;
        $this->http = $http;
    }

    private function findToken(?int $uid): string
    {
        if (!$uid || !$u = $this->tokens->findByUserId($uid)) {
            throw new RuntimeException('Authorization error');
        }

        return $u['access_token'] ?? $u['accessToken'];
    }

    private function ifService(string $method): ?string
    {
        return substr_compare($method, '/storage', 0, 8) === 0 ? self::SERVICE_TOKEN : null;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $body = $request->getParsedBody();
        $response = ['response' => false];
        $method = null;

        $uid = $socials['vk'] ?? $body['uid'] ?? $body['user_id'] ?? null;

        try {

            if (isset($body['method'])) {
                $method = $body['method'];
                unset($body['method']);
            }
            if (isset($body['service'])) {
                $body['access_token'] = self::SERVICE_TOKEN;
                unset($body['service']);
            }
            if (!isset($body['access_token'])) {
                $body['access_token'] = $this->ifService($method) ?: $this->findToken($uid);
            }
            if (is_string($method)) {
                $response = $this->http->api($method, $body, 'POST');
            }

        } catch (Throwable $e) {
            $response['error'] = $e->getMessage();
        }

        return new JsonResponse($response);
    }
}
