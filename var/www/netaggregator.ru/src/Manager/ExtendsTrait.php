<?php

declare(strict_types=1);

namespace Manager;

use SplFileInfo;

use Helpers\{ TDifferentUtility, TMimeTypeUtility, TServerUtility, TWriterUtility };

/**
 * Trait ExtendsTrait
 * @package Manager
 */
trait ExtendsTrait
{
    use TDifferentUtility, TMimeTypeUtility, TServerUtility, TWriterUtility;

    public function location(): string
    {
        if (!$this->isCli()) {
            $ref = $this->server('HTTP_REFERER')[0];

            return $ref ?: '/' . strtok(
                $this->server('REQUEST_URI')[0],
                '/'
            );
        }

        return '/';
    }

	public function url(string $path, string $alter = null): string
	{
		$srv = $this->server('DOCUMENT_ROOT');
		$pat = preg_quote($srv[0], '~');

		if (!preg_match("~$pat~i", $path)) {
			return $alter ? "$alter?f=$path" : '/';
		}

		return str_replace($srv[0], '', $path);
	}

    public function slashReducer(string $path): string
    {
        $path = str_replace(['/','\\'], DIRECTORY_SEPARATOR, $path);
        return preg_replace(sprintf('/(\%s)+/', DIRECTORY_SEPARATOR), '$1', $path);
    }

	public function mpath(string $path, string $name): string
	{
		return $this->slashReducer($path . DIRECTORY_SEPARATOR . $name);
	}

	public function join(array $a, array $b): array
	{
		ksort($a, SORT_NATURAL);
		ksort($b, SORT_NATURAL);

		return array_merge(array_values($a), array_values($b));
	}

	public function cleanBuffer(): void
	{
		$level = ob_get_level();

        while ($level--) {
            ob_end_clean();
        }
	}

    public function send(array $headers, bool $repl = false): bool
    {
        if (headers_sent()) {
            return false;
        }

        foreach ($headers as $header) {
            header($header, $repl);
        }

        return false;
    }

    public function headers(string $path): array
    {
        $mime = $this->mimeType($path) ?: 'application/octet-stream';
        $name = basename($path);

        return [
            'Accept-Ranges: bytes',
            "Content-Disposition: inline; filename=\"$name\";",
            'Content-Transfer-Encoding: binary',
            "Content-Type: $mime",
            'Pragma: public'
        ];
    }

    public function read(string $path): bool
    {
        if ($f = fopen($path, 'rb')) {
            $this->cleanBuffer();

            $this->send($this->headers($path));

            if (function_exists('fpassthru')) {
                fpassthru($f);
            } else {
                while(!feof($f)) {
                    echo fread($f, 8192);
                    flush();
                }
            }

            fclose($f);
            return true;
        }

        return false;
    }

	public function copy(string $src, string $dst): bool
	{
		$sfi = new SplFileInfo($src);
		$bsn = $sfi->getBasename();

		$dst .= DIRECTORY_SEPARATOR . $bsn;

        if ($sfi->isFile()) {
            return copy((string) $sfi, $dst);
        }
        if (!file_exists($dst)) {
            $this->mkdir($dst);
        }

        $iter = $this->getIterator((string) $sfi);
		$dump = [];

		foreach ($iter as $item) {
			$subname = $dst . DIRECTORY_SEPARATOR . $iter->getSubPathname();
			$dump[] = $item->isDir()
                ? mkdir($subname, 0777, true)
                : copy($item, $subname);
		}

		return count($dump) === count(array_filter($dump));
	}

	public function rmdir(string $dir, bool $clear = false): bool
	{
		if (!is_dir($dir)) {
            return false;
        }

		$files = $this->getIterator($dir);
		$list = [];

		foreach($files as $file) {
			$path = $file->getRealPath();
			$list[] = $file->isDir() ? rmdir($path) : unlink($path);
		}

		if (!$clear) {
            $list[] = rmdir($dir);
        }

		return count($list) === count(array_filter($list));
	}
}
