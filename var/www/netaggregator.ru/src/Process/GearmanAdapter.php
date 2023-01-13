<?php

declare(strict_types=1);

namespace Process;

use GearmanWorker;
use GearmanJob;

use RuntimeException;

/**
 * Class GearmanAdapter (non-blocking)
 * @package Process
 */
class GearmanAdapter implements ProducerInterface
{
    /** @var GearmanWorker */
    private GearmanWorker $gearman;

    /** @var int */
    private int $timeout;

    public function __construct(GearmanWorker $gearman, int $timeout)
    {
        $gearman->addOptions(GEARMAN_WORKER_NON_BLOCKING);
        $gearman->setTimeout($timeout);

        if (!$gearman->addServer()) {
            throw new RuntimeException($gearman->error());
        }

        $this->gearman = $gearman;
        $this->timeout = $timeout;
    }

    private function idle(): bool
    {
        switch ($this->gearman->returnCode()) {
            case GEARMAN_IO_WAIT:
            case GEARMAN_NO_JOBS:
            case GEARMAN_TIMEOUT:
                return true;
        }

        return false;
    }

    private function stand(): bool
    {
        switch ($this->gearman->returnCode()) {
            case GEARMAN_NO_ACTIVE_FDS:
            case GEARMAN_TIMEOUT:
                usleep($this->timeout);
                return true;
        }

        return false;
    }

    private function state(): bool
    {
        $code = $this->gearman->returnCode();

        if ($code !== GEARMAN_SUCCESS && !@$this->gearman->wait()) {
            return $this->stand();
        }

        return true;
    }

    private function executor(callable $fn): callable
    {
        return static function(GearmanJob $job) use ($fn) {
            return $fn(json_decode($job->workload(), true, 512, JSON_THROW_ON_ERROR));
        };
    }

    public function consumer(callable $fn, string $name = 'exec'): ProducerInterface
    {
        if (!$this->gearman->addFunction($name, $this->executor($fn))) {
            throw new RuntimeException($this->gearman->error());
        }

        return $this;
    }

    public function error(): string
    {
        return $this->gearman->error();
    }

    public function work(): bool
    {
        if ($this->gearman->work() || $this->idle()) {
            return $this->state();
        }

        return false;
    }

    public static function create(int $timeout = self::TIMEOUT): self
    {
        return new self(new GearmanWorker(), $timeout);
    }
}
