<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, Collection };

use Throwable;

/**
 * Class ChatHandler
 * @package App\Handler
 */
class ChatHandler implements RequestHandlerInterface
{
    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var Collection */
    private Collection $chat;

    private array $mock = [
        'attachments' => 'array',
        'keyboard' => 'object',
        'children' => 'array',
        'keywords' => 'array',
        'global' => 'boolean',
        'random' => 'boolean',
        'exact' => 'boolean',
        'on' => 'boolean',
        'reply' => 'array',
        'use' => 'integer'
    ];

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->chat = $client->app->chat;
    }

    private function uid(array $params, array $socials): int
    {
        return (int) ($socials['vk'] ?? $params['uid'] ?? 0);
    }

    private function mockup(array $m = []): array
    {
        foreach ($m as $k => $v) {
            if (isset($this->mock[$k])) {
                switch ($this->mock[$k]) {
                    case 'object': $m[$k] = (object) $v; break;
                    case 'string': $m[$k] = (string) $v; break;
                    case 'boolean': $m[$k] = (bool) $v; break;
                    case 'integer': $m[$k] = (int) $v; break;
                    case 'array': $m[$k] = (array) $v;
                }
            }
        }

        return $m;
    }

    private function adduction(array $list): array
    {
        if (isset($list['reply'])) {
            $list['reply'] = array_map([$this, 'adduction'], $list['reply']);
        }
        if (isset($list['children'])) {
            $list['children'] = array_map([$this, 'adduction'], $list['children']);
        }
        if (isset($list['dialogs'])) {
            $list['dialogs'] = array_map([$this, 'adduction'], $list['dialogs']);
        }

        return $this->mockup($list);
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $params = $request->getQueryParams();
        $body = $request->getParsedBody();

        $uid = $this->uid(array_merge($params, $body), $socials);
        $response = ['set' => false];

        try {

            switch ($request->getMethod()) {
                case 'GET':
                    $response = [
                        'list' => array_map([$this, 'adduction'], $uid
                            ? $this->chat->find(compact('uid'), self::MAP)->toArray()
                            : [])
                    ];
                    break;

                case 'POST':
                    $list = array_map([$this, 'adduction'], $body['list']);

                    $this->chat->deleteMany(['uid' => $uid]);

                    if ($list) {
                        $ret = $this->chat->insertMany($list);
                        $set = count($list) === $ret->getInsertedCount();
                    } else {
                        $set = true;
                    }

                    $response = compact('set');
            }

        } catch(Throwable $e) {
            $response = ['error' => $e->getMessage()];
        }

        return new JsonResponse($response);
    }
}
