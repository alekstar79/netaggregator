<?php
/**
* @noinspection ForgottenDebugOutputInspection
* @noinspection PhpIncludeInspection
*/

# php /var/www/cloudvps.loc/var/www/netaggregator.ru/src/App/Service/Research/chat.php
# php /var/www/netaggregator.ru/src/App/Service/Research/chat.php

declare(strict_types=1);

namespace App\Service\Research;

use Psr\Container\ContainerInterface;
use App\Handler\EventsHandler;

chdir(dirname(__DIR__, 4));

require 'vendor/autoload.php';

/** @var ContainerInterface $c */
$c = require 'config/container.php';

/** @var EventsHandler $handler */
$handler = $c->get(EventsHandler::class);

/* v5.85 old *//* $e = [
    "type" => "message_new",
    "object" => [
        "date" => 1630047756,
        "from_id" => 25520481,
        "id" => 3575,
        "out" => 0,
        "peer_id" => 25520481,
        "text" => "Photo",
        "conversation_message_id" => 1561,
        "fwd_messages" => [],
        "important" => false,
        "random_id" => 0,
        "attachments" => [],
        "payload" => "{\"cmd\":\"#photo\"}",
        "is_hidden" => false
    ],
    "group_id" => 169906699,
    "event_id" => "c5cfe7ed2892d9389032ffbe3d44b815aaef762f",
    "secret" => "9ef5e3995584a26a9f0eb81cbc41a3f85eae472d59820f06"
]; */

/* v5.131 fine work */$e = [
    "type" => "message_new",
    "object" => [
        "message" => [
            "date" => 1648021119,
            "from_id" => 466483621,
            "id" => 4112,
            "out" => 0,
            "attachments" => [],
            "conversation_message_id" => 485,
            "fwd_messages" => [],
            "important" => false,
            "is_hidden" => false,
            "payload" => "{\"cmd\":\"#video\"}",
            "peer_id" => 466483621,
            "random_id" => 0,
            "text" => "Video"
        ],
        "client_info" => [
            "button_actions" => [
                "text",
                "vkpay",
                "open_app",
                "location",
                "open_link",
                "callback",
                "intent_subscribe",
                "intent_unsubscribe"
            ],
            "keyboard" => true,
            "inline_keyboard" => true,
            "carousel" => true,
            "lang_id" => 0
        ]
    ],
    "group_id" => 169906699,
    "event_id" => "058c83b30ef93dcb3b39f2b343ab841a555290dc",
    "secret" => "9ef5e3995584a26a9f0eb81cbc41a3f85eae472d59820f06"
];

/* $e = [
    'type' => "like_add",
    'object' => [
        'liker_id' => 486939909,
        'object_type' => "post",
        'object_owner_id' => -147718403,
        'object_id' => 2,
        'thread_reply_id' => 0,
        'post_id' => 0
    ],
    'group_id' => 147718403,
    'event_id' => '422f6b18aeaad37e5757fa45e013f7f48e371dcf',
    'secret' => 'ed02e5e2bf1f88f8b419c001e0a4f27e6bbd091876b68a6b'
]; */

/* $e = [
    'type' => 'group_join',
    'object' => [
        'user_id' => 441887704,
        'join_type' => 'join'
    ],
    'group_id' => 169906699,
    'event_id' => '1861987fec23bae15306be7e9c896ff5d04e0d83'
]; */

/* $e = [
    "type" => "confirmation",
    "group_id" => 147718403,
    "event_id" => "",
    "secret" => "ed02e5e2bf1f88f8b419c001e0a4f27e6bbd091876b68a6b"
]; */

var_dump($handler->workflow($e));
