<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

// use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;
use stdClass;

use MongoDB\BSON\ObjectId;
use MongoDB\Collection;
use MongoDB\Client;

/**
 * Class MailingState
 * @package App\Handler
 */
class MailingState  implements RequestHandlerInterface
{
    private const MAP = ['projection' => ['subscribers' => 0], 'typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var Collection */
    private Collection $store;

    public function __construct(Client $mongo)
    {
        /** @noinspection PhpUndefinedFieldInspection */
        $this->store = $mongo->app->mailing;
    }

    private static function mockup(array $m = []): array
    {
        $mock = [
            'attachments' => [],
            'keyboard' => new stdClass,
            'progress' => false,
            'handled' => false,
            'excluded' => [],
            'filtered' => 0,
            'filters' => [],
            'shedule' => [],
            'count' => 0,
            'text' => ''
        ];

        foreach ($m as $k => $v) {
            if (isset($mock[$k])) {
                switch (gettype($mock[$k])) {
                    case 'object': $m[$k] = (object) $v; break;
                    case 'string': $m[$k] = (string) $v; break;
                    case 'boolean': $m[$k] = (bool) $v; break;
                    case 'integer': $m[$k] = (int) $v; break;
                    case 'array': $m[$k] = (array) $v;
                }
            }
        }

        return array_merge($mock, $m);
    }

    private function create(array $f, array $opt): ?string
    {
        $id = null;
        $r = $this->store->updateOne($f, [
            '$set' => self::mockup(['subscribers' => []])
        ], $opt);

        if ($r && $r->isAcknowledged()) {
            $id = $r->getUpsertedId();
        }

        return $id instanceof ObjectId
            ? $id->__toString()
            : $id;
    }

    private function getMailing(int $gid): array
    {
        $opt = ['upsert' => true];
        $f = compact('gid');

        if (!$m = $this->store->findOne($f, self::MAP)) {
            return array_merge(['_id' => $this->create($f, $opt)], self::mockup());
        }

        return self::mockup($m);
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        // $socials = $session->get('socials') ?: [];
        $body = $request->getParsedBody();

        $state = false;

        if (isset($body['gid']/*, $socials['vk'] */)) {
            $state = $this->getMailing((int) $body['gid']);
        }

        return new JsonResponse(compact('state'));
    }
}
