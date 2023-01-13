<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace Helpers;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use DirectoryIterator;
use SplFileInfo;

use Throwable;

/**
 * Trait TWriterUtility
 * @package Helpers
 */
trait TWriterUtility
{
    /**
     * @param string $path
     * @return RecursiveDirectoryIterator|RecursiveIteratorIterator|SplFileInfo
     */
    public function getIterator(string $path): RecursiveIteratorIterator
    {
        return new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
    }

	public function chmod_r(string $dir): bool
	{
	    try {

            $set = new DirectoryIterator($dir);

            foreach ($set as $item) {
                $perm = $item->isFile() ? 0764 : 0664;
                $path = $item->getPathname();

                chmod($path, $perm);

                if ($item->isDir() && !$item->isDot()) {
                    $this->chmod_r($path);
                }
            }

            return true;

        } catch (Throwable $e) {
        }

        return false;
	}

    public function mkdir(string $dir, int $mode = 0777, bool $r = true): bool
    {
        if (@mkdir($dir, $mode, $r) || is_dir($dir)) {
            return is_writable($dir) && chmod($dir, $mode & ~umask());
        }

        return false;
    }

    public function copyFolder(string $d1, string $d2, bool $upd = true): bool
    {
        if (is_dir($d1) && is_dir($d2)) {
            $d = dir($d1);

            while (false !== ($entry = $d->read())) {
                if ($entry !== '.' && $entry !== '..') {
                    $this->copyFolder("$d1/$entry", "$d2/$entry", $upd);
                }
            }

            $d->close();
            return true;
        }

        return $this->copySafe($d1, $d2, $upd);
    }

    public function copySafe(string $f1, string $f2, bool $upd): bool
    {
        $time1 = filemtime($f1);

        if (file_exists($f2)) {
            $time2 = filemtime($f2);

            if ($time2 >= $time1 && $upd) {
                return false;
            }
        }
        if ($ok = copy($f1, $f2)) {
            touch($f2, $time1);
        }

        return $ok;
    }

    public function rmEmptyDir($path): bool
    {
        if (!is_dir($path)) {
            return false;
        }

        $dir = $this->getIterator($path);

        foreach($dir as $v) {
            if ($v->isDir() && $v->isWritable()) {
                $f = glob(($d = $dir->key()) . '/*');

                if (empty($f)) {
                    rmdir($d);
                }
            }
        }

        return true;
    }

	public function write(string $path, string $content)
	{
		$tmp = tempnam(dirname($path), basename($path));
		$ret = file_put_contents($tmp, $content);

		if ($ret !== false && rename($tmp, $path)) {
            chmod($path, 0755 & ~umask());
            return $path;
		}

		return false;
	}
}
