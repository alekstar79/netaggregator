<?php

declare(strict_types=1);

namespace Helpers;

use ReflectionException;
use ReflectionClass;
use ReflectionMethod;

/**
 * Trait TSingletonUtility
 * @package Helpers
 */
trait TSingletonUtility
{
	/**
     * @var self[]
     */
	private static array $instances = [];

    protected function __construct() {}
    final private function __clone() {}

    /**
     * Get only one instance
     * @param array $args
     * @return static
     * @throws ReflectionException
     * @noinspection PhpIncompatibleReturnTypeInspection
     */
    public static function init(...$args): self
    {
		if (!isset(self::$instances[static::class])) {
			$rc  = new ReflectionClass(static::class);

			self::$instances[static::class] = $rc->newInstanceWithoutConstructor();
			$ctr = $rc->getConstructor();

			if ($ctr instanceof ReflectionMethod) {
                $ctr->setAccessible(true);
                $ctr->invokeArgs(self::$instances[static::class], $args);
            }
		}

		return self::$instances[static::class];
    }
}
