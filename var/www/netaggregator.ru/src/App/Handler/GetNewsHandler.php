<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, Collection };

use Throwable;

/**
 * Class GetNewsHandler
 * @package App\Handler
 */
class GetNewsHandler implements RequestHandlerInterface
{
    private const MAP = ['projection' => ['uid' => 0], 'typeMap' => ['root' => 'array','document' => 'array']];

    /** @var Collection */
    private Collection $store;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $mongo)
    {
        $this->store = $mongo->app->news;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $list = [];

        try {

            $list = $this->store->find([], self::MAP)->toArray();

        } catch (Throwable $e) {
        }

        return new JsonResponse(compact('list'));
    }
}
