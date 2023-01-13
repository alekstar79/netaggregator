<?php

declare(strict_types=1);

use Zend\ConfigAggregator\ConfigAggregator;
use Zend\ConfigAggregator\PhpFileProvider;
use Zend\ConfigAggregator\ArrayProvider;
use Zend\HttpHandlerRunner\ConfigProvider;

use Dotenv\Dotenv;

Dotenv::create(__DIR__)->load();

/*
 * To enable or disable caching, set the `ConfigAggregator::ENABLE_CACHE`
 * boolean in `config/autoload/local.php`.
 */
$cacheConfig = [
    'config_cache_path' => 'data/cache/config-cache.php',
];

$aggregator = new ConfigAggregator([
    ConfigProvider::class,
    \Zend\Expressive\Router\AuraRouter\ConfigProvider::class,
    \Zend\Expressive\Session\ConfigProvider::class,
    \Zend\Expressive\Twig\ConfigProvider::class,
    \Zend\Expressive\Helper\ConfigProvider::class,
    \Zend\Expressive\Router\ConfigProvider::class,
    \Zend\Expressive\ConfigProvider::class,

    // Include cache configuration
    new ArrayProvider($cacheConfig),

    /*
    * Load application config in a pre-defined order in such a way that
    * local settings overwrite global settings. (Loaded as first to last):
    *  - `global.php`
    *  - `*.global.php`
    *  - `local.php`
    *  - `*.local.php`
    */
    new PhpFileProvider(__DIR__ . '/autoload/{{,*.}global,{,*.}local}.php'),

    // Load development config if it exists
    new PhpFileProvider(__DIR__ . '/development.config.php'),
], $cacheConfig['config_cache_path']);

return $aggregator->getMergedConfig();
