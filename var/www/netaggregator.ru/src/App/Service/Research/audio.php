<?php # php /var/www/netaggregator.ru/src/App/Service/Research/audio.php

# https://zhyk.ru/forum/showthread.php?t=876375
# https://github.com/vodka2/vk-audio-token

declare(strict_types=1);

namespace App\Service\Research;

chdir(dirname(__DIR__, 4));

/** @noinspection PhpIncludeInspection */
require_once 'vendor/autoload.php';

// credentials: alekstar79@yandex.ru iPhone14s64gb
// 973dd9b1541f334f66c49b782d65b1296bcb11c1353917fd9a44e5a3834099e4bea11f9d5c6bd0fb7d1fb
// 6495f6c2f4795bf2ffbb9fbc0de5f103463f5918e7d65c9531bd7c9fb3881e7bcba6bfcd409f6e39d6929

$audio = new Audio([
    'token' => '468fd2acec2213c6fcc040130a9814b1752669843e3df2bf007f259d5fe6c4817893f2a663c01da04c3b2',
    'api_id' => 25520481,
    'v' => '5.131'
]);

$needAudio = $audio->get()['response']['items'][0];
$link = $audio->getMp3Link($needAudio);

/** @noinspection ForgottenDebugOutputInspection */
var_dump($needAudio, $link);
