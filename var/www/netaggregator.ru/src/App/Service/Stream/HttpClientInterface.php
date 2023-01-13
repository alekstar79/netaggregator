<?php declare(strict_types=1);

namespace App\Service\Stream;

use GuzzleHttp\ClientInterface;

/**
* Interface ManagerInterface
* @package App\Service\Stream
* @property ClientInterface http
*/
interface HttpClientInterface
{
    public const

        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        SERVER_URL = 'https://api.vk.com/method/streaming.getServerUrl',
        STREAM_URL = 'https://streaming.vk.com/rules',
        API_VERSION = '5.131',

        SUCCESS_CODE = 200,
     // SERVICE_CODE = 300,
        ERROR_CODE   = 400;

    public function getServerUrl(): ?array;

    public function key(): string;

    public function request(string $method, array $data = [], bool $check = false): ?array;

    public function get(array $exclude = []): array;

    public function add(PackageInterface $set): bool;

    public function del(PackageInterface $set): bool;

    public function clear(): bool;
}
