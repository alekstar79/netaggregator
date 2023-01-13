<?php /** @noinspection PhpIncludeInspection */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/server.php
# php /var/www/netaggregator.ru/src/App/Service/server.php

declare(strict_types=1);

namespace App\Service;

use Psr\Container\ContainerInterface;

use Symfony\Component\Routing\Matcher\UrlMatcher;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\Route;

use React\Socket\SocketServer;
use React\EventLoop\LoopInterface;
use React\EventLoop\Loop;

use Ratchet\MessageComponentInterface;
use Ratchet\Http\HttpServerInterface;
use Ratchet\WebSocket\WsServer;
use Ratchet\Server\IoServer;
use Ratchet\Http\OriginCheck;
use Ratchet\Http\HttpServer;
use Ratchet\Http\Router;

use MongoDB\Client;
use Throwable;

use App\Model\StreamRepositoryInterface;
use App\Service\Weather\ReceiverInterface;
use App\Service\Currency\CurrencyRate;
use App\Service\TrafficJams\Yatraffic;
use App\Service\Stream\Retranslator;
use App\Service\Chat\MailingManager;
use App\Service\Rss\PieClient;

chdir($root = dirname(__DIR__, 3));

require_once 'vendor/autoload.php';

/**
* @var ContainerInterface $c
* @var Client $mongodb
*/
$c = require 'config/container.php';

$mongodb = $c->get(Client::class);
$count = 0;

// gc_enable();
function pid(int $port = 8443): ?int
{
    $out = [];

    exec("fuser $port/tcp 2> /dev/null", $out);

    if (isset($out[0])) {
        return (int) trim($out[0]);
    }

    return null;
}

function wrap(MessageComponentInterface $app, LoopInterface $loop = null): HttpServerInterface
{
    $domain = ['netaggregator.ru'];
    $server = new WsServer($app);

    $loop && $server->enableKeepAlive($loop);

    return new OriginCheck($server, $domain);
}

function listen(HttpServerInterface $router, LoopInterface $loop): ?IoServer
{
    $uri = 'tls://0.0.0.0:8443';
    $tls = ['local_cert'  => __DIR__ . '/Stream/cert.pem', 'verify_peer' => false];
    $srv = null;

    set_error_handler(static fn(): bool => true);

    try {

        $srv = new IoServer(
            new HttpServer($router),
            new SocketServer($uri, compact('tls'), $loop)
        );

        echo "LISTEN ON 0.0.0.0:8443\n";

    } catch (Throwable $e) {
        echo "\nERROR: {$e->getMessage()}\n";
    }

    restore_error_handler();

    return $srv;
}

function createApp(RouteCollection $routes, LoopInterface $loop, int &$count): bool
{
    $router = new Router(new UrlMatcher($routes, new RequestContext()));

    if (listen($router, $loop)) {
        return true;
    }
    if (++$count > 3) {
        exit(0);
    }

    sleep(10);

    return false;
}

do {

    if (($pid = pid()) !== null) {
        posix_kill($pid, SIGKILL);
    }

    $loop = Loop::get();

    // APPLICATIONS
    $mailing = new MailingManager($mongodb);
    $xstream = new Retranslator(
        $c->get(Stream\HttpClientInterface::class),
        $c->get(StreamRepositoryInterface::class),
        $mongodb,
        $loop
    );

    // ROUTING
    $routes = new RouteCollection();
    $mRoute = new Route('/mailing/{id}', ['_controller' => wrap($mailing, $loop)]);
    $sRoute = new Route('/stream/{id}',  ['_controller' => wrap($xstream, $loop)]);

    $routes->add('mailing', $mRoute->setRequirements(['id' => '\\d+']));
    $routes->add('xstream', $sRoute->setRequirements(['id' => '\\d+']));

    // $loop->addPeriodicTimer(120, 'gc_collect_cycles');
    // $loop->addTimer((time() % 86400), static fn(): void => exit());

    $loop->addPeriodicTimer(MailingManager::TIMER, [$mailing, 'listen']);
    $loop->addPeriodicTimer(Retranslator::TIMER, [$xstream, 'refresh']);
    $loop->addPeriodicTimer(Retranslator::SLICE, [$xstream, 'slice']);

    $loop->addPeriodicTimer(Retranslator::CLEAN, $clean = static function() use($root) {
        exec("nohup php $root/src/App/Service/Stream/clean.php > /dev/null 2>&1 &");
    });

    // exec("nohup $root/nuxt/server/weather-update.mjs > /dev/null 2>&1 &");
    $loop->addPeriodicTimer(ReceiverInterface::TIMER, $fetch = static function() use($root) {
        exec("nohup php $root/src/App/Service/Weather/ya-fetch.php > /dev/null 2>&1 &");
    });

    $loop->addPeriodicTimer(CurrencyRate::TIMER, $load = static function() use($root) {
        exec("nohup php $root/src/App/Service/Currency/load.php > /dev/null 2>&1 &");
    });

    $loop->addPeriodicTimer(Yatraffic::TIMER, $traffic = static function() use($root) {
        exec("nohup php $root/src/App/Service/TrafficJams/load.php > /dev/null 2>&1 &");
    });

    $loop->addPeriodicTimer(PieClient::TIMER, $rss = static function() use($root) {
        exec("nohup php $root/src/App/Service/Rss/fetch.php > /dev/null 2>&1 &");
    });

    $loop->addPeriodicTimer(/* every 3 hours */10800, $clear = static function() {
        exec('find ~/.pm2/logs/ -type f -name \'*.log\' -exec sh -c \'> "$1"\' _ {} \;');
    });

    $loop->addPeriodicTimer(300, static function() use($mongodb) {
        $mongodb->app->events->deleteMany([]);
    });

    // $loop->addSignal(SIGTERM, [$loop, 'stop']);
    // $loop->addSignal(SIGINT, [$loop, 'stop']);

} while (!createApp($routes, $loop, $count));

$clear();
$clean();

$traffic();
$fetch();
$load();
$rss();

$loop->run();
