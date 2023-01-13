<?php /** @noinspection PhpIncludeInspection */

# php /var/www/oraclecloud/var/www/netaggregator.ru/src/App/Service/Weather/server.php
# php /var/www/netaggregator.ru/src/App/Service/Weather/server.php

declare(strict_types=1);

namespace App\Service\Weather;

use Psr\Container\ContainerInterface;
// use React\EventLoop\Factory;
// use React\EventLoop\Loop;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/**
* @var ContainerInterface $c
* @var Receiver2 $weather
*/
$c = require 'config/container.php';

$weather = $c->get(ReceiverInterface::class);
// $loop = Factory::create();
// $loop = Loop::get();

// $loop->addPeriodicTimer(Receiver::TIMER, [$weather, 'fetch']);
$weather->fetch();
// $loop->run();
