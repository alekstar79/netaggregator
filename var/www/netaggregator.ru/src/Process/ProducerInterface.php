<?php

declare(strict_types=1);

namespace Process;

/**
 * Interface WorkerInterface
 * @package Process
 */
interface ProducerInterface
{
    public const TIMEOUT = 1000;

    public function consumer(callable $fn, string $name = 'exec'): self;

    public function error(): ?string;

    public function work(): bool;
}
