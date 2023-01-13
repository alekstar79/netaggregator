<?php

declare(strict_types=1);

namespace Manager;

use Psr\Container\ContainerInterface;

/**
 * Class MFactory
 * @package Manager
 */
class ManagerFactory
{
	public function __invoke(ContainerInterface $c): ManagerInterface
	{
		return new Manager($c->get(Downloader::class), $c->get(Uploader::class), $c->get(CLoader::class));
	}
}
