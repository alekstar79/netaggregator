<?php # php /var/www/netaggregator.ru/src/App/Service/Stream/manual.php

/**
* @noinspection PhpUnusedLocalVariableInspection
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpIncludeInspection
*/

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

// $tags = $client->get(['май','мир','труд','михаил']);
// $all = $client->get();

/* $package = new Package(['май','мир','труд']);
$package->generate(['{19}' => 'май', '{16}' => 'мир', '{18}' => 'труд', '{20}' => 'михаил'], $tags); */

// $package->generate($all, $tags);
// $package->reverse();

// var_dump($package->delRequest());
// var_dump($package->addRequest());

// var_dump($client->del($package));
// var_dump($client->get());


// restore
//$new = [];
// $raw = array_merge(...array_filter(array_column($repo->all(), 'tags')));
/* $map = array_map(static function($item) {
    return $item['mark'];
}, $raw); */
//
//foreach ($map as $k => $v) {
//    $new[trim((string) $k, '{}')] = $v;
//}
//
//ksort($new);
//$map = [];
//
//foreach ($new as $k => $v) {
//    $map['{'. $k .'}'] = $v;
//}

// $package->restore($map);
// var_dump($client->add($package));
// var_dump($client->get());

// If the vk client has tags that are missing from the db, delete them.
// $onvk = $client->get();
/* $ondb = array_merge(...array_values(array_map(static function($item) {
    return array_column($item['tags'], 'mark', 'tag');
}, $repo->all()))); */

// $pack = new Package();
/* $pack->setDelPack(
    array_diff_key($onvk, $ondb)
); */

// var_dump($client->del($pack));
/* var_dump(
    array_diff($onvk, $ondb),
    array_diff($ondb, $onvk)
); */

$time = time();
$today = $time % (3600 * 24);
$begin = $time - $today;

var_dump($repo->sliceLineChart());

/* var_dump($repo->updateLinesChart([
    '{14}' => 1,
    '{5}' => 3,
    '{16}' => 7,
    '{19}' => 5,
    '{21}' => 1
])); */

/* var_dump($repo->update(2985476, [
    'tags' => [
        "{6}" => ["mark" => "кот", "stat" => 5630717],
        "{7}" => ["mark" => "собака", "stat" => 8247779],
        "{8}" => ["mark" => "навальный", "stat" => 873731],
        "{9}" => ["mark" => "трамп", "stat" => 829598]
    ],
    'stop' => null,
    'query' => null
])); */

// var_dump($repo->remove(2985476));
// var_dump($repo->clear(2985476));
