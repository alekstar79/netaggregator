<?php /** @noinspection PhpIncludeInspection */

# php /var/www/netaggregator.ru/src/App/Service/Stream/clean.php

declare(strict_types=1);

namespace App\Service\Stream;

use Psr\Container\ContainerInterface;

use App\Model\StreamRepositoryInterface;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/** @var ContainerInterface $c */
$c = require 'config/container.php';

/** @var StreamRepositoryInterface $repo */
$repo = $c->get(StreamRepositoryInterface::class);

/** @var HttpClientInterface $client */
$client = $c->get(HttpClientInterface::class);

// If the vk client has tags that are missing from the db, delete them
$onvk = $client->get();
$ondb = array_merge(...array_values(array_map(static function($item) {
    return array_column($item['tags'], 'mark', 'tag');
}, $repo->all())));

$pack = new Package();
$pack->setDelPack(
    array_diff_key($onvk, $ondb)
);

$client->del($pack);

/* var_dump(
    array_diff($onvk, $ondb),
    array_diff($ondb, $onvk)
); */
