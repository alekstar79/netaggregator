<?php declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;

use Helpers\MobileDetect;

/**
* Class MobileDetectMiddleware
* @package App\Middleware
*/
class MobileDetectMiddleware implements MiddlewareInterface
{
    public const DEVICE_ID = 'device_id';

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return $handler->handle($request->withAttribute(self::DEVICE_ID, new MobileDetect()));
    }
}
