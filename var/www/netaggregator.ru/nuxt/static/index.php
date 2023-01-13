<?php /** @noinspection PhpIncludeInspection */

declare(strict_types=1);

use Psr\Container\ContainerInterface;

use Zend\Expressive\MiddlewareFactory;
use Zend\Expressive\Application;

// Delegate static file requests back to the PHP built-in webserver
if (PHP_SAPI === 'cli-server' && $_SERVER['SCRIPT_FILENAME'] !== __FILE__) {
    return false;
}

chdir(dirname(__DIR__, 2));

require 'vendor/autoload.php';

header_remove('X-Powered-By');

/**
 * Self-called anonymous function that creates its own scope
 * and keep the global namespace clean
 */
(static function () {
    /** @var ContainerInterface $container */
    $container = require 'config/container.php';

    /** @var Application $app */
    $app = $container->get(Application::class);
    $factory = $container->get(MiddlewareFactory::class);

    // Execute programmatic/declarative middleware pipeline
    // and routing configuration statements
    (require 'config/pipeline.php')($app, $factory, $container);
    (require 'config/routes.php')($app, $factory, $container);

    $app->run();
})();
