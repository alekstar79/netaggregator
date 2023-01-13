<?php declare(strict_types=1);

namespace App\Service\Rss;

use Psr\Container\ContainerInterface;

use MongoDB\Client;
use SimplePie;

/**
* Class PieClientFactory
* @package App\Service\Rss
*/
class PieClientFactory
{
    /**
    * @param Client $mongo
    * @param SimplePie $pie
    * @return PieClientInterface
    */
    public static function create(Client $mongo, SimplePie $pie): PieClientInterface
    {
        return new PieClient($mongo, $pie);
    }

    /**
    * @param ContainerInterface $c
    * @return PieClientInterface
    */
    public function __invoke(ContainerInterface $c): PieClientInterface
    {
        return self::create($c->get(Client::class), $c->get(SimplePie::class));
    }
}
