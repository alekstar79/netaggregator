<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

use Exception;

/**
 * Trait TStringUtility
 * @package Helpers
 */
trait TStringUtility
{
	/**
	 * Check badios
	 * @param string $val
	 * @param string $data
	 * @return bool
	 */
	public function badios(string $val, string $data): bool
    {
        $ret = false;

		$match = static function(string $p) use ($val, $data) {
			return (bool) preg_match(sprintf($p, $val), $data);
		};

		if (in_array($val, ['a','O','s'])) {
			$ret = $match('/^%s:[0-9]+:.*[;}]$/s');
		}
		if (in_array($val, ['b','i','d'])) {
			$ret = $match('/^%s:[0-9.E-]+;$/s');
		}

		return $ret;
	}

	/**
	 * Check data on validity of the serialized string
	 * @param mixed $data
	 * @return bool
	 */
	public function isSerialize($data): bool
    {
        if (!is_string($data)) {
            return false;
        }

        $string = trim($data);
        $serialize = false;
        $badios = [];

        if ($string === 'N;') {
            $serialize = true;
        } else if (preg_match('/^([badiOs]):/', $string, $badios)) {
			$serialize = $this->badios($badios[1], $data);
		}

		return $serialize;
	}

	/**
	 * Convert value to string
	 * @param mixed $value
	 * @return string
	 */
	public function toString($value): string
    {
		if (is_array($value) || is_object($value)) {
			return serialize($value);
		}

        switch (true) {
            case is_bool($value):
                $string = $value ? 'true' : 'false';
                break;
            case $value === null:
                $string = 'null';
                break;
            default:
                $string = trim((string) $value);
        }

        return $string;
	}

    /**
     * Generate a random UUID (version 4)
     * @return string
     * @throws Exception
     */
	public function uuid4(): string
    {
		return sprintf(
			'%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
			random_int(0, 0xffff), random_int(0, 0xffff),
            random_int(0, 0xffff),
            random_int(0, 0x0fff) | 0x4000,
            random_int(0, 0x3fff) | 0x8000,
            random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff)
		);
	}

	/**
	 * Int to 64 bits string
	 * @param int $input
	 * @return string
	 */
	public function str64bit(int $input): string
	{
		return str_pad(decbin($input), 64, '0', STR_PAD_LEFT);
	}

	/**
	 * Underscore
	 * @param string $string
	 * @return string
	 */
	public function underscore(string $string): string
	{
        return mb_strtolower(preg_replace(
            ['/([a-z\d])([A-Z])/','/([^_])([A-Z][a-z])/'],
            '$1_$2',
            $string
        ));
	}

	/**
	 * Get CamelCase string
	 * @param array $items
	 * @return string
	 */
	public function ucCase(...$items): string
    {
		return array_reduce($items, static function($c, $i) {
		    return $c . ucfirst($i);
		}, '');
	}

	/**
	 * Convert slug to camelCase string
	 * @param string $str
	 * @param bool $ucf
	 * @return string
	 */
	public function camelize(string $str, bool $ucf): string
    {
		$upper = static function(array $m): string {
			return strtoupper($m[1]);
		};

		$ret = preg_replace_callback('/-([a-z])/', $upper, $str);
		return $ucf ? ucfirst($ret) : $ret;
	}

	/**
	 * Upper CamelCase
	 * @param string $str
	 * @return string
	 */
	public function uCase(string $str): string
    {
		return $this->camelize($str, true);
	}

	/**
	 * Lower CamelCase
	 * @param string $str
	 * @return string
	 */
	public function lCase(string $str): string
    {
		return $this->camelize($str, false);
	}
}
