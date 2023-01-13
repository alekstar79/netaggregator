<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

/**
 * Trait TDifferentUtility
 * @package Helpers
 */
trait TDifferentUtility
{
	public function isCli(): bool
    {
        return strpos(PHP_SAPI, 'cli') === 0;
	}

	public function includePath(...$args): string
    {
		if ($add = array_filter($args, 'realpath')) {
            $src = explode(PATH_SEPARATOR, get_include_path());

            set_include_path(implode(
                PATH_SEPARATOR,
                array_unique(array_merge($src, $add))
            ));
        }

		return get_include_path();
	}

	public function getMask(array $bits): int
    {
		$mask = 0;

		foreach ($bits as $bit) {
			$mask |= 1 << ($bit - 1);
		}

		return $mask;
	}

	public function format(int $size, int $round = 2): string
    {
        $dim = ['b','kb','mb','gb','tb','pb'][$i = (int) floor(log($size, 1024))];

        $mem = round($size / (1024 ** $i), $round);

        return sprintf('%d %s', $mem, $dim);
	}

    /**
     * @see https://stackoverflow.com/questions/3656713/how-to-get-current-time-in-milliseconds-in-php
     * @return int
     */
	public function milliseconds(): int
    {
        $mt = explode(' ', microtime());

        return ((int) $mt[1]) * 1000 + ((int) round($mt[0] * 1000));
    }
}
