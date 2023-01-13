<?php

declare(strict_types=1);

namespace Manager;

use FilesystemIterator;

/**
 * Interface ManagerInterface
 * @property CLoaderInterface $config
 */
interface ManagerInterface
{
    public const FLAGS = FilesystemIterator::NEW_CURRENT_AND_KEY | FilesystemIterator::SKIP_DOTS;

	public function newfile(array $params): bool;

	public function newfolder(array $params): bool;

	public function rename(array $params): bool;

    public function save(array $params): bool;

	public function move(array $params): bool;

	public function remove(array $params): bool;

	public function download(array $params);

	public function upload(array $params): bool;

	public function tree(array $params): array;

	public function format(int $size, int $p = 2): string;

	public function url(string $path, string $alter = null): string;

	public function join(array $main, array $add): array;
}
