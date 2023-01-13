<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\VkApi;

use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Promise\PromiseInterface;
use GuzzleHttp\ClientInterface;

use Rucaptcha\Client;
use Rucaptcha\Exception\RuntimeException;
use Throwable;

/**
* Class Transport
* @package App\VkApi
*/
class Transport implements TransportInterface
{
    use ExtendsTrait;

    /** @var ClientInterface */
    private ClientInterface $guzzle;

    /** @var Client */
    private Client $captcha;

    /** @var string|null */
    private ?string $token;

    /** @var array */
    private array $extra;

    /** @var array */
    private array $last;

    public function __construct(ClientInterface $guzzle, Client $captcha, string $token = null)
    {
        $this->captcha = $captcha;
        $this->guzzle = $guzzle;
        $this->token = $token;
        $this->extra = [];
    }

    private function captchaNeeded(array $response): bool
    {
        return isset($response['error']) && $response['error']['error_code'] === 14;
    }

    /**
     * @param array $response
     * @return array
     * @throws GuzzleException
     * @throws RuntimeException
     */
    private function captcha(array $response): array
    {
        $img = $response['error']['captcha_img'];
        $sid = $response['error']['captcha_sid'];

        $key = $this->captcha->recognize(file_get_contents($img));

        $this->last[1]['captcha_key'] = $key;
        $this->last[1]['captcha_sid'] = $sid;

        return $this->api(...$this->last);
    }

    private function prepare(string $point, array $params, string $method): array
    {
        if (!$this->hasToken($params)) {
            if (!$this->token) {
                throw new TransportException('Access token required');
            }

            $params['access_token'] = $this->token;
        }
        if (!isset($params['v'])) {
            $params['v'] = self::VER;
        }

        $url = self::API . '/method' . $point;
        $method = strtoupper($method);
        $params = $method === 'POST'
            ? ['form_params' => $params]
            : ['query' => $params];

        return [$method, $url, $params];
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

        return $this;
    }

    public function setExtra(array $extra = []): void
    {
        $this->extra = $extra;
    }

    /** @noinspection JsonEncodingApiUsageInspection */
    public function request(string $method, string $url, array $params = []): string
    {
        $params = array_merge_recursive($this->extra, $params);
        $method = strtoupper($method);

        try {
            $ret = $this->guzzle->request($method, $url, $params);
            $string = $ret->getBody()->getContents();
        } catch (GuzzleException $e) {
            return json_encode([
                'error' => [
                    'error_code' => $e->getCode(),
                    'error_msg' => $e->getMessage(),
                    'error_trace' => $e->getTrace()
                ]
            ]);
        }

        return $string;
    }

    public function async(string $method, string $url, array $params = []): PromiseInterface
    {
        $params = array_merge_recursive($this->extra, $params);
        $method = strtoupper($method);

        return $this->guzzle->requestAsync($method, $url, $params);
    }

    public function getServiceToken(): ?string
    {
        $url = self::OAUTH . '/access_token';
        $ret = [];

        $params = ['query' => [
            'grant_type' => 'client_credentials',
            'client_id' => self::CLIENT,
            'client_secret' => self::SECRET,
            'v' => self::VER
        ]];

        try {

            $json = $this->request('GET', $url, $params);
            $ret = json_decode($json, true, 512, JSON_THROW_ON_ERROR);

        } catch (Throwable $e) {
        }

        return $ret['access_token'] ?? null;
    }

    /**
     * @param string $point
     * @param array $params
     * @param string $method
     * @return array
     * @throws GuzzleException
     * @throws RuntimeException
     */
    public function api(string $point, array $params = [], string $method = 'GET'): array
    {
        $this->last = [$point, $params, $method];

        $request = $this->prepare($point, $params, $method);
        $ret = $this->request(...$request);

        try {

            $dec = json_decode($ret, true, 512, JSON_THROW_ON_ERROR); /* || [
                'response' => [[]],
                'execute_errors' => [[
                    'error_msg' => 'Permission to perform this action is denied',
                    'error_code' => 7
                ]]
            ]; */

        } catch (Throwable $e) {
            $dec = [
                'response' => [[]],
                'execute_errors' => [[
                    'error_msg' => $e->getMessage(),
                    'error_code' => $e->getCode()
                ]]
            ];
        }

        return $this->captchaNeeded($dec)
            ? $this->captcha($dec)
            : $dec;
    }

    public function asyncApi(string $point, array $params = [], string $method = 'GET'): PromiseInterface
    {
        return $this->async(...$this->prepare($point, $params, $method));
    }
}
