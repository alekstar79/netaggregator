<?php /** @noinspection PhpUnusedParameterInspection */

declare(strict_types=1);

use Psr\Container\ContainerInterface;

use Zend\Expressive\MiddlewareFactory;
use Zend\Expressive\Helper\ServerUrlMiddleware;
use Zend\Expressive\Helper\UrlHelperMiddleware;
use Zend\Expressive\Handler\NotFoundHandler;
use Zend\Expressive\Application;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Expressive\Router\Middleware\RouteMiddleware;
use Zend\Expressive\Router\Middleware\DispatchMiddleware;
use Zend\Expressive\Router\Middleware\ImplicitHeadMiddleware;
use Zend\Expressive\Router\Middleware\ImplicitOptionsMiddleware;
use Zend\Expressive\Router\Middleware\MethodNotAllowedMiddleware;

use Zend\Stratigility\Middleware\ErrorHandler;

use App\Middleware\ServicesRouterMiddleware;
use App\Middleware\MobileDetectMiddleware;
use App\Middleware\BodyParamsMiddleware;
use App\Middleware\PaymentMiddleware;

// use App\Middleware\BasicAuthMiddleware;
// use App\Middleware\ProfilerMiddleware;

/**
 * Setup middleware pipeline:
 * @param Application $app
 * @param MiddlewareFactory $factory
 * @param ContainerInterface $c
 */
return static function(Application $app, MiddlewareFactory $factory, ContainerInterface $c): void
{
    // The error handler should be the first (most outer) middleware
    // to catch all Exceptions.
    $app->pipe(ErrorHandler::class);
    $app->pipe(ServerUrlMiddleware::class);

    // Detect device type
    $app->pipe(MobileDetectMiddleware::class);

    // Pipe more middleware here that you want to execute on every request:
    // - bootstrapping
    // - pre-conditions
    // - modifications to outgoing responses
    //
    // Piped Middleware may be either callables or service names. Middleware may
    // also be passed as an array; each item in the array must resolve to
    // middleware eventually (i.e., callable or service name).
    //
    // Middleware can be attached to specific paths, allowing you to mix and match
    // applications under a common domain.  The handlers in each middleware
    // attached this way will see a URI with the matched path segment removed.
    //
    // i.e., path of "/api/member/profile" only passes "/member/profile" to $apiMiddleware
    // - $app->pipe('/api', $apiMiddleware);
    // - $app->pipe('/docs', $apiDocMiddleware);
    // - $app->pipe('/files', $filesMiddleware);

    // Application's starter kit of middleware bootstrapping
    // $app->pipe(ProfilerMiddleware::class);
    $app->pipe(SessionMiddleware::class);
    $app->pipe(BodyParamsMiddleware::class);

    // Register the routing middleware in the middleware pipeline.
    // This middleware registers the Zend\Expressive\Router\RouteResult request attribute.
    $app->pipe(RouteMiddleware::class);

    // The following handle routing failures for common conditions:
    // - HEAD request but no routes answer that method
    // - OPTIONS request but no routes answer that method
    // - method not allowed
    $app->pipe(ImplicitHeadMiddleware::class);
    $app->pipe(ImplicitOptionsMiddleware::class);
    $app->pipe(MethodNotAllowedMiddleware::class);

    // Seed the UrlHelper with the routing results:
    $app->pipe(UrlHelperMiddleware::class);

    // Add more middleware here that needs to introspect the routing results
    $app->pipe('/api/payment/create', PaymentMiddleware::class);
    $app->pipe('/login', ServicesRouterMiddleware::class);
    // $app->pipe('/cabinet', BasicAuthMiddleware::class);

    // Register the dispatch middleware in the middleware pipeline
    $app->pipe(DispatchMiddleware::class);

    // At this point, if no Response is returned by any middleware
    $app->pipe(NotFoundHandler::class);
};
