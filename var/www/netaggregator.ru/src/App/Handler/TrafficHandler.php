<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, Collection };

use Throwable;

/**
 * Class TrafficHandler
 * @package App\Handler
 */
class TrafficHandler implements RequestHandlerInterface
{
    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array'], 'projection' => ['_id' => 0]];

    /** @var Collection */
    private Collection $traffic;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->traffic = $client->app->traffic;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        try {

            $response = $this->traffic->find([], self::MAP)->toArray() ?: [];

        } catch(Throwable $e) {
            $response = ['error' => $e->getMessage()];
        }

        return new JsonResponse($response);
    }
}
