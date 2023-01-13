<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use App\Service\Groups\AdmGroupsDetermine;

use MongoDB\Collection;
use MongoDB\Client;

/**
 * Class VkCoverGetGroupsHandler
 * @package App\Handler
 */
class GetGroupsHandler implements RequestHandlerInterface
{
    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var AdmGroupsDetermine */
    private AdmGroupsDetermine $groups;

    /** @var Collection */
    private Collection $tokens;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(AdmGroupsDetermine $groups, Client $mongo)
    {
        $this->tokens = $mongo->app->gtokens;
        $this->groups = $groups;
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

        return static function($t) use($tokens) {
            $t['token'] = $tokens[$t['id']] ?? null;
            return $t;
        };
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $params = $request->getQueryParams();
        $body = $request->getParsedBody();

        $response = ['items' => []];

        if ($uid = $socials['vk'] ?? $params['uid'] ?? $body['uid'] ?? null) {
            $response = $this->groups->get((int) $uid);
        }
        if (count($response['items'])) {
            $response['items'] = array_map(
                $this->converter($response['items']),
                $response['items']
            );
        }

        return new JsonResponse(compact('response'));
    }
}
