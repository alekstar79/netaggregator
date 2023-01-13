<?php

declare(strict_types=1);

namespace Manager;

use FilesystemIterator;
use SplFileInfo;
use ZipArchive;

/**
 * Class Downloader (support mod_xsendfile)
 * @package Manager
 *
 * The xsendfile module allows you to give control
 * of file transfer to the Apache server.
 * X-Sendfile: path-to-file
 *
 * @see https://tn123.org/mod_xsendfile
 * @see http://github.com/nmaier/mod_xsendfile
 */
class Downloader implements DownloadInterface
{
	use ExtendsTrait;

	/** @var string */
	private string $target;

	/** @var bool */
	private bool $xsend;

	/** @var int */
	private int $size;

	/** @var string */
	private string $tmp;

	/** @var string */
	private string $filter;

	public function __construct(string $target = null, string $tmp = null)
    {
        $tmp = $tmp ?: __DIR__ . '/tmp';

        $xsend = function_exists('apache_get_modules') && in_array('mod_xsendfile', apache_get_modules(), false);

        if (!$this->rmdir($tmp, true) && !$this->mkdir($tmp)) {
            throw new DownloaderException('Error creating temporary directory');
        }

        $this->target = $target ?: $this->location();
        $this->filter = '//i';
        $this->xsend = $xsend;
        $this->tmp = $tmp;
        $this->size = 0;
    }

	public function headers(string $path): array
	{
		$mime = $this->mimeType($path) ?: 'application/octet-stream';

		$node = fileinode($path);
		$time = filemtime($path);
		$name = basename($path);
		$size = filesize($path);

		$etag = sprintf('%x-%x-%x', $node, $size, $time);
		$last = gmdate('r', $time);
		$exp  = gmdate('r');

		return array_filter([
			$this->xsend ? "X-Sendfile: $path" : null,

            'Cache-Control: no-store, no-cache, must-revalidate',
            'Cache-Control: post-check=0, pre-check=0',
            'Cache-Control: max-age=0',
            'Cache-Control: private',

            'Content-Description: File Transfer',
			"Content-Disposition: attachment; filename=\"$name\";",
            'Content-Transfer-Encoding: binary',
            "Content-Length: $size",
			"Content-Type: $mime",

			"ETag: $etag",
			"Last-Modified: $last",
			"Expires: $exp",

            'Connection: close',
            'Pragma: public'
		]);
	}

    private function flist(string $dir, array $files = []): array
    {
        /** @var SplFileInfo $info */
        foreach (new FilesystemIterator($dir, self::FS) as $info) {
            $path = $info->getRealPath();
            $gid = $info->getGroup();

            if (!$path || $info->isLink() || preg_match($this->filter, $path)) {
                continue;
            }
            if (!in_array($gid, [33, 502], false)) {
                continue;
            }
            if ($info->isDir()) {
                $files = $this->flist($path, $files);
            }
            if ($info->isFile()) {
                $this->size += $info->getSize();
                $files[] = $path;
            }
        }

        return $files;
    }

    private function zipPath(string $dir): string
    {
        return $this->mpath($this->tmp, (basename($dir) ?: 'download') . '.zip');
    }

    private function isRealFile(string $path): bool
    {
        return file_exists($path) && /* filesize($path) && */ !preg_match($this->filter, $path);
    }

    private function isAcceptableSize(): bool
    {
        return $this->size && $this->size < self::MAX_SIZE;
    }

    private function archive(string $dir): string
    {
        $fully = $this->zipPath($dir);
        $files = $this->flist($dir);

        if ($this->isAcceptableSize()) {
            $zip = new ZipArchive();

            $zip->open($fully, self::ZIP);

            foreach ($files as $file) {
                $zip->addFile($file, substr($file, strlen($dir)));
            }

            $zip->close();
        }

        return $fully;
    }

	private function file(string $path): bool
	{
	    $status = false;

		if ($this->isRealFile($path)) {
            $status = $this->xsend || $this->read($path);
		}

		return $status;
	}

	private function folder(string $path): bool
	{
		return $this->file($this->archive($path));
	}

	public function setFilter(string $filter): void
    {
        $this->filter = $filter;
    }

	public function perform(string $path): void
	{
		$status = false;

		switch(true) {
			case is_dir($path) :
				$status = $this->folder($path);
				break;
			case is_file($path):
				$status = $this->file($path);
				break;
		}

		if (!$status) {
			$this->send([
			    sprintf('Location: %s', $this->target)
            ]);
		}

		exit();
	}
}
