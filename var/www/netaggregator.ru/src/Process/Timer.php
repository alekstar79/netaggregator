<?php

declare(strict_types=1);

namespace Process;

/**
 * Class Timer (based on low-level tickable statements)
 * @see https://www.freedev.world/post/php/procces-progress
 * @package Process
 */
class Timer implements TimerInterface
{
    /** @var ?int */
    private ?int $lastRun;

    /** @var int */
    private int $timeout;

    /** @var callable */
    private $handler;

    /** @var array */
    private array $params;

    public function __construct(int $timeout, callable $handler, ...$args)
    {
        $this->timeout = $timeout;
        $this->handler = $handler;

        $this->params = $args;
        $this->lastRun = null;
    }

    public function start(): TimerInterface
    {
        if (!$this->lastRun) {
            $this->lastRun = time();
            register_tick_function([$this, 'tick']);
        }

        return $this;
    }

    public function stop(): TimerInterface
    {
        if ($this->lastRun) {
            unregister_tick_function([$this, 'tick']);
            $this->lastRun = null;
        }

        return $this;
    }

    public function tick(): void
    {
        $time = time();

        if ($time - $this->lastRun >= $this->timeout) {
            call_user_func_array($this->handler, $this->params);
            $this->lastRun = $time;
        }
    }

    public static function create(int $timeout, callable $handler, ...$args): TimerInterface
    {
        return (new self($timeout, $handler, ...$args))->start();
    }
}
