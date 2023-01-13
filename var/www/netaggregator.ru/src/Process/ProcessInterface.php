<?php

declare(strict_types=1);

namespace Process;

/**
 * Interface ProcessInterface
 * @package Process
 */
interface ProcessInterface
{
    public static function create(string $cmd): self ;

    public function setHandler(callable $fn): void;

    public function execute(...$args): void;

    public function isTerminated(): bool;

    public function isRunning(): bool;

    public function set(string $prop, $value): self;

    public function get(string $prop);

    public function start(): bool;

    public function stop(): bool;
}
