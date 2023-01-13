<?php

declare(strict_types=1);

namespace Manager;

use ReflectionMethod;

/**
 * Interface IntrospectionInterface
 * @package Manager
 */
interface IntrospectionInterface
{
    public const IS_PUBLIC = ReflectionMethod::IS_PUBLIC;

	/**
	 * Returns reflection of methods and their parameters
	 * @param int $filter \ReflectionMethod::IS_PUBLIC
	 * @param bool $extend A marker to extended data view
	 * @return array
	 */
	public function reflection(int $filter = ReflectionMethod::IS_PUBLIC, bool $extend = false): array;
}
