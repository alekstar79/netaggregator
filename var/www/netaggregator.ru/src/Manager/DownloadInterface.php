<?php

declare(strict_types=1);

namespace Manager;

use FilesystemIterator;
use ZipArchive;

/**
 * Interface DownloadInterface
 * @package Manager
 */
interface DownloadInterface
{
	public const

        FS  = FilesystemIterator::NEW_CURRENT_AND_KEY | FilesystemIterator::SKIP_DOTS,
        ZIP = ZipArchive::CREATE | ZipArchive::OVERWRITE,
        MAX_SIZE = 419430400;

    public function setFilter(string $filter): void;

	public function perform(string $path): void;
}
