<?php

/**
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpUnusedAliasInspection
*/

# php /var/www/netaggregator.ru/src/App/Service/Currency/load.php

declare(strict_types=1);

namespace App\Service\Currency;

use React\EventLoop\Loop;
use MongoDB\Client;

chdir(dirname(__DIR__, 4));

/** @noinspection PhpIncludeInspection */
require_once 'vendor/autoload.php';

$rate = new CurrencyRate(new Client());
// $loop = Loop::get();

// $loop->addPeriodicTimer(CurrencyRate::TIMER, [$rate, 'load']);
$rate->update();
// $loop->run();

// var_dump($rate->convert('USD', 'RUB'));
