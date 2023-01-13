<?php

/**
* @noinspection PhpUnused
* @noinspection UnknownInspectionInspection
*/

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

/**
 * Class PingHandler
 * @package App\Handler
 */
class PingHandler implements RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        return new JsonResponse(['ack' => true]);
    }
}
