<?php
/**
* @noinspection PhpUnreachableStatementInspection
* @noinspection PhpUnhandledExceptionInspection
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpUndefinedFieldInspection
*/

# php /var/www/netaggregator.ru/src/App/Service/TrafficJams/filter.php

declare(strict_types=1);

namespace App\Service\TrafficJams;

use MongoDB\Client;

chdir($root = dirname(__DIR__, 4));

/** @noinspection PhpIncludeInspection */
require_once 'vendor/autoload.php';

$pfile = __DIR__ . '/filter-codes.php';
$jfile = $root . '/nuxt/assets/cities/traffic.json';
$typeMap = ['root' => 'array', 'document' => 'array'];
$projection = ['_id' => 0];

$mongo = new Client();
$lines = array_map(
    static fn($c) => (['code' => $c['code'], 'city' => $c['city']]),
    $mongo->app->traffic->find([], compact('typeMap','projection'))->toArray()
);

if ($pb = file_put_contents($pfile, "<?php declare(strict_types=1);\n\nreturn " . var_export($lines, true) . ";\n")) {
    echo "The PHP file was recorded successfully, $pb bytes\n";
}

if ($jb = file_put_contents($jfile, json_encode($lines, JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE))) {
    echo "The JSON file was recorded successfully, $jb bytes\n";
}
