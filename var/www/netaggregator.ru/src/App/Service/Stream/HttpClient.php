<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\Service\Stream;

use GuzzleHttp\ClientInterface as Guzzle;

use MongoDB\Collection;
use MongoDB\Client;

use RuntimeException;
use Throwable;

/**
* Class HttpClient
* @package App\Service\Stream
*/
class HttpClient implements HttpClientInterface
{
    use ExtendsTrait;

    /** @var Collection */
    protected Collection $appkeys;

    /** @var Guzzle */
    public Guzzle $http;

    /** @var string */
    public string $url;

    public function __construct(Guzzle $http, Client $mongo)
    {
        /** @noinspection PhpUndefinedFieldInspection */
        $this->appkeys = $mongo->app->appkeys;
        $this->http = $http;

        $k = $this->appkeys->findOne([], self::MAP)['stream_key'] ?? $this->key();
        $this->url = sprintf('%s?key=%s', self::STREAM_URL, $k);
    }

    private function filter(array $set, array $exclude): array
    {
        return array_filter($set, static fn($item) => !in_array($item, $exclude, false));
    }

    private function checkResponse(array $ret): bool
    {
        if (!$ret) {
            return false;
        }
        if ($ret['code'] !== self::ERROR_CODE) {
            return true;
        }
        if ($ret['error']['error_code'] === 1004) {
            $this->url = sprintf('%s?key=%s', self::STREAM_URL, $this->key());
        }

        return false;
    }

    public function getServerUrl(): ?array
    {
        $token = $this->appkeys->findOne([], self::MAP)['service_token'];
        $query = ['access_token' => $token, 'v' => self::API_VERSION];
        $url = self::SERVER_URL;

        $response = [];

        try {

            $response = $this->http->request('GET', $url, compact('query'));
            $response = $response->getBody()->getContents();
            $response = json_decode($response, true, 512, JSON_THROW_ON_ERROR);

        } catch (Throwable $e) {
        }

        return $response['response'] ?? null;
    }

    public function key(): string
    {
        if (!($server = $this->getServerUrl()) || !isset($server['key'])) {
            throw new RuntimeException('Error getting the server url');
        }

        $set = ['$set' => ['stream_key' => $server['key']]];
        $this->appkeys->updateOne([], $set, ['upsert' => true]);

        return $server['key'];
    }

    public function request(string $method, array $data = [], bool $check = false): array
    {
        $response = [];

        try {

            $response = $this->http->request($method, $this->url, $data);
            $response = $response->getBody()->getContents();
            $response = json_decode($response, true, 512, JSON_THROW_ON_ERROR);

            if (!$check && !$this->checkResponse($response)) {
                return $this->request($method, $data, true);
            }

        } catch (Throwable $e) {
        }

        return $response;
    }

    public function get(array $exclude = []): array
    {
        $rules = $this->request('GET')['rules'] ?? [];
        $rules = array_column($rules, 'value', 'tag');

        return $exclude
            ? $this->filter($rules, $exclude)
            : $rules;
    }

    public function add(PackageInterface $set): bool
    {
        foreach ($set->addRequest() as $json) {
            $r = $this->request('POST', compact('json'));

            if ($r['code'] !== self::SUCCESS_CODE) {
                return false;
            }
        }

        return true;
    }

    public function del(PackageInterface $set): bool
    {
        foreach ($set->delRequest() as $json) {
            $r = $this->request('DELETE', compact('json'));

            if ($r['code'] !== self::SUCCESS_CODE) {
                return false;
            }
        }

        return true;
    }

    public function clear(): bool
    {
        if ($rules = $this->get()) {
            foreach ($this->remove($rules) as $json) {
                $r = $this->request('DELETE', compact('json'));

                if ($r['code'] !== self::SUCCESS_CODE) {
                    return false;
                }
            }
        }

        return true;
    }
}
