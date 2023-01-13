<?php /** @noinspection PhpIncludeInspection */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Stream/server.php
# php /var/www/netaggregator.ru/src/App/Service/Stream/server.php

declare(strict_types=1);

namespace App\Service\Stream;

use Psr\Container\ContainerInterface;

use Symfony\Component\Routing\Matcher\UrlMatcher;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\Route;

use React\EventLoop\LoopInterface;
use React\EventLoop\Loop;
use React\Socket\SocketServer;
// use React\EventLoop\Factory;
// use React\Socket\Server;

use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\MessageComponentInterface;
use Ratchet\Http\HttpServerInterface;
use Ratchet\Http\OriginCheck;
use Ratchet\Http\HttpServer;
use Ratchet\Http\Router;

use React\Socket\Connector as SocketConnector;
use Ratchet\Client\Connector as ClientConnector;

use MongoDB\Client;

use App\Model\StreamRepositoryInterface;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/** @var ContainerInterface $c */
$c = require 'config/container.php';

function connector(LoopInterface $loop, array $options): ClientConnector
{
    return new ClientConnector($loop, new SocketConnector($loop, $options));
}

function wrap(MessageComponentInterface $app): HttpServerInterface
{
    return new OriginCheck(new WsServer($app), ['netaggregator.ru']);
}

$tls = [
    'local_cert'  => __DIR__ . '/cert.pem',
    'verify_peer' => false
];

// $loop = Factory::create();
$loop = Loop::get();

// APPLICATION
$stream = new Retranslator(
    $c->get(HttpClientInterface::class),
    $c->get(StreamRepositoryInterface::class),
    $c->get(Client::class),
    $loop
);

$loop->addPeriodicTimer(Retranslator::TIMER, [$stream, 'refresh']);

// ROUTING
$routes = new RouteCollection();
$route = new Route('/stream/{id}', ['_controller' => wrap($stream)]);
$routes->add('stream', $route->setRequirements(['id' => '\\d+']));

// ASSEMBLY
$router = new Router(new UrlMatcher($routes, new RequestContext()));
// $socket = new Server('tls://0.0.0.0:4433', $loop, compact('tls'));
$socket = new SocketServer('tls://0.0.0.0:4433', compact('tls'), $loop);

new IoServer(new HttpServer($router), $socket);

$loop->run();
