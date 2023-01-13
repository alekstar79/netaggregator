<?php declare(strict_types=1);

namespace App\Service\Stream;

use Helpers\TArrayUtility;

/**
* Trait ExtendsTrait
* @package App\Service\Stream
*/
trait ExtendsTrait
{
    use TArrayUtility;

    public function addBraces(array $data): array
    {
        return array_map(static fn($v): string => '{' . trim((string) $v, '{}') . '}', $data);
    }

    public function rmBraces(array $data): array
    {
        return array_map(static fn($v): int => (int) trim((string) $v, '{}'), $data);
    }

    public function findMissing(array $values): array
    {
        $values = $this->rmBraces($values);
        $values = $this->missValues($values);

        return $this->addBraces($values);
    }

    public function remove(array $data): array
    {
        $data = array_keys($data);

        foreach ($data as $i => $tag) {
            $data[$i] = compact('tag');
        }

        return $data;
    }

    public function install(array $data): array
    {
        $rules = [];

        foreach ($data as $tag => $value) {
            $rules[] = ['rule' => compact('tag','value')];
        }

        return $rules;
    }
}
