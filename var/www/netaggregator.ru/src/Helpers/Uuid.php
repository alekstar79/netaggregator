<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

use RuntimeException;
use Exception;

/**
 * Class Uuid
 * @package Helpers
 */
class Uuid
{
    private static array $nsList = ['dns' => 0, 'url' => 1, 'oid' => 2, 'x500' => 3];

    private static string $node;

    /**
     * Generate UUID v1 string
     * @param null|string $node
     * @return string
     * @throws Exception
     */
    public static function v1($node = null): string
    {
        $time = microtime();
        $time = substr($time, 11) . substr($time, 2, 7);
        $time = str_pad(dechex((int) $time + 0x01b21dd213814000), 16, '0', STR_PAD_LEFT);
        $clockSeq = random_int(0, 0x3fff);
        $node = $node ?? self::getNode();

        return sprintf('%08s-%04s-1%03s-%04x-%012s',
            substr($time, -8),
            substr($time, -12, 4),
            substr($time, -15, 3),
            $clockSeq | 0x8000,
            $node
        );
    }

    /**
     * Generate UUID v3 string
     * @param string $string
     * @param string $namespace
     * @return string
     * @throws RuntimeException
     */
    public static function v3(string $string, string $namespace = 'x500'): string
    {
        $ns = self::nsResolve($namespace);

        if (!$ns) {
            throw new RuntimeException('Invalid Namespace');
        }

        $hash = md5(hex2bin($ns) . $string);

        return self::output(3, $hash);
    }

    /**
     * Generate UUID v4 Random string
     * @return string
     * @throws Exception
     */
    public static function v4(): string
    {
        return self::output(4, bin2hex(random_bytes(16)));
    }

    /**
     * Generate UUID v5 string
     * @param string $string
     * @param string $namespace
     * @return string
     * @throws RuntimeException
     */
    public static function v5(string $string, string $namespace = 'x500'): string
    {
        $ns = self::nsResolve($namespace);

        if (!$ns) {
            throw new RuntimeException('Invalid Namespace');
        }

        $hash = sha1(hex2bin($ns) . $string);

        return self::output(5, $hash);
    }

    /**
     * Get generated Node (for v1)
     * @return string
     * @throws Exception
     */
    public static function getNode(): string
    {
        if (!self::$node) {
            self::$node = sprintf('%06x%06x',
                random_int(0, 0xffffff) | 0x010000,
                random_int(0, 0xffffff)
            );
        }

        return self::$node;
    }

    private static function output(int $version, string $string): string
    {
        $parts = str_split($string, 4);

        return sprintf("%08s-%04s-$version%03s-%04x-%012s",
            $parts[0] . $parts[1], $parts[2],
            substr($parts[3], 1, 3),
            hexdec($parts[4]) & 0x3fff | 0x8000,
            $parts[5] . $parts[6] . $parts[7]
        );
    }

    private static function nsResolve($namespace)
    {
        if (self::isValid($namespace)) {
            return str_replace('-', '', $namespace);
        }

        $ns = str_replace(['namespace', 'ns', '_'], '', strtolower($namespace));

        if (isset(self::$nsList[$ns])) {
            return '6ba7b81' . self::$nsList[$ns] . '9dad11d180b400c04fd430c8';
        }

        return false;
    }

    private static function isValid($uuid): bool
    {
        return (bool) preg_match('{^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$}Di', $uuid);
    }
}
