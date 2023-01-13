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
 * Class SaveTemplateHandler
 * @package App\Handler
 */
class SaveTemplateHandler implements RequestHandlerInterface
{
    private const MAP = ['typeMap' => ['root' => 'array','document' => 'array']];

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

        $template = $body['template'] ?? [];
        $save = false;

        if ($template && ($uid = $socials['vk'] ?? $body['uid'] ?? null)) {
            $template['_id'] = new ObjectId($template['_id']);
            $template['uid'] = $uid;
            $f = compact('uid');

            try {

                $templates = $this->store->find($f, self::MAP)->toArray();
                $templates[] = $template;

                $this->store->deleteMany($f);
                $ret = $this->store->insertMany($templates);

                $save = count($templates) === $ret->getInsertedCount();

            } catch (Throwable $e) {
            }
        }

        return new JsonResponse(compact('save'));
    }
}
