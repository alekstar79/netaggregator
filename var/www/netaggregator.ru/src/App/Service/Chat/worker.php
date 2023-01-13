<?php declare(strict_types=1);

namespace App\Service\Chat;

use Throwable;

chdir(dirname(__DIR__, 4));

/** @noinspection PhpIncludeInspection */
require 'vendor/autoload.php';

$argv || ($argv = []);

array_shift($argv);

try {

    if ($data = base64_decode(implode($argv))) {
        Chatbot::create(
            json_decode($data, true, 512, JSON_THROW_ON_ERROR),
            [
                'keyboard' => include 'keyboard.php',
                'commands' => [
                    Chatbot::MUSIC => '#music',
                    Chatbot::PHOTO => '#photo',
                    Chatbot::SIGNA => '#signa',
                    Chatbot::VIDEO => '#video'
                ]
            ]
        )->perform();
    }

} catch (Throwable $e) {
}
