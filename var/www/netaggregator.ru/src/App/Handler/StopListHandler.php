<?php

/**
* @noinspection UnknownInspectionInspection
* @noinspection PhpUnused
*/

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use App\Model\StreamRepositoryInterface;

/**
 * Class StopListHandler
 * @package App\Handler
 */
class StopListHandler implements RequestHandlerInterface
{
    /** @var StreamRepositoryInterface */
    private StreamRepositoryInterface $repo;

    public function __construct(StreamRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $body = $request->getParsedBody();
        $set = false;

        if (!isset($socials['vk'], $body['stop'])) {
            return new JsonResponse(compact('set'));
        }

        $stop = $body['stop'];
        $uid = $socials['vk'];

        $set = $this->repo->update($uid, compact('stop'));

        return new JsonResponse(compact('stop', 'set'));
    }
}
