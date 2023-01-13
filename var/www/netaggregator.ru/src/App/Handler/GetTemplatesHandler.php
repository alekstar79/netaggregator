<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\Collection;
use MongoDB\Client;

use Throwable;

/**
 * Class GetTemplatesHandler
 * @package App\Handler
 */
class GetTemplatesHandler implements RequestHandlerInterface
{
    private const MAP = ['projection' => ['uid' => 0], 'typeMap' => ['root' => 'array','document' => 'array']];

    /** @var Collection */
    private Collection $store;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $mongo)
    {
        $this->store = $mongo->app->templates;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $body = $request->getParsedBody();

        $templates = [];

        try {

            if ($uid = $socials['vk'] ?? $body['uid'] ?? null) {
                $templates = $this->store->find(compact('uid'), self::MAP)->toArray();
            }

        } catch (Throwable $e) {
        }

        return new JsonResponse($templates);
    }
}
