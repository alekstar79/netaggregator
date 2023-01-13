<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;
use Zend\Diactoros\Response;

use MongoDB\{ BSON\ObjectId, Client, Collection };

use App\Service\Dcover\ExtendsTrait as DcoverTrait;
use Manager\ExtendsTrait as ManagerTrait;

use RuntimeException;
use Throwable;

/**
 * Class ChatHandler
 * @package App\Handler
 * @property Collection dcover
 * @property Collection xcover
 */
class CoverHandler implements RequestHandlerInterface
{
    private const DEFAULT = ['first_name' => 'Вакантное', 'last_name' => 'место'];

    use ManagerTrait, DcoverTrait;

    private const

        STRUCT = '{"version":"3.6.6","objects":[],"height":265,"width":795,"scale":0.5}',
        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']];

    /** @var Collection */
    private Collection $xcover;

    /** @var string */
    private string $root;

    /** @var int */
    private int $userId;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->subscribe = $client->app->subscribe;
        $this->dcover = $client->app->dcover;
        $this->xcover = $client->app->xcover;

        $this->root = dirname(__DIR__, 3);
    }

    private function uid(array $params, array $socials): int
    {
        return (int) ($socials['vk'] ?? $params['uid'] ?? 0);
    }

    private function mapIdentifier(array $list): array
    {
        return array_map(static function($doc) {
            $doc['_id'] = new ObjectId($doc['_id']);
            return $doc;

        }, $list);
    }

    private function fetchData(): array
    {
        $ranges = (object) [];
        $list = [];

        try {

            $list = $this->xcover->find(['uid' => $this->userId], self::MAP)->toArray();
            $test = array_map(static fn($id) => $id->__toString(), array_column($list, '_id'));

            $ranges = (object) array_map(static function($ranges) use($test, $list) {
                foreach ($ranges as &$item) {
                    $idx = array_search($item['_id'], $test, true);

                    if ($idx !== false) {
                        $item = array_merge($list[$idx], $item);
                    }
                }

                return $ranges;

            }, array_column($this->dcover->find(
                ['_id' => ['$in' => array_merge(...array_column($list, 'connections'))]],
                self::MAP
            )->toArray(),
                'timerange',
                '_id'
            ));

        } catch (Throwable $e) {
        }

        return compact('list','ranges');
    }

    private function putFiles(string $dst): bool
    {
        $src = "$this->root/nuxt/static/dcover/default/struct.wxg";

        return file_put_contents("$dst/struct.json", self::STRUCT) && copy($src, "$dst/struct.wxg");
    }

    private function delete(array $params): ResponseInterface
    {
        $hash = $params['_id'];
        $remove = false;

        if (!$hash || !$uid = $this->userId) {
            return new JsonResponse(compact('remove'));
        }
        if ($this->rmdir("$this->root/nuxt/static/dcover/$uid/$hash")) {
            $remove = $this->xcover->deleteOne(['_id' => new ObjectId($hash)])->isAcknowledged();
        }
        if ($remove) {
            $remove = $hash;
        }

        return new JsonResponse(compact('remove'));
    }

    private function get(): ResponseInterface
    {
        return new JsonResponse($this->userId ? $this->fetchData() : ['list' => [], 'ranges' => (object)[]]);
    }

    private function put(array $body): ResponseInterface
    {
        $response = ['set' => false];

        if (!$uid = $this->userId) {
            return new JsonResponse($response);
        }

        try {

            switch (true) {
                case isset($body['list']):
                    $fn = static fn($c): bool => !empty($c['connections']);
                    $list = $this->mapIdentifier($body['list']);

                    if ($this->xcover->deleteMany(['uid' => $uid])->isAcknowledged()) {
                        $count = $this->xcover->insertMany($list)->getInsertedCount();
                        $response['set'] = count($list) === $count;

                        foreach (array_filter($list, $fn) as $c) {
                            $this->updateDcover($uid, $c);
                        }
                    }
                    break;

                case isset($body['doc']):
                    $hash = $this->saveToDb($uid, $body['doc'], $this->xcover);
                    $path = "$this->root/nuxt/static/dcover/$uid/$hash";
                    $exist = file_exists("$path/struct.wxg");

                    if (!$exist && !$this->mkdir($path)) {
                        throw new RuntimeException("Directory $path was not created");
                    }
                    if (!$exist && !$this->putFiles($path)) {
                        throw new RuntimeException('Data recording error');
                    }

                    $this->updateDcover($uid, $body['doc']);

                    $response['set'] = $hash;
                    break;
            }

        } catch (Throwable $e) {
            $response = ['error' => $e->getMessage()];
        }

        return new JsonResponse($response);
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];

        $params = $request->getQueryParams();
        $body = $request->getParsedBody();

        $this->userId = $this->uid(array_merge($params, $body), $socials);

        try {

            switch ($request->getMethod()) {
                case 'DELETE':
                    return $this->delete($params);
                case 'PUT':
                    return $this->put($body);
                case 'GET':
                    return $this->get();
            }

        } catch(Throwable $e) {
            return new JsonResponse(['error' => 'Internal Server Error']);
        }

        return new Response('php://memory', 400);
    }
}
