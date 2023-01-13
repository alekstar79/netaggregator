<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, Collection };

use Throwable;

/**
 * Class CurrencyHandler
 * @package App\Handler
 */
class CurrencyHandler implements RequestHandlerInterface
{
    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array'], 'projection' => ['_id' => 0]];

    /** @var Collection */
    private Collection $currency;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->currency = $client->app->currency;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        // $socials = $session->get('socials') ?: [];

        try {

            $response = $this->currency->findOne([], self::MAP) ?: [];

        } catch(Throwable $e) {
            $response = ['error' => $e->getMessage()];
        }

        return new JsonResponse($response);
    }
}
