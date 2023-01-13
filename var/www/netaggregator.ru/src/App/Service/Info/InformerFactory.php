<?php declare(strict_types=1);

namespace App\Service\Info;

use Psr\Container\ContainerInterface;

use App\VkApi\TransportInterface;

use MongoDB\Client;

/**
* Class InformerFactory
* @package App\Service\Info
*/
class InformerFactory
{
    /**
    * @param Client $mongo
    * @param TransportInterface $vk
    * @return InformerInterface
    */
    public static function create(Client $mongo, TransportInterface $vk): InformerInterface
    {
        return new Informer($mongo, $vk);
    }

    /**
    * @param ContainerInterface $c
    * @return InformerInterface
    */
    public function __invoke(ContainerInterface $c): InformerInterface
    {
        return self::create($c->get(Client::class), $c->get(TransportInterface::class));
    }
}
