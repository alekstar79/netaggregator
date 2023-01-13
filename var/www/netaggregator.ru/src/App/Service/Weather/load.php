<?php
/**
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpUndefinedFieldInspection
* @noinspection PhpUnusedAliasInspection
*/

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Weather/load.php
# php /var/www/netaggregator.ru/src/App/Service/Weather/load.php

declare(strict_types=1);

namespace App\Service\Weather;

use MongoDB\{ Client as Mongo, BSON\Regex };
use App\Model\JsonRepo;
use Throwable;

chdir(dirname(__DIR__, 4));

/** @noinspection PhpIncludeInspection */
require_once 'vendor/autoload.php';

$map = ['typeMap' => ['root' => 'array', 'document' => 'array'], 'projection' => ['_id' => 0]];
$params = ['q' => 'Ulya'];
// $list = [];

/* try {

    $repo = JsonRepo::init(realpath(__DIR__ . '/json'));
    $list = $repo->read('city-list-full');

} catch (Throwable $e) {
}

if (count($list)) {
    $mongo = new Mongo();

    $mongo->app->weathermap->deleteMany([]);
    $rec = $mongo->app->weathermap->insertMany($list)->getInsertedCount();

    echo "Save to db $rec records\n\n";
} */

$mongo = new Mongo();
$regex = new Regex("^{$params['q']}", 'i');

$ret = $mongo->app->weathermap->find(['name' => $regex], $map)->toArray();

var_dump($regex->getPattern(), (string) $regex, $ret);
