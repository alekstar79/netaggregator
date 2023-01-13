<?php

declare(strict_types=1);

namespace Process;

/**
 * Class Producer
 * @package Process
 */
class Producer implements ProducerInterface
{
    /** @var array */
    private array $data;

    /** @var callable */
    private $handler;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function consumer(callable $fn, string $name = 'exec'): ProducerInterface
    {
        $this->handler = $fn;

        return $this;
    }

    public function error(): ?string
    {
        return null;
    }

    public function work(): bool
    {
        $set = array_pop($this->data);

        if ($set && $this->handler) {
            return call_user_func($this->handler, $set);
        }

        return false;
    }

    public static function create(array $data): self
    {
        return new self($data);
    }
}
