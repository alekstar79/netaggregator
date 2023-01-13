<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ BSON\ObjectId, Client, Collection };

use App\Service\Dcover\ExtendsTrait;

use RuntimeException;
use Throwable;

/**
* Class TemplateTagslHandler
* @package App\Handler
*/
class TemplateTagsHandler implements RequestHandlerInterface
{
    use ExtendsTrait;

    /** @var Collection */
    private Collection $covers;

    /** @var string */
    private string $root;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->covers = $client->app->covers;
    }

    private function uid(array $params, array $socials): int
    {
        return (int) ($socials['vk'] ?? $params['uid'] ?? 0);
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $body = $request->getParsedBody();

        $ret = ['set' => false];

        try {

            if (!$this->uid($body, $socials)) {
                throw new RuntimeException('Authorization error');
            }

            $ret['set'] = $this->covers->updateOne(
                ['_id' => new ObjectId($body['hash'])],
                ['$set' => ['tags' => $body['tags']]]

            )->isAcknowledged();

            $ret['hash'] = $body['hash'];
            $ret['tags'] = $body['tags'];

        } catch (Throwable $e) {
            $ret = ['error' => $e->getMessage()];
        }

        return new JsonResponse($ret);
    }
}
