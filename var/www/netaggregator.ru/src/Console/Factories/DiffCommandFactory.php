<?php

declare(strict_types=1);

namespace Console\Factories;

use Psr\Container\ContainerInterface;

use Doctrine\DBAL\Migrations\Tools\Console\Command\DiffCommand;
use Doctrine\DBAL\Migrations\Provider\OrmSchemaProvider;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Class DiffCommandFactory
 * @package Console\Factories
 */
class DiffCommandFactory
{
    public function __invoke(ContainerInterface $c): DiffCommand
    {
        $em = $c->get(EntityManagerInterface::class);
        $provider = new OrmSchemaProvider($em);

        return new DiffCommand($provider);
    }
}
