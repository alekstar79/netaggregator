<?php
/**
* @noinspection PhpUnusedLocalVariableInspection
* @noinspection PhpUnhandledExceptionInspection
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpUndefinedFieldInspection
* @noinspection PhpIncludeInspection
* @noinspection DuplicatedCode
*/

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Weather/ya-fetch.php
# php /var/www/netaggregator.ru/src/App/Service/Weather/ya-fetch.php

# see https://coding.dp.ua/php/660-prognoz-pogodyi-dlya-sayta-cherez-api-yandeksa.html
# see https://qna.habr.com/q/319075
# see https://pastebin.com/t0BKkPyQ
# see https://pastebin.com/WFxuNyNc

declare(strict_types=1);

namespace App\Service\Weather;

use MongoDB\{ BSON\ObjectId, Client };
use Throwable;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

function uniqByGeo(array $cities): array
{
    foreach ($cities as $i => $city) {
        for ($j = $i + 1, $c2 = count($cities); $j < $c2; ++$j) {
            if ($city['geoid'] === $cities[$j]['geoid']) {
                array_splice($cities, $j--, 1);
            }
        }
    }

    return $cities;
}

/** @var array $argv */
array_shift($argv);

$id = $argv[0] ?? null;
$api = 'https://api.weather.yandex.ru/v1/forecast';                  // API URL
// $img_dir = 'https://yastatic.net/weather/i/icons/islands/32/';    // Icon files (https://yastatic.net/weather/i/icons/islands/32/)
// $img_ext = 'svg';                                                 // Icon file extensions (svg/png)

$mongo = new Client();
$cities = uniqByGeo(array_filter(
    array_map(
        static fn($o) => $o['weather'],

        $mongo->app->xcover->find(
            $id ? ['_id' => new ObjectId($id)]
                : ['weather' => [
                        '$exists' => true, '$type' => 'object'],
                        'connections' => ['$exists' => true, '$not' => ['$size' => 0]
                  ]],
            [
                'typeMap' => ['root' => 'array', 'document' => 'array'],
                'projection' => ['_id' => 0]
            ]
        )->toArray()
    ),

    static fn($c) => isset($c['geoid'])
));

if (count($cities)) {
    $context = stream_context_create(['http' => ['method' => 'GET', 'header' => require 'ya-headers.php']]);
    $result = [];

    foreach ($cities as $city) { try {
        if ($file = @file_get_contents("$api?geoid={$city['geoid']}&lang=ru", false, $context)) {
            $result[] = array_merge(['city' => $city], YaWeather::parse(gzdecode($file)));
        }

    } catch (Throwable $e) {
    }}

    if (count($result)) {
        $old = $mongo->app->yandex->find([], ['typeMap' => ['root' => 'array', 'document' => 'array']])->toArray();
        $codes = array_map(static fn($o) => $o['city']['geoid'], $result);
        $diff = array_filter($old, static function($c) use($codes) {
            return !in_array($c['city']['geoid'], $codes, false);
        });

        $result = array_merge($result, $diff);
        $mongo->app->yandex->deleteMany([]);
        $rec = 0;

        try {

            $mongo->app->yandex->insertMany($result); //->getInsertedCount();

        } catch (Throwable $e) {
            $mongo->app->yandex->insertMany($old);
        }

        $mongo->app->yandex->createIndex(['city.title' => 'text'], ['default_language' => 'russian']);
        $mongo->app->dcover->updateMany(
            ['weather' => ['$exists' => true, '$ne' => false]],
            ['$set' => ['changed' => true]]
        )->isAcknowledged();
    }
}
