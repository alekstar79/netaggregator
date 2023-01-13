<?php declare(strict_types=1);

namespace App\Model;

use Generator;

/**
* Interface RepoInterface
* @package App\Model
*/
interface JsonRepoInterface
{
    public const PAT = '%s/%s.json';
    public const ALL = '*';

    public static function filter(array $exclude): callable;

    public static function map(array $list, string $suffix = '.json'): array;

    public static function init(string $dir): JsonRepo;

    public function list(string $patt = self::ALL): array;

    public function delete(string $id): array;

    public function save(string $name, $data): bool;

    public function add(string $name, $data): bool;

    public function read(string $name): array;

    public function has(string $name): bool;

    public function get(array $list, bool $keys = true, string $suffix = '.json'): array;

    public function unless(array $exclude, bool $keys = false, string $suffix = '.json'): array;

    public function fetch(string $patt = self::ALL, bool $keys = false, string $suffix = '.json'): array;

    public function dir(string $folder): self;

    public function iterator(): Generator;
}
