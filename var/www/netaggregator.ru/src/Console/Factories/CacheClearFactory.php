<?php

declare(strict_types=1);

namespace Console\Factories;

use Psr\Container\ContainerInterface;

use Console\Command\CacheClear;

/**
 * Class CacheClearFactory
 * @package Console\Factories
 */
class CacheClearFactory
{
    public function __invoke(ContainerInterface $c): CacheClear
    {
        $config = $c->get('config');
        $config_cache_path = [];

        if (!isset($config['console'])) {
            $config['console'] = [];
        }
        if (isset($config['config_cache_path'])) {
            $config_cache_path = ['config' => $config['config_cache_path']];
        }

        return new CacheClear(array_merge(
            $config['console']['cachePaths'] ?? [],
            $config_cache_path
        ));
    }
}
