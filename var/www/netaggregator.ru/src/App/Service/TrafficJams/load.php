<?php # php /var/www/netaggregator.ru/src/App/Service/TrafficJams/load.php
/**
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpUndefinedFieldInspection
*/

declare(strict_types=1);

namespace App\Service\TrafficJams;

use GuzzleHttp\Client as Guzzle;
use MongoDB\Client as Mongo;
use App\Model\JsonRepo;
use Throwable;

chdir($root = dirname(__DIR__, 4));

/** @noinspection PhpIncludeInspection */
require_once 'vendor/autoload.php';

$map = ['typeMap' => ['root' => 'array', 'document' => 'array'], 'projection' => ['_id' => 0]];
$list = [];

try {

    $repo = JsonRepo::init(realpath($root . '/nuxt/utils/ua'));
    $list = $repo->read('user-agents');

} catch (Throwable $e) {
}

$agents = array_column($list, 'userAgent') ?: require __DIR__ . '/user-agents.php';
$cities = require __DIR__ . '/filter-codes.php';
$yt = new Yatraffic(new Guzzle, $agents);

if (count($traffic = $yt->get($cities))) {
    $mongo = new Mongo();

    $old = $mongo->app->traffic->find([], $map)->toArray();

    $codes = array_column($traffic, 'code');
    $diff = array_filter($old, static function($c) use($codes) {
        return !in_array($c['code'], $codes, false);
    });

    $traffic = array_merge($traffic, $diff);
    $mongo->app->traffic->deleteMany([]);

    try {

        $mongo->app->traffic->insertMany($traffic); //->getInsertedCount();
        // echo "Save to db $rec records\n\n";

    } catch (Throwable $e) {
        $mongo->app->traffic->insertMany($old);
    }

    $mongo->app->dcover->updateMany(
        ['traffic' => ['$eq' => true, '$exists' => true]],
        ['$set' => ['changed' => true]]
    );
}
