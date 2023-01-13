<?php /** @noinspection PhpUndefinedFieldInspection */

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

// use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\EmptyResponse;

use MongoDB\{ Client, Collection };

use Throwable;
use Error;

/**
* Class CoverTemplatesHandler
* @package App\Handler
*/
class CoverJsonHandler implements RequestHandlerInterface
{
    private Collection $cover;

    public function __construct(Client $client)
    {
        $this->cover = $client->app->dcover;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        // $socials = $session->get('socials') ?: [];

        $body = $request->getParsedBody();

        try {

            if (!isset($body['sid'], $body['text'])) {
                throw new Error('Invalid query');
            }
            if (!is_string($body['sid']) || !is_string($body['text']) || mb_strlen($body['text']) > 350) {
                throw new Error('Invalid data');
            }

            if (!$this->cover->findOneAndUpdate(
                ['json.sid' => ['$eq' => $body['sid']]],
                ['$set' => ['json.text' => $body['text'], 'changed' => true]],
                ['upsert' => false]
            ))
            {
                throw new Error('Doc not found');
            }

            return new EmptyResponse(200);

        } catch (Throwable $e) {
        }

        return new EmptyResponse(500);
    }
}
