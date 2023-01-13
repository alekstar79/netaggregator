<?php /** @noinspection PhpIncludeInspection */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Chat/builder.php
# php /var/www/netaggregator.ru/src/App/Service/Chat/builder.php

declare(strict_types=1);

namespace App\Service\Chat;

use Psr\Container\ContainerInterface;
use MongoDB\Client;

use Process\{ MPDaemon, GearmanAdapter };
use App\VkApi\APIClientInterface;

chdir(dirname(__DIR__, 4));

require 'vendor/autoload.php';

/** @var ContainerInterface $c */
$c = require 'config/container.php';

new RecipientsBuilder(
    $c->get(APIClientInterface::class),
    MPDaemon::create(8, __DIR__ . '/builder.pid'),
    GearmanAdapter::create(),
    new Client()
);
