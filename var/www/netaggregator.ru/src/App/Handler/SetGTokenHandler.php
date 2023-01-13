<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

use MongoDB\Collection;
use MongoDB\Client;

use App\Service\Groups\CallbackApiTunerInterface;

/**
 * Class SetGTokensHandler
 * @package App\Handler
 */
class SetGTokenHandler implements RequestHandlerInterface
{
    private const SETTINGS = [
        'api_version' => 5.131,
        'message_new' => 1,
        'message_allow' => 1,
        'like_add' => 1,
        'like_remove' => 1,
        'wall_reply_new' => 1,
        'wall_reply_delete' => 1,
        'wall_repost' => 1,
        'group_join' => 1,
        'group_leave' => 1
    ];

    /** @var CallbackApiTunerInterface */
    private CallbackApiTunerInterface $server;

    /** @var Collection */
    private Collection $tokens;

    public function __construct(Client $mongo, CallbackApiTunerInterface $server)
    {
        /** @noinspection PhpUndefinedFieldInspection */
        $this->tokens = $mongo->app->gtokens;
        $this->server = $server;
    }

    private function configure(int $gid, string $token): bool
    {
        $this->server->setToken($token);

        $server = $this->server->configure($gid, self::SETTINGS);
        $status = $this->server->status($gid, $server['id']);

        return $status === 'ok';
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $params = $request->getParsedBody();

        $token = $params['group_token'] ?? $params['groupToken'] ?? null;
        $gid = $params['group_id'] ?? $params['groupId'] ?? null;
        $uid = $params['user_id'] ?? $params['userId'] ?? null;

        $set = false;
        $ret = null;

        if ($token && $gid && $uid) {
            $ret = $this->tokens->updateOne(
                ['group_id' => $gid],
                ['$set' => ['user_id' => $uid, 'group_id' => $gid, 'group_token' => $token]],
                ['upsert' => true]
            );
        }
        if ($ret && $ret->isAcknowledged()) {
            $set = $this->configure($gid, $token);
        }

        return new JsonResponse(compact('set','token','gid','uid'));
    }
}
