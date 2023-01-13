<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

/**
 * Class QueryString
 * @package Helpers
 */
class QueryString
{
	/**
	 * Choose the decoding function
	 * @param bool|int $enc
	 * @return callable
	 */
	public function decodeFn($enc = false): callable
    {
		if ($enc === true) {
			$decoder = static function($v) {
				return rawurldecode(str_replace('+', ' ', $v));
			};
		} elseif ($enc === PHP_QUERY_RFC3986) {
			$decoder = 'rawurldecode';
		} elseif ($enc === PHP_QUERY_RFC1738) {
			$decoder = 'urldecode';
		} else {
			$decoder = static function($v) {
				return $v;
			};
		}

		return $decoder;
	}

	/**
	 * Splitting a string into key-value
	 * @param string $string
     * @return false|string
     */
	private function stringPair(string &$string)
    {
        $n = strpos($string, '=');

		if ($n === false) {
			return '';
		}

		$value = substr($string, $n + strlen('='));
		$string = substr($string, 0, $n);

		return $value;
	}

	/**
	 * Utility function for parseURL
	 * @param array $result A result array
	 * @param string $prop Starting key
	 * @param string $key Key list
	 * @param string $value Value
	 * @param callable $dec Decoding function
	 */
	private function parseArrayKey(array &$result, string $prop, string $key, string $value, callable $dec): void
    {
		$exp = '/\[([^]]*)]/';
		$m = [];

		if (!preg_match_all($exp, $key, $m)) {
			return;
		}
		if (!isset($result[$prop])) {
			$result[$dec($prop)] = [];
		}

		$temp =& $result[$prop];
		$last = $dec(array_pop($m[1]));

        foreach ($m[1] as $k) {
			$k = urldecode($k);

			if ($k === '') {
				$temp[] = [];
				$temp =& $temp[count($temp)-1];
			} elseif (!isset($temp[$k])) {
				$temp[$k] = [];
				$temp =& $temp[$k];
			}
		}

		if ($last === '') {
			$temp[] = $value;
		} else {
			$temp[$dec($last)] = $value;
		}
	}

	/**
	 * Parse a query string into an associative array
	 * @param string $url A query string or URL
	 * @param bool|int $enc
	 * @return array
	 */
	public function decode(string $url, $enc = false): array
    {
        $exp = '/^([^\[]*)(\[.*])$/';
		$ret = [];

		if ($url === '') {
			return $ret;
		}

		$decoder = $this->decodeFn($enc);
		$query = explode('?', $url, 2);
		$pairs = explode('&', end($query));

		foreach ($pairs as $token) {
			$value = $this->stringPair($token);
			$token = $decoder($token);
			$m = [];

			if (preg_match($exp, $token, $m)) {
				$this->parseArrayKey($ret, $m[1], $m[2], $value, $decoder);
			} else {
				$ret[$decoder($token)] = $decoder($value);
			}
		}

		return $ret;
	}

	/**
	 * Assemble a URI-encoded query string from an array or object
	 * @param array $data
	 * @param int $encoding
	 * @return string
	 */
	public function encode(array $data, int $encoding = PHP_QUERY_RFC1738): string
    {
		return http_build_query($data, '', '&', $encoding);
	}
}
