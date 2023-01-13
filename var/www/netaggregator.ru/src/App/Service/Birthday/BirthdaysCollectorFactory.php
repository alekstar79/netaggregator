<?php declare(strict_types=1);

namespace App\Service\Birthday;

use Psr\Container\ContainerInterface;

use App\VkApi\TransportInterface;

use MongoDB\Client;

/**
* Class BirthdaysCollectorFactory
* @package App\Service\Birthday
*/
class BirthdaysCollectorFactory
{
    /**
    * @param Client $mongo
    * @param TransportInterface $vk
    * @return BirthdaysCollectorInterface
    */
    public static function create(Client $mongo, TransportInterface $vk): BirthdaysCollectorInterface
    {
        return new BirthdaysCollector($mongo, $vk);
    }

    /**
    * @param ContainerInterface $c
    * @return BirthdaysCollectorInterface
    */
    public function __invoke(ContainerInterface $c): BirthdaysCollectorInterface
    {
        return self::create($c->get(Client::class), $c->get(TransportInterface::class));
    }
}
