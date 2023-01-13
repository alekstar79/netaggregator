<?php declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

/**
* Class ProfilerMiddleware
* @package App\Middleware
*/
class ProfilerMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $start = microtime(true);

        return $handler->handle($request)->withHeader('X-Profiler-Time', microtime(true) - $start);
    }
}
