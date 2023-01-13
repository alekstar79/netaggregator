<?php declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;

use Throwable;

/**
* Class BodyParamsMiddleware
* @package App\Middleware
*/
class BodyParamsMiddleware implements MiddlewareInterface
{
    private function getJson(ServerRequestInterface $request): ?string
    {
        $contentType = $request->getHeaderLine('Content-Type');
        $parts = explode(';', $contentType);
        $mime = trim(array_shift($parts));

        return preg_match('#[/+]json$#', $mime)
            ? $request->getBody()->getContents()
            : null;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $parsed = null;

        try {

            if ($raw = $this->getJson($request)) {
                $parsed = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
            }

        } catch (Throwable $e) {
        }

//        $time = time();
//        $server = $request->getServerParams();
//        $cookie = $request->getCookieParams();
//        $f = fopen(__DIR__ . "/test_{$time}.txt", 'wb');
//        fwrite($f, var_export(compact('server','cookie'), true));
//        fclose($f);

        return $handler->handle($parsed ? $request->withParsedBody($parsed) : $request);
    }
}
