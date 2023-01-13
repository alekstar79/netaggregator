<?php declare(strict_types=1);

namespace App\VkApi;

use GuzzleHttp\Promise\PromiseInterface;

/**
* Class Transport
* @package App\VkApi
*/
interface TransportInterface
{
    public const

        CLIENT = '5485665',
        SECRET = 'wbVlu4kcraAMQydytPko',

        OAUTH  = 'https://oauth.vk.com',
        API    = 'https://api.vk.com',
        VER    = '5.131';

    public function setToken(string $token): TransportInterface;

    public function hasToken(array $params): bool;

    public function setExtra(array $extra): void ;

    public function getServiceToken(): ?string;

    public function request(string $method, string $url, array $params = []): string;

    public function async(string $method, string $url, array $params = []): PromiseInterface;

    /**
     * @param PromiseInterface[] $promises
     * @return mixed
     */
    public function wait(array $promises);

    public function api(string $point, array $params = [], string $method = 'GET');

    public function asyncApi(string $point, array $params = [], string $method = 'GET');
}
