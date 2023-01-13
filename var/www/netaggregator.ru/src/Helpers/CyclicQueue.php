<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

use LogicException;

/**
 * Class CyclicQueue (more precisely - stack)
 * @package Helpers
 */
class CyclicQueue
{
    /** @var array */
    private array $items;

    /** @var int */
    private int $position;

    public function __construct()
    {
        $this->clear();
    }

    private function fix(): self
    {
        $this->items = array_values($this->items);

        if ($this->items) {
            $this->position %= $this->getCount();
        } else {
            $this->position = 0;
        }

        return $this;
    }

    public function getCount(): int
    {
        return count($this->items);
    }

    public function isEmpty(): bool
    {
        return !$this->items;
    }

    public function next(): self
    {
        if (++$this->position >= $this->getCount()) {
            $this->position = 0;
        }

        return $this;
    }

    public function prev(): self
    {
        if (--$this->position < 0) {
            $this->position = $this->getCount();
        }

        return $this;
    }

    public function getData()
    {
        if (!$this->items) {
            throw new LogicException('The queue is empty');
        }

        return $this->items[$this->position];
    }

    public function setData($data): self
    {
        if (!$this->items) {
            throw new LogicException('The queue is empty');
        }

        $this->items[$this->position] = $data;

        return $this;
    }

    public function insert($data): self
    {
        array_splice($this->items, $this->position, 0, [$data]);

        return $this->fix();
    }

    public function remove(): self
    {
        unset($this->items[$this->position]);

        return $this->fix();
    }

    public function extract()
    {
        $data = $this->getData();
        $this->remove();

        return $data;
    }

    public function clear(): self
    {
        $this->position = 0;
        $this->items = [];

        return $this;
    }
}
