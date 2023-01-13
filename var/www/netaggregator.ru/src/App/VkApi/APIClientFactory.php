<?php declare(strict_types=1);

namespace App\VkApi;

use Psr\Container\ContainerInterface;

use App\Model\VkTokensRepository;

/**
* Class APIClientFactory
* @package App\VkApi
*/
class APIClientFactory
{
    public function __invoke(ContainerInterface $c): APIClient
    {
        return self::create(null, array_column($c->get(VkTokensRepository::class)->all(), 'access_token'));
    }

    public static function create(TransportInterface $http = null, array $tokens = []): APIClient
    {
        return new APIClient($http ?: TransportFactory::create(), $tokens);
    }
}
