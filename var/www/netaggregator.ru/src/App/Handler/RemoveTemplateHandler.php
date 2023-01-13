<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\BSON\ObjectId;
use MongoDB\Collection;
use MongoDB\Client;

use Throwable;

/**
 * Class RemoveTemplateHandler
 * @package App\Handler
 */
class RemoveTemplateHandler implements RequestHandlerInterface
{
    /** @var Collection */
    private Collection $store;

    public function __construct(Client $mongo)
    {
        /** @noinspection PhpUndefinedFieldInspection */
        $this->store = $mongo->app->templates;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $body = $request->getParsedBody();

        $remove = false;
        $_id = isset($body['_id'])
            ? new ObjectId($body['_id'])
            : null;

        try {

            if ($_id && ($socials['vk'] || $body['uid'])) {
                $remove = $this->store->deleteOne(compact('_id'))->isAcknowledged();
            }

        } catch (Throwable $e) {
        }

        return new JsonResponse(compact('remove'));
    }
}
