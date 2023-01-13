<?php declare(strict_types=1);

namespace App\Service\Weather;

use Psr\Container\ContainerInterface;

use MongoDB\Client;

/**
* Class ReceiverFactory
* @package App\Service\Weather
*/
class ReceiverFactory
{
    public const APPID = 'a1a3bf27302747b33c4829a3f6e42b83';

    /**
     * @param Client $mongo
     * @return ReceiverInterface
     */
    public static function create(Client $mongo): ReceiverInterface
    {
        return new Receiver2(new OpenWeatherClient(self::APPID), $mongo);
    }

    /**
     * @param ContainerInterface $c
     * @return ReceiverInterface
     */
    public function __invoke(ContainerInterface $c): ReceiverInterface
    {
        return self::create($c->get(Client::class));
    }
}
