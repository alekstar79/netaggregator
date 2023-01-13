<?php
/**
* @noinspection PhpUnhandledExceptionInspection
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpIncludeInspection
*/

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Weather/yandex.php
# php /var/www/netaggregator.ru/src/App/Service/Weather/yandex.php

declare(strict_types=1);

namespace App\Service\Weather;

// use MongoDB\{ Client as Mongo };
use GuzzleHttp\Client as Guzzle;
use GuzzleHttp\Cookie\CookieJar;
use App\Model\JsonRepo;
use Throwable;

chdir($root = dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

// $map = ['typeMap' => ['root' => 'array', 'document' => 'array'], 'projection' => ['_id' => 0]];
$flag = JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE;
$link = 'https://suggest-maps.yandex.ru/suggest-geo';
$path = realpath($root . '/nuxt/assets/cities');

$cities = [];
$agents = [];

try {

    $agents = JsonRepo::init(realpath($root . '/nuxt/utils/ua'))->read('user-agents');
    $cities = JsonRepo::init($path)->read('translit');

} catch (Throwable $e) {
    echo $e->getMessage(), "\n";
}

$agents = array_column($agents, 'userAgent') ?: require __DIR__ . '/user-agents.php';
$cookies = new CookieJar();
$guzzle = new Guzzle();

/**
 * @throws Throwable
 */
$request = static function(string $part) use($guzzle, $link, $agents, $cookies): string
{
    $ret = $guzzle->request('GET', $link, [
        'cookies' => $cookies,
        'headers' => [
            'User-Agent' => $agents[random_int(0, count($agents) - 1)],
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Encoding' => 'gzip, deflate, br',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive'
        ],
        'query' => [
            'v' => 9,
            'n' => 20,
            'lang' => 'ru_RU',
            'search_type' => 'tune',
            'll' => '37.622505,55.753216',
            'spn' => '0.5,0.5',
            'part' => $part
        ]
    ]);

    return $ret->getBody()->getContents();
};

echo 'Regions ' . count($cities), "\n";

$results = [];
foreach ($cities as $i => $city) {
    echo $i . "\tID {$city['id']} " . $city['title'] . (isset($city['region']) ? ' - ' . $city['region'] : ''), "\n";

    try {

        if ($json = $request($city['title'])) {
            $dump = json_decode($json, true, 512, JSON_THROW_ON_ERROR)['results'];
            $dump = array_filter($dump, static fn($c): bool => $c['title'] === $city['title'] && preg_match('/Россия/u', $c['subtitle']));

            if (isset($dump[0])) {
                $c = $dump[0];
                $results[] = ['id' => $city['id'],'title' => $c['title'],'translit' => $city['translit'],'subtitle' => $c['subtitle'],'pos' => $c['pos'],'geoid' => $c['geoid']];
            }
        }

    } catch (Throwable $e) {
        echo $e->getMessage(), "\n";
    }

    sleep(2);
}

if ($yg = file_put_contents("$path/ya-geo.json", json_encode($results, JSON_THROW_ON_ERROR|$flag))) {
    echo "The JSON file was recorded successfully, $yg bytes\n";
}
