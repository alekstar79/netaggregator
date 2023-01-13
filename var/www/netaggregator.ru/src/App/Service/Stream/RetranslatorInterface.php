<?php declare(strict_types=1);

namespace App\Service\Stream;

use Ratchet\RFC6455\Messaging\MessageInterface;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Client\WebSocket;

use Exception;

/**
* Interface RetranslatorInterface
* @package App\Service\Stream
*/
interface RetranslatorInterface extends MessageComponentInterface
{
    /** @var array */
    public const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var string */
    public const ADDR = 'wss://streaming.vk.com/stream';

    // public const ADDR = 'wss://streaming.vk.com:443/stream';

    /** @var int */
    public const TIMER = 10;

    /** @var int */
    public const SLICE = 43200;

    /** @var int */
    public const CLEAN = 43200;

    public function connect(): void;

    public function refresh(): void;

    public function clientConnect(WebSocket $conn): void;

    public function handle(MessageInterface $msg): void;

    public function slice(): void;

    public function onOpen(ConnectionInterface $conn): void;

    public function onMessage(ConnectionInterface $from, $msg): void;

    public function onClose(ConnectionInterface $conn): void;

    public function onError(ConnectionInterface $conn, Exception $e): void;

    public function clientError(Exception $e): void;
}
