<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

use MongoDB\Collection;
use MongoDB\Client;

/**
 * Class GroupTokensHandler
 * @package App\Handler
 */
class GroupTokensHandler implements RequestHandlerInterface
{
    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var Collection */
    private Collection $tokens;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $mongo)
    {
        $this->tokens = $mongo->app->gtokens;
    }

    private function converter(array $params): callable
    {
        $tokens = array_column(
            $this->tokens->find(
                [
                    'group_id' => ['$in' => array_column($params, 'id')],
                    'group_token' => ['$exists' => true, '$ne' => null]
                ],
                self::MAP
            )->toArray(),
            'group_token',
            'group_id'
        );

        return array_map(static function($t) use($tokens) {
            $t['token'] = $tokens[$t['id']] ?? null;
            return $t;
        }, $params);
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        return new JsonResponse($this->converter($request->getParsedBody()));
    }
}
