<?php /** @noinspection PhpIncludeInspection */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Info/update.php
# php /var/www/netaggregator.ru/src/App/Service/Info/update.php

declare(strict_types=1);

namespace App\Service\Info;

use Psr\Container\ContainerInterface;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/**
* @var ContainerInterface $c
* @var InformerInterface $informer
*/
$c = require('config/container.php');

$c->get(InformerInterface::class)
    ->fetch();
