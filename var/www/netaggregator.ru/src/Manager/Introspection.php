<?php
/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Manager;

use ReflectionException;
use ReflectionParameter;
use ReflectionMethod;
use ReflectionClass;

/**
 * Class Introspection
 * @package Manager
 */
abstract class Introspection extends ReflectionClass implements IntrospectionInterface
{
	/** @var bool */
	private bool $extend;

	private function declared(ReflectionMethod $m): bool
	{
		return static::class === $m->getDeclaringClass()->name;
	}

	private function research(ReflectionParameter $p)
	{
		$type = (string) $p->getType();

		if (!$this->extend) {
			return $type;
		}

		$optional = $p->isOptional();
		$param = [];

		$param['type'] = $type;
		$param['optional'] = $optional;

        try {

            if ($optional) {
                $param['default'] = $p->getDefaultValue();
            }

        } catch (ReflectionException $e) {
        }

		return $param;
	}

	public function reflection(int $filter = self::IS_PUBLIC, bool $extend = false): array
    {
		$this->extend = $extend;

		return array_column(array_filter(
		    array_map(function(ReflectionMethod $m) {
                if (!$this->declared($m)) {
                    return null;
                }

                $method = $m->name;
                $params = [];

                foreach ($m->getParameters() as $p) {
                    $params[$p->getPosition()] = $this->research($p);
                }

                return compact('method','params');

            }, $this->getMethods($filter))
        ), 'params', 'method');
	}
}
