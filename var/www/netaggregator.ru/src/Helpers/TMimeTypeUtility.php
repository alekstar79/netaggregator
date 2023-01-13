<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

/**
 * Trait TMimeTypeUtility
 * @package Helpers
 */
trait TMimeTypeUtility
{
	/** @var string */
	public string $url = 'https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types';

	/** @var array */
	private array $mimes = [];

	/**
	 * Glue the parts of the array
	 * @param array $part
	 */
	private function glueParts(array $part): void
    {
		if (($c = count($part[1] ?? [])) > 1) {
			for ($i = 1; $i < $c; $i++) {
				$this->mimes[$part[0][$i]] = $part[0][0];
			}
		}
	}

	/**
	 * @return array
     */
	public function generateMimeArray(): array
    {
		$dat = @file_get_contents($this->url) ?: '';

		foreach (explode("\n", $dat) as $str) {
			$patt = '#([\S]+)#';
            $m = [];

			if (($str[0] ?? '#') !== '#' && preg_match_all($patt, $str, $m)) {
				$this->glueParts($m);
			}
		}

		@ksort($this->mimes);

		return $this->mimes;
	}

    /**
     * @param string $file
     * @param string $magic
     * @return string|null
     */
	public function mimeType(string $file, $magic = null): ?string
    {
        $options = defined('FILEINFO_MIME_TYPE') ? FILEINFO_MIME_TYPE : FILEINFO_MIME;
        $finfo = $magic ? finfo_open($options, $magic) : finfo_open($options);

        $type = null;

        if (is_resource($finfo)) {
            $type = finfo_file($finfo, $file);
        }
        if (!$type && function_exists('mime_content_type')) {
            $type = mime_content_type($file);
        }

        return $type;
	}
}
