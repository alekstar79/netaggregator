<?php

declare(strict_types=1);

namespace Process;

/**
 * Interface PM2Interface
 * @package Process
 */
interface PM2Interface
{
    /**
     * @param array $args
     * @return string
     */
    public static function encode(array $args): string;

    /**
     * @param array $args
     * @return array
     */
    public static function decode(array $args): array;

    /**
     * @param array $filter
     * @return array
     */
    public static function list(array $filter = []): array;

    /**
     * @param int|string $entity
     * @return array
     */
    public static function show($entity): array;

    /**
     * @param string $file
     * @param string $name
     * @param string|array $args
     * @param string $exec [bash,python,ruby,coffee,php,perl,node]
     * @param bool $restart
     * @return array
     */
    public static function start(string $file, string $name = '', $args = null, string $exec = 'php', bool $restart = false): array;

    /**
     * @param int|string|array $entities
     * @param bool $update
     * @return array
     */
    public static function restart($entities = 'all', bool $update = true): array;

    /**
     * @param int|string|array $entities
     * @return array
     */
    public static function stop($entities): array;

    /**
     * @param int|string|array $entities
     * @return array
     */
    public static function delete($entities): array;
}
