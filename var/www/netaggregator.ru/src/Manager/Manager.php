<?php

declare(strict_types=1);

namespace Manager;

use FilesystemIterator;

/**
 * Class Manager
 * @package Manager
 */
class Manager implements ManagerInterface
{
	use ExtendsTrait;

	/** @var UploaderInterface */
	private UploaderInterface $upload;

	/** @var DownloadInterface */
	private DownloadInterface $loader;

	/** @var CLoaderInterface */
	public CLoaderInterface $config;

    /** @var string */
    private string $filter;

    /** @var array */
	private array $map;

	public function __construct(DownloadInterface $loader, UploaderInterface $upload, CLoaderInterface $config)
    {
        clearstatcache();

        if (!isset($config['exclude'])) {
            $config['exclude'] = [];
        }
        if (!isset($config['readme'])) {
            $config['readme'] = '';
        }

        $filter = sprintf('~(%s)~i', implode('|', $config['exclude']));
        $loader->setFilter($filter);

        $this->filter = $filter;
        $this->loader = $loader;
        $this->upload = $upload;
        $this->config = $config;

		$this->map = [
			'edit' => $config['extensions'],
			'img' => $config['images'],
			'vid' => $config['video'],
            'pdf' => $config['pdf']
		];
	}

    protected function readme(string $path, string $readme): bool
    {
        return !realpath($path) && $this->mkdir($path) && $readme &&
            is_file($readme) && $this->copy($readme, $path);
    }

	protected function getType(string $ext): ?string
    {
        $ext = strtolower($ext);
        $ret = null;

        foreach ($this->map as $key => $types) {
            if (in_array($ext, $types, false)) {
                $ret = $key;
                break;
            }
        }

		return $ret;
	}

	protected function crawler(string $dir, bool $tree = false): array
	{
        $iterator = new FilesystemIterator($dir, self::FLAGS);
        $root = $this->config['root'];
        $folders = [];
        $files = [];

        foreach ($iterator as $name => $info) {
            $path = $info->getRealPath();
            $gid = $info->getGroup();

            if (!$path || $info->isLink() || preg_match($this->filter, $path)) {
                continue;
            }
            if (!in_array($gid, [33 /* www-data */, 502 /* ? */], false)) {
                continue; // sudo chown -R www-data:www-data /path
            }

            $url = null;
            $type = 'dir';
            $size = 0;

            if ($info->isFile()) {
                $path = str_replace($root . '/', '', $path);
                $file = $ext = $info->getExtension();
                $type = $this->getType($ext);
                $size = $info->getSize();

                if (!$ext || !$type) {
                    $type = $type ?: 'regular';
                    $file = 'file';
                }
                if (in_array($type, ['img','vid'])) {
                    $url = $this->url($path, '/api/viewer');
                }

                $files[$name] = compact('name','size','type','path','file','url','ext');

            } else {
                if ($children = $tree ? $this->crawler($path, $tree) : []) {
                    $size = array_sum(array_column($children, 'size'));
                }

                $folders[$name] = compact('name','size','type','path','children');
            }
        }

        return $this->join($folders, $files);
	}

	final public function newfile(array $params): bool
	{
        if ($fh = fopen($params['f'], 'wb')) {
            fclose($fh);
            return true;
        }

		return false;
	}

	final public function newfolder(array $params): bool
	{
		return $this->mkdir($params['f']);
	}

	final public function rename(array $params): bool
    {
		if (isset($params['move']) && is_dir($params['new'])) {
            $params['new'] .= DIRECTORY_SEPARATOR . basename($params['old']);
		}

		return rename($params['old'], $params['new']);
	}

	final public function save(array $params): bool
	{
		if ($params['f'] === 'config') {
            $params['f'] = (string) $this->config;
		}

		return (bool) $this->write($params['f'], $params['code']);
	}

	final public function move(array $params): bool
	{
	    $target = $params['target'];
		$list = [];

		foreach ($params['paths'] as $item) {
			switch ($item['action']) {
				case 'copy': $list[] = $this->copy($item['path'], $target); break;

				case 'cut': $list[] = $this->rename([
                    'old' => $item['path'],
                    'new' => $target,
                    'move' => true
                ]);
			}
		}

		return count($params['paths']) === count(array_filter($list));
	}

	final public function remove(array $params): bool
	{
	    $status = false;

		if (file_exists($params['path'])) {
            switch (true) {
                case is_dir($params['path']):
                    $status = $this->rmdir($params['path']);
                    break;

                case is_file($params['path']):
                    $status = unlink($params['path']);
                    break;
            }
        }

        return $status;
	}

	final public function download(array $params): void
	{
		$this->loader->perform($params['f']);
	}

    final public function upload(array $params): bool
    {
        $uploaded = $this->upload->perform($params['path'], $params['files']);

        return count($params['files']) === count($uploaded);
    }

	final public function tree(array $params): array
	{
	    $allowed = $this->config['allowed'];
	    $readme = $this->config['readme'];
        $path = $this->config['root'];

	    if (!in_array($params['uid'], $allowed, false)) {
            $path .= '/users/' . $params['uid'];
            // visudo [/etc/sudoers] www-data ALL=NOPASSWD: /bin/chown
            shell_exec("sudo chown -R www-data:www-data $path");
        }

        $this->readme($path, $readme);

		return ['tree' => [
            'children' => $this->crawler($path, true),
            'name' => basename($path),
            'path' => $path,
            'type' => 'dir',
            'root' => true
        ]];
	}
}
