<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use App\Model\StreamRepositoryInterface;

/**
 * Class StatClearHandler
 * @package App\Handler
 */
class StatClearHandler implements RequestHandlerInterface
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

        $uid = (int) ($socials['vk'] ?: $body['uid']);

        return new JsonResponse(['clear' => $uid && $this->repo->clear($uid)]);
    }
}
