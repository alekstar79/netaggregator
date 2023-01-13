<?php /** @noinspection PhpIncludeInspection */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Rss/update.php
# php /var/www/netaggregator.ru/src/App/Service/Rss/update.php

declare(strict_types=1);

namespace App\Service\Rss;

use Psr\Container\ContainerInterface;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/**
* @var ContainerInterface $c
*/
$c = require('config/container.php');

/** @var array $argv */
array_shift($argv);

if ($data = base64_decode(implode($argv))) {
    /** @noinspection JsonEncodingApiUsageInspection */
    $c->get(PieClientInterface::class)->update(json_decode($data, true));
}

// $c->get(PieClientInterface::class)->update([141729661]);
