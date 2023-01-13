<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ BSON\ObjectId, Client, Collection };

use Helpers\TWriterUtility;

use RuntimeException;
use Throwable;

/**
 * Class CoverInstallHandler
 * @package App\Handler
 */
class CoverCopyHandler implements RequestHandlerInterface
{
    use TWriterUtility;

    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array'], 'projection' => ['_id' => 0]];

    /** @var Collection */
    private Collection $cover;

    /** @var string */
    private string $root;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->cover = $client->app->xcover;

        $this->root = dirname(__DIR__, 3);
    }

    private function uid(array $params, array $socials): int
    {
        return (int) ($socials['vk'] ?? $params['uid'] ?? 0);
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $body = $request->getParsedBody();

        $ret = ['copy' => true];
        $old = "$this->root/nuxt/static/dcover/{$socials['vk']}/{$body['_id']}";
        $new = null;

        try {

            if (!$uid = $this->uid($body, $socials)) {
                throw new RuntimeException('Authorization error');
            }
            if (!isset($body['_id'])) {
                throw new RuntimeException('Identifier is not provided');
            }
            if ($doc = $this->cover->findOne(['_id' => new ObjectId($body['_id'])], self::MAP)) {
                $doc['name'] = $body['name'];
                $doc['connections'] = [];

                $hash = $this->cover->insertOne($doc)->getInsertedId()->__toString();
                $new = "$this->root/nuxt/static/dcover/$uid/$hash";
                $ret['_id'] = $hash;
            }
            if (!$new || !$this->mkdir($new)) {
                throw new RuntimeException("Directory '$new' was not created");
            }
            if (!$this->copyFolder($old, $new)) {
                throw new RuntimeException('Data recording error');
            }

        } catch (Throwable $e) {
            $ret = ['error' => $e->getMessage(), 'copy' => false];
        }

        return new JsonResponse($ret);
    }
}
