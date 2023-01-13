<?php

declare(strict_types=1);

namespace Manager;

use ArrayAccess;

/**
 * Interface CLoaderInterface
 * @package Manager
 */
interface CLoaderInterface extends ArrayAccess
{
	public function __toString();

	public function get(): array;

	public function text(): string;
}
