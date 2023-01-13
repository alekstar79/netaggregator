<?php /** @noinspection PhpIncludeInspection */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Birthday/server.php
# php /var/www/netaggregator.ru/src/App/Service/Birthday/server.php

declare(strict_types=1);

namespace App\Service\Birthday;

use Psr\Container\ContainerInterface;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/**
* @var ContainerInterface $c
*/
$c = require('config/container.php');

$c->get(BirthdaysCollectorInterface::class)
    ->run();
