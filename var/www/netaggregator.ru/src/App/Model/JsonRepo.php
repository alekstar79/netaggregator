<?php declare(strict_types=1);

namespace App\Model;

use Helpers\{ TJsonUtility, TWriterUtility };

use Generator;
use Throwable;

/**
* Class Repository
* @package App\Model
*/
class JsonRepo implements JsonRepoInterface
{
    use TJsonUtility, TWriterUtility;

    /** @var string */
    private $base;

    /** @var string */
    public $dir;

    public function __construct(string $dir = '/')
    {
        if (!$dir = realpath($dir)) {
            throw new JsonRepoException('Wrong path directory');
        }

        $this->base = $this->dir = $dir;
    }

    private function slashreduce(string $path): string
    {
        $path = DIRECTORY_SEPARATOR . str_replace(['/','\\'], DIRECTORY_SEPARATOR, $path);

        return preg_replace(sprintf('/(\%s)+/', DIRECTORY_SEPARATOR), '$1', $path);
    }

    private function path(string $id): string
    {
        return sprintf(static::PAT, $this->dir, $id);
    }

    public static function filter(array $exclude): callable
    {
        return static function(string $line) use($exclude): bool
        {
            foreach ($exclude as $e) {
                if (false !== strpos($line, $e)) {
                    return false;
                }
            }

            return true;
        };
    }

    public static function map(array $list, string $suffix = '.json'): array
    {
        return array_map(static function($path) use($suffix) {
            return basename($path, $suffix);
        }, $list);
    }

    public static function init(string $dir): JsonRepo
    {
        return new self($dir);
    }

    public function list(string $patt = self::ALL): array
    {
        return glob($this->path($patt));
    }

    public function delete(string $id): array
    {
        if ($list = glob($this->path($id))) {
            return array_map('unlink', $list);
        }

        return $list;
    }

    public function save(string $name, $data): bool
    {
        return $this->jsonStore($this->path($name), $data);
    }

    public function read(string $name, array $default = []): array
    {
        $ret = [];

        try {

            $ret = $this->jsonRead($this->path($name));

            if (!count($ret)) {
                $ret = $default;
            }

        } catch (Throwable $e) {
        }

        return $ret;
    }

    public function add(string $name, $data): bool
    {
        return $this->save($name, array_merge($this->read($name), $data));
    }

    public function has(string $name): bool
    {
        return (($list = $this->list())) && in_array($this->path($name), $list, false);
    }

    public function get(array $list, bool $keys = true, string $suffix = '.json'): array
    {
        if ($keys) {
            $list = array_combine(self::map($list, $suffix), $list);
        }

        return array_map([$this, 'jsonRead'], $list);
    }

    public function unless(array $exclude, bool $keys = true, string $suffix = '.json'): array
    {
        return $this->get(array_filter($this->list(), self::filter($exclude)));
    }

    public function fetch(string $patt = self::ALL, bool $keys = true, string $suffix = '.json'): array
    {
        return $this->get($this->list($patt), $keys, $suffix);
    }

    public function dir(string $folder): JsonRepoInterface
    {
        if (get_class($this) !== __CLASS__) {
            throw new JsonRepoException('Method is not allowed from a child class');
        }

        $dir = $this->base !== $folder ? $this->base . $folder : $this->base;
        $dir = $this->slashreduce($dir);

        if ($this->mkdir($dir)) {
            $this->dir = $dir;
        }

        return $this;
    }

    public function iterator(bool $keys = false, string $suffix = '.json'): Generator
    {
        $list = $this->list();

        if ($keys) {
            $list = array_combine(self::map($list, $suffix), $list);
        }

        foreach ($list as $key => $file) {
            $json = $this->jsonRead($file);
            yield compact('key','json');
        }
    }
}
