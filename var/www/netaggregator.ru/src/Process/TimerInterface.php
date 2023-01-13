<?php

declare(strict_types=1);

namespace Process;


/**
 * Interface TimerInterface
 * @package Process
 */
interface TimerInterface
{
    public function start(): self;

    public function stop(): self;

    public function tick(): void;
}
