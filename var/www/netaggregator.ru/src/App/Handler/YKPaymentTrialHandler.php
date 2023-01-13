<?php /** @noinspection PhpUndefinedFieldInspection */

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, UpdateResult };

use Throwable;

/**
* Class YKPaymentTrialsHandler
* @package App\Handler
*/
class YKPaymentTrialHandler implements RequestHandlerInterface
{
    private const

        FEATURES = ['chatbot', 'cover', 'stream', 'designer', 'widget'],
        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],

        // H72 = 259200,
        D7 = 604800;

    /** @var Client */
    private Client $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    private function uid(array $params, array $socials): int
    {
        return (int) ($socials['vk'] ?? $params['uid'] ?? 0);
    }

    private function make(array $doc, int $gid, int $exp): array
    {
        foreach (self::FEATURES as $feature) {
            $isArray = $feature !== 'stream' && $feature !== 'designer';

            if (!isset($doc[$feature])) {
                $doc[$feature] = $isArray ? [] : false;
            }
            if ($isArray) {
                $doc[$feature][$gid] = $exp;

            } else {
                $doc[$feature] = $exp;
            }
        }

        return array_merge($doc, ['trial' => true]);
    }

    private function updateTrial(int $uid, int $gid, bool $upsert = false): UpdateResult
    {
        if (!$doc = $this->client->app->subscribe->findOne(['uid' => $uid], [
            'typeMap' => ['root' => 'array', 'document' => 'array'],
        ])) {
            $doc = [];
        }

        $expiration = self::D7 + time();
        $set = $this->make($doc, $gid, $expiration);
        $set['uid'] = $uid;

        return $this->client->app->subscribe->updateOne(
            ['uid' => $uid],
            ['$set' => $set],
            ['upsert' => $upsert]
        );
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $params = $request->getQueryParams();
        $body = $request->getParsedBody();

        $ret = (object) ['confirmation' => false];
        $uid = $this->uid(array_merge($params, $body), $socials);
        $gid = $body['gid'];

        if (!$uid || !$gid) {
            return new JsonResponse($ret);
        }

        try {

            if ($doc = $this->client->app->subscribe->findOne(['uid' => $uid], self::MAP)) {
                $ret->confirmation = !isset($doc['trial']) && $this->updateTrial($uid, $gid)->isAcknowledged();

            } else if ($this->updateTrial($uid, $gid, true)->isAcknowledged()) {
                $ret->confirmation = true;
            }

        } catch (Throwable $e) {
        }

        return new JsonResponse($ret);
    }
}
