<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use App\Model\StreamRepositoryInterface;

/**
 * Class SetQueryHandler
 * @package App\Handler
 */
class SetQueryHandler implements RequestHandlerInterface
{
    /** @var StreamRepositoryInterface */
    private StreamRepositoryInterface $repo;

    public function __construct(StreamRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    private function checkCredentials(array $socials, array $body): bool
    {
        return isset($socials['vk']) && array_key_exists('query', $body);
    }

    private function getQuery(int $uid): array
    {
        return $this->repo->findByUserId($uid)['query'] ?? [];
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $body = $request->getParsedBody();

        $set = false;
        $query = [];

        if ($this->checkCredentials($socials, $body)) {
            $uid = (int) $socials['vk'];
            $query = $body['query'];

            $set = $this->repo->update($uid, compact('query'));
            $query = $this->getQuery($uid);
        }

        return new JsonResponse(compact('query','set'));
    }
}
