<?php declare(strict_types=1);

namespace App\Service\Stream;

/**
* Class DataPack
* @package App\Service\Stream
*/
class Package implements PackageInterface
{
    use ExtendsTrait;

    /** @var array */
    private array $installed = [];

    /** @var array */
    private array $missed = [];

    /** @var array */
    private array $remove = [];

    /** @var array */
    private array $mount = [];

    /** @var array */
    private array $rest = [];

    /** @var array */
    private array $marks;

    /** @var array */
    private array $all;

    public function __construct(array $marks = [])
    {
        $this->marks = $marks;
    }

    /**
     * @return bool
     */
    public function isSomethingAdd(): bool
    {
        return (bool) count($this->mount);
    }

    /**
     * @return bool
     */
    public function isSomethingDel(): bool
    {
        return (bool) count($this->remove);
    }

    /**
     * Returns an array of data to mount to the stream
     * @return array
     */
    public function addRequest(): array
    {
        return $this->install($this->mount);
    }

    /**
     * Returns an array of data to remove from the stream
     * @return array
     */
    public function delRequest(): array
    {
        return $this->remove($this->remove);
    }

    public function setAddPack(array $data): void
    {
        $this->mount = $data;
    }

    public function setDelPack(array $data): void
    {
        $this->remove = $data;
    }

    /**
     * Returns an array of data to store
     * @return array
     */
    public function getRules(): array
    {
        return array_map(
            static fn(string $mark) => ['mark' => $mark, 'stat' => 0],
            $this->installed + $this->mount
        );
    }

    /**
     * Analysis of tags and output data  generation
     * @param array $current
     * @param array $rest
     * @return PackageInterface
     */
    public function generate(array $current, array $rest): PackageInterface
    {
        $this->all = $current + $rest;
        $this->rest = $rest;

        $this->setCurrentDiff($current);
        $this->setMissedTags();
        $this->setInstalled();
        $this->calcInstall();

        foreach ($this as $prop => $value) {
            if (!in_array($prop, ['marks', 'missed'])) {
                $this->{$prop} = $this->prepared($value);
            }
        }

        return $this;
    }

    public function restore(array $data): void
    {
        $this->mount = $data;
    }

    /**
     * @return PackageInterface
     */
    public function reverse(): PackageInterface
    {
        $remove = $this->remove;

        $this->remove = $this->mount;
        $this->mount = $remove;

        return $this;
    }

    /**
     * @param array $rules
     * @return bool
     */
    public function presence(array $rules): bool
    {
        return !array_diff($this->all, $rules);
    }

    /**
     * Sorts and adds braces
     * @param array $data
     * @return array
     */
    private function prepared(array $data): array
    {
        $data = $this->rmBraces(array_flip($data));
        asort($data, SORT_NUMERIC);

        return array_flip($this->addBraces($data));
    }

    /**
     * Calculate an array of rules to remove from stream
     * @param array $data
     */
    private function setCurrentDiff(array $data): void
    {
        $this->remove = array_diff_key(array_diff($data, $this->marks), $this->rest);
    }

    /**
     * Calculates missed tags
     */
    private function setMissedTags(): void
    {
        $missing = $this->findMissing(array_keys($this->all));
        $removed = array_keys($this->remove);

        $this->missed = array_merge($removed, $missing);
    }

    /**
     * Calculates installed tags
     */
    private function setInstalled(): void
    {
        $this->installed = array_intersect($this->all, $this->marks);
    }

    /**
     * @return Package
     */
    private function calcInstall(): Package
    {
        $this->mount = array_diff($this->marks, $this->all);
        $this->mount = $this->assembling(
            count($this->missed),
            count($this->mount),
            count($this->all)
        );

        return $this;
    }

    /**
     * @param int $missed
     * @param int $mount
     * @param int $data
     * @return array
     */
    private function assembling(int $missed, int $mount, int $data): array
    {
        if ($missed >= $mount) {
            return $this->fromMissedTags($mount);
        }

        $start = $data + $missed + 1;
        $diff = $mount - $missed;
        $end = $start + $diff - 1;

        return $this->fromMissedTags($diff)
             + $this->fromNewTags($start, $end);
    }

    /**
     * @param int $count
     * @return array
     */
    private function fromMissedTags(int $count): array
    {
        $rules = [];

        if ($this->missed) {
            $rules = array_combine(
                array_splice($this->missed, 0, $count),
                array_splice($this->mount, 0, $count)
            );
        }

        return $rules;
    }

    /**
     * @param int $start
     * @param int $end
     * @return array
     */
    private function fromNewTags(int $start, int $end): array
    {
        return array_combine(range($start, $end), $this->mount);
    }
}
