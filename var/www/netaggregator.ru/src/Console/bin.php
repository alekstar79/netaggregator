<?php

/**
* @noinspection PhpInternalEntityUsedInspection
* @noinspection PhpUnhandledExceptionInspection
* @noinspection PhpIncludeInspection
*/

declare(strict_types=1);

namespace Console;

use Psr\Container\ContainerInterface;

use Doctrine\DBAL\Migrations\Tools\Console\Helper\ConfigurationHelper;
use Doctrine\DBAL\Migrations\Configuration\Configuration;
use Doctrine\ORM\Tools\Console\Helper\EntityManagerHelper;
use Doctrine\ORM\Tools\Console\ConsoleRunner;
use Doctrine\ORM\EntityManagerInterface;

use Symfony\Component\Console\Application;

chdir(dirname(__DIR__, 2));

require_once 'vendor/autoload.php';

/** @var ContainerInterface $c */
$c = require 'config/container.php';

$commands = $c->get('config')['console']['commands'];
$cli = new Application('Netaggregator CLI');

/** @var EntityManagerInterface $em */
$em = $c->get(EntityManagerInterface::class);
$connection = $em->getConnection();

$configuration = new Configuration($connection);

$configuration->setMigrationsDirectory('src/Db/Migrations');
$configuration->setMigrationsNamespace('Db\Migrations');

$cli->getHelperSet()->set(new EntityManagerHelper($em), 'em');
$cli->getHelperSet()->set(new ConfigurationHelper($connection, $configuration), 'configuration');

ConsoleRunner::addCommands($cli);

if (is_array($commands)) {
    foreach ($commands as $command) {
        $cli->add($c->get($command));
    }
}

$cli->run();
