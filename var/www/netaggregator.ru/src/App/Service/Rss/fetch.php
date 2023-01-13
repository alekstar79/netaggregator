<?php /** @noinspection PhpIncludeInspection */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Rss/fetch.php
# php /var/www/netaggregator.ru/src/App/Service/Rss/fetch.php

declare(strict_types=1);

namespace App\Service\Rss;

use Psr\Container\ContainerInterface;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/**
 * @var ContainerInterface $c
 */
$c = require('config/container.php');

$c->get(PieClientInterface::class)
    ->fetch();
