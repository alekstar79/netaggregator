<?php

declare(strict_types=1);

namespace Process;

/**
 * Interface IMPDaemon
 * @package Process
 */
interface IMPDaemon
{
    public const

        CONSUMER_ERROR = 'Undefined or non-executable worker',

        LOCKING_ERROR = 'Error opening or locking pid file',
        SIGNALS_ERROR = 'Installing signal handler error',

        FORK_ERROR = -1,
        FORK_CHILD = 0;

    public static function create(int $size, string $file): self;

    public function setTimer(int $timeout, callable $fn, ...$args): void;

    public function setDestroyer(callable $fn): void;

    public function setWorker(callable $fn): void;

    public function start(ProducerInterface $producer): void;

    public function run(array $data): void;

    public function fork($set): bool;
}
