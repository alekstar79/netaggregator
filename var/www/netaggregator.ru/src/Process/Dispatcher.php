<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Process;

/**
 * Class Dispatcher
 * @package Process
 */
class Dispatcher
{
    /** @var array[] */
    private array $handlers = [];

    /** @var bool[] */
    private array $dispatch = [];

    protected function addHandler(int $sig, callable $handler, bool $add = true): void
    {
        if (empty($this->handlers[$sig])) {
            $this->dispatch[$sig] = false;
            pcntl_signal($sig, [$this, 'handler']);
        }

        if ($add) {
            $this->handlers[$sig][] = $handler;
        } else {
            $this->handlers[$sig] = [$handler];
        }
    }

    protected function dispatch(): void
    {
        pcntl_signal_dispatch();

        foreach ($this->dispatch as $sig => $need) {
            if ($need) {
                $this->dispatch[$sig] = false;

                foreach ($this->handlers[$sig] as $fn) {
                    $fn($sig);
                }
            }
        }
    }

    protected function handler(int $sig): void
    {
        $this->dispatch[$sig] = true;
    }
}
