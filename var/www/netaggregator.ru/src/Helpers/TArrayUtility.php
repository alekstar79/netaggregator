<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

/**
 * Trait TArrayUtility
 * @package Helpers
 */
trait TArrayUtility
{
    public function isSimple($val): bool
    {
        return $val === null || is_scalar($val);
    }

	public function isAssoc($val): bool
    {
		return is_array($val) && array_keys($val)[0] !== 0;
	}

	public function notEmpty($val): bool
    {
		return is_array($val) && !empty($val);
	}

    public function grep(string $patt, array $array): array
    {
        return array_intersect_key(
            $array,
            array_flip(preg_grep($patt, array_keys($array)))
        );
    }

	public function caselessRemove(array $data, $keys): array
    {
		$keys = array_map('strtolower', (array) $keys);

		foreach (array_keys($data) as $k) {
			if (in_array(strtolower($k), $keys, false)) {
				unset($data[$k]);
			}
		}

		return $data;
	}

	public function arrayRotate(array $array, int $shift = 0): array
    {
		$shift %= count($array);

		if ($shift < 0) {
			$shift += count($array);
		}

		return array_merge(
			array_slice($array, $shift, null, true),
			array_slice($array, 0, $shift, true)
		);
	}

	public function toArray($data, bool $recursive = false): array
    {
		$array = (array) $data;
		$dump = [];

		foreach ($array as $key => $val) {
			$dump[$key] = $recursive && !$this->isSimple($val)
				? $this->toArray($val, $recursive)
				: $val;
		}

		return $dump;
	}

	public function flat($data, bool $preserveKeys = true): array
    {
        if (!is_iterable($data)) {
            $data = $this->toArray($data);
        }

        $flattened = [];

        array_walk_recursive($data, static function($value, $key) use(&$flattened, $preserveKeys) {
            if ($preserveKeys && !is_int($key)) {
                $flattened[$key] = $value;
            } else {
                $flattened[] = $value;
            }
        });

        return $flattened;
    }

	public function missValues(array $values): array
    {
        $c = count($values);
        sort($values, 1);
        $ret = [];
        $bit = 1;
        $i = 0;

        while ($i < $c && $v = $values[$i++]) {
            while ($bit !== $v) {
                $ret[] = $bit++;
            }

            $bit++;
        }

        return $ret;
	}
}
