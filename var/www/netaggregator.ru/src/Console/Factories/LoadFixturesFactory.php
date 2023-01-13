<?php

declare(strict_types=1);

namespace Console\Factories;

use Psr\Container\ContainerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Console\Command\LoadFixtures;

/**
 * Class LoadFixturesFactory
 * @package Console\Factories
 */
class LoadFixturesFactory
{
    public function __invoke(ContainerInterface $c): LoadFixtures
    {
        return new LoadFixtures($c->get(EntityManagerInterface::class), 'src/Db/Fixtures');
    }
}
