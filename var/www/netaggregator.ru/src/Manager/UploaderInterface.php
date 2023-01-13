<?php

declare(strict_types=1);

namespace Manager;

/**
 * Interface UploaderInterface
 * @package Manager
 */
interface UploaderInterface
{
	public function perform(string $path, array $files): array;
}
