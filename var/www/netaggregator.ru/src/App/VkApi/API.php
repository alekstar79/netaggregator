<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\VkApi;

use GuzzleHttp\Promise\PromiseInterface;

use JsonException;

/**
* Class API (multiple tokens wrapper)
* @package App\VkApi
*/
class API extends TokenManager implements APIInterface
{
    use ExtendsTrait;

    /** @var TransportInterface */
    public TransportInterface $http;

    public function __construct(TransportInterface $http, array $tokens)
    {
        parent::__construct($tokens);
        $this->http = $http;
    }

    public function modify($data): ?string
    {
        return is_array($data) ? implode(',', $data) : $data;
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

    public function api(string $point, array $params = [], string $method = 'POST')
    {
        if ($token = $this->perform($params)) {
            $this->http->setToken($token);
        }

        $r = $this->http->api($point, $params, $method);

        if (!$this->success($r)) {
            return $this->api($point, $params, $method);
        }

        return $r['response'] ?? $r;
    }

    public function asyncApi(string $point, array $params = [], string $method = 'POST')
    {
        return $this->http->asyncApi($point, $params, $method);
    }

    /**
     * @throws JsonException
     */
    public function dynamicQuery(string $method, array $params, int $offset, int $count, int $limit): array
    {
        $all = $count;
        $set = [];
        $flag = 0;

        do {

            $offset += $flag * $count;
            $query = new Execute($method, array_merge($params, compact('count', 'offset')));

            if ($all > $offset + $count) {
                $offset = $query->dynamic($all);
            }

            try {

                $ret = $this->api(...$query->getCode());
                $all = $ret[0]['count'] ?? $all;

                if ($all > $limit) {
                    $all = $limit;
                }
                if (isset($ret[0]['items'])) {
                    $set[] = array_merge(...array_column($ret, 'items'));
                }

            } catch (RejectInterface $e) {
            }

            $flag = 1;

        } while($all > $offset + $count);

        return count($set) > 0
            ? array_slice(array_merge(...$set), 0, $limit)
            : [];
    }
}
