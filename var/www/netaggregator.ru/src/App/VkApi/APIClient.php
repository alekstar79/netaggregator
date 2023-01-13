<?php declare(strict_types=1);

namespace App\VkApi;

use GuzzleHttp\Promise\PromiseInterface;
use RuntimeException;

/**
* Class APIClient
* @package App\VkApi
*/
class APIClient implements APIClientInterface
{
    use ExtendsTrait;

    /** @var TransportInterface */
    public TransportInterface $http;

    /** @var array */
    protected array $actions;

    /** @var array */
    protected array $tokens;

    public function __construct(TransportInterface $http, array $tokens = [])
    {
        $this->tokens = $tokens;
        $this->http = $http;
        $this->actions = [];
    }

    public function __set($name, $value)
    {
        // noop
    }

    public function __get($property)
    {
        if (!method_exists($this, $property)) {
            throw new RuntimeException('Property is not exists');
        }

        return $this->$property();
    }

    public function __isset($property): bool
    {
        return method_exists($this, $property);
    }

    private function instance(string $class)
    {
        if (!isset($this->actions[$class])) {
            $this->actions[$class] = new $class($this->http, $this->tokens);
        }

        return $this->actions[$class];
    }

    private function permissions(string $token): int
    {
        try {
            return $this->account->getAppPermissions($token);
        } catch (RejectInterface $e) {
            return 0;
        }
    }

    public function setCurrentTokens(int $req): void
    {
        static $tokens = [];

        $current = current($this->tokens);

        if ($this->permissions($current) & $req) {
            $tokens[] = $current;
        }
        if (!next($this->tokens)) {
            $this->tokens = $tokens;
            return;
        }

        $this->setCurrentTokens($req);
    }

    public function nextToken(): string
    {
        $token = current($this->tokens);

        if (!next($this->tokens)) {
            reset($this->tokens);
        }

        return $token;
    }

    public function setToken(string $token): self
    {
        if ($token) {
            $this->http->setToken($token);
            $this->tokens = [];
        }

        return $this;
    }

    public function setExtra(array $extra): void
    {
        $this->http->setExtra($extra);
    }

    public function getServiceToken(): string
    {
        return $this->http->getServiceToken();
    }

    public function request(string $method, string $url, array $params = []): string
    {
        return $this->http->request($method, $url, $params);
    }

    public function async(string $method, string $url, array $params = []): PromiseInterface
    {
        return $this->http->async($method, $url, $params);
    }

    public function api(string $point, array $params = [], string $method = 'GET'): array
    {
        return $this->http->api($point, $params, $method);
    }

    public function asyncApi(string $point, array $params = [], string $method = 'GET')
    {
        return $this->http->asyncApi($point, $params, $method);
    }

    public function streaming(): APIStreaming
    {
        return $this->instance(self::STREAMING);
    }

    public function messages(): APIMessages
    {
        return $this->instance(self::MESSAGES);
    }

    public function account(): APIAccount
    {
        return $this->instance(self::ACCOUNT);
    }

    public function friends(): APIFriends
    {
        return $this->instance(self::FRIENDS);
    }

    public function groups(): APIGroups
    {
        return $this->instance(self::GROUPS);
    }

    public function likes(): APILikes
    {
        return $this->instance(self::LIKES);
    }

    public function photos(): APIPhotos
    {
        return $this->instance(self::PHOTOS);
    }

    public function video(): APIVideo
    {
        return $this->instance(self::VIDEO);
    }

    public function users(): APIUsers
    {
        return $this->instance(self::USERS);
    }

    public function wall(): APIWall
    {
        return $this->instance(self::WALL);
    }
}
