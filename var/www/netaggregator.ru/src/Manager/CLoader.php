<?php

declare(strict_types=1);

namespace Manager;

use Zend\ConfigAggregator\PhpFileProvider;

/**
 * Class CLoader
 * @package Manager
 */
class CLoader implements CLoaderInterface
{
	/** @var string */
	private string $path;

	/** @var array */
	private array $cfg;

	public function __construct(string $path = __DIR__ . '/config.php')
    {
        if (!is_file($path)) {
            throw new CLoaderException('File configuration path required');
        }

        $this->path = $path;
        $this->cfg = [];

        $provider = new PhpFileProvider($path);
        $merged = [];

        foreach ($provider() as $cfg) {
            $merged[] = $cfg;
        }

        if ($merged = array_filter($merged)) {
            $this->cfg = array_merge(...$merged);
        }
	}

	public function __toString()
	{
		return $this->path;
	}

	public function get(): array
	{
		return $this->cfg;
	}

	public function text(): string
	{
		return file_get_contents($this->path);
	}

	public function offsetExists($offset): bool
	{
		return isset($this->cfg[$offset]);
	}

	public function offsetGet($offset)
	{
		return $this->offsetExists($offset) ? $this->cfg[$offset] : null;
	}

	public function offsetSet($offset, $value): void
	{
		$this->cfg[$offset] = $value;
	}

	public function offsetUnset($offset): void
	{
		unset($this->cfg[$offset]);
	}
}
