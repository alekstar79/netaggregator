<?php

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, Collection, Operation\FindOneAndUpdate };
use Throwable;

/**
* Class PMPaymentAcknowledgeHandler
* @package App\Handler
*/
class YKPaymentAcknowledgeHandler implements RequestHandlerInterface
{
    /** @var Collection */
    private Collection $payments;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->payments = $client->app->payments;
    }

    private function uid(array $params, array $socials): int
    {
        return (int) ($socials['vk'] ?? $params['uid'] ?? 0);
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $params = $request->getQueryParams();
        $body = $request->getParsedBody();
        $ret = (object) [];

        if (!$this->uid(array_merge($params, $body), $socials) || !isset($body['confirmation_token'])) {
            return new JsonResponse($ret);
        }

        try {

            if ($doc = $this->payments->findOneAndDelete(
                ['object.id' => substr($body['confirmation_token'], 3)],
                [
                    'returnDocument' => FindOneAndUpdate::RETURN_DOCUMENT_BEFORE,
                    'typeMap' => ['root' => 'array', 'document' => 'array']
                ]
            ))
            {
                $ret = $doc;
            }

        } catch (Throwable $e) {
        }

        return new JsonResponse($ret);
    }
}
