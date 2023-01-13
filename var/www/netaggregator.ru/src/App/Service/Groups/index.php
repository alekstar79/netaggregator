<?php # php /var/www/netaggregator.ru/src/App/Service/Groups/index.php
/**
* @noinspection PhpUnusedLocalVariableInspection
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpIncludeInspection
*/

declare(strict_types=1);

namespace App\Service\Groups;

use Psr\Container\ContainerInterface;

use MongoDB\Client;

use App\VkApi\TransportInterface;

chdir(dirname(__DIR__, 4));

require_once 'vendor/autoload.php';

/** @var ContainerInterface $c */
$c = require 'config/container.php';

// $std = 'a71e0759a36eb45758ef7cc64827aecdfc8255951e8d724a44b38e00ee7fd2f1bc6f4433966dae530916c';
$tok = 'aa48c37fdce7e2146438d8cf4453e2c122b61dfd1069a239a09764f4ae2dec1284a9bf9cb25506c38d6a0'; // 169905893 pts
$stk = '80e9ef5b7bf35889d1ffbecbf4a581359d39dd521b5601ecfcb4cab771454c6fa095b4f190a214a7b72cf'; // 141729661 stk

/** @var TransportInterface $http */
$http = $c->get(TransportInterface::class);

$http->setToken($stk);

$tuner = new CallbackApiTuner(new Client, $http);

$pts = 169905893; // Porn To Stack
$pos = 169906699; // Porn On Stack
$stk = 141729661; // SocialToolKit

// $srv = $tuner->getCallbackServers($pts, 23);
// $srv = $tuner->getCallbackSettings($pts, 23);
// $srv = $tuner->getCallbackConfirmationCode($pts);

/* $srv = $tuner->setCallbackSettings($pts, 23, [
    'api_version' => 5.131,
    'message_new' => 1,
    'message_allow' => 1,
    'like_add' => 1,
    'like_remove' => 1,
    'wall_reply_new' => 1,
    'wall_reply_delete' => 1,
    'group_join' => 1,
    'group_leave' => 1
]); */

/* $srv = $tuner->editCallbackServer($pts, 23, [
    'url' => 'https://netaggregator.ru/vk/events',
    'title' => 'Netaggregator',
    'secret_key' => null
]); */

// $srv = $tuner->deleteCallbackServer($pos, 11);

$srv = $tuner->configure($stk, [
    'api_version' => 5.131,
    'message_new' => 1,
    'message_allow' => 1,
    'like_add' => 1,
    'like_remove' => 1,
    'wall_reply_new' => 1,
    'wall_reply_delete' => 1,
    'wall_repost' => 1,
    'group_join' => 1,
    'group_leave' => 1
]);

$status = $tuner->status($stk, $srv['id']);

var_dump($srv, $status);
