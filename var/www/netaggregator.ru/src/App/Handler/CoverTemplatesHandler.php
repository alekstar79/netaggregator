<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ BSON\ObjectId, Client, Collection };

use App\Service\Dcover\ExtendsTrait;
use Helpers\TWriterUtility;

use RuntimeException;
use Throwable;

/**
 * Class CoverTemplatesHandler
 * @package App\Handler
 */
class CoverTemplatesHandler implements RequestHandlerInterface
{
    use TWriterUtility, ExtendsTrait;

    private const

        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']],
        PATHS = ['structs' => ['wxg','json'], 'template' => ['png']];

    /** @var string */
    private string $dir = 'nuxt/static/dcover/default';

    /** @var Collection */
    private Collection $covers;

    /** @var Collection */
    private Collection $xcover;

    /** @var string */
    private string $root;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->covers = $client->app->covers;
        $this->xcover = $client->app->xcover;

        $this->root = dirname(__DIR__, 3);
    }

    private function getDataStruct(int $uid, array $widgets = []): array
    {
        return [
            'uid' => $uid,
            'connections' => [],
            'widgets' => $widgets,
            'name' => time(),
            'timezone' => 'Europe/Moscow',
            'background' => true
        ];
    }

    private function dataTransfer(int $uid, string $src, string $dst): bool
    {
        $dstpath = "$this->root/nuxt/static/dcover/$uid/$dst";
        $filename = null;

        if (!$this->mkdir($dstpath)) {
            throw new RuntimeException("Directory '$dstpath' was not created");
        }

        foreach (self::PATHS as $subdir => $extensions) {
            foreach ($extensions as $ext) {
                $srcpath = "$this->root/$this->dir/$subdir/$src.$ext";

                switch ($subdir) {
                    case 'template':
                        $filename = 'template';
                        break;
                    case 'structs':
                        $filename = 'struct';
                        break;
                }

                if (!copy($srcpath, "$dstpath/$filename.$ext")) {
                    return false;
                }
            }
        }

        return true;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $params = $request->getQueryParams();

        if (isset($params['dummy_stub'])) {
            $socials['vk'] = 25520481;
        }

        $uid = $socials['vk'] ?? $params['uid'] ?? null;
        $find = [];

        try {

            if (isset($params['id'])) {
                $find['_id'] = new ObjectId($params['id']);
            }
            if (isset($find['_id']) && !$uid) {
                throw new RuntimeException('Authorization error');
            }

            $ret = $find
                ? $this->covers->findOne($find, self::MAP)
                : $this->covers->find([], self::MAP)->toArray();

            if (isset($find['_id']) && $ret) {
                $doc = $this->getDataStruct($uid, $ret['widgets']);

                $hash = $this->xcover->insertOne($doc)->getInsertedId()->__toString();
                $ret = [
                    'install' => $this->dataTransfer($uid, $params['id'], $hash),
                    'doc' => array_merge(compact('hash'), $doc)
                ];
            }

        } catch (Throwable $e) {
            $ret = ['error' => $e->getMessage(), 'install' => false];
        }

        return new JsonResponse(
            // $find ? $ret : array_map('strval', array_column($ret, '_id'))
            $ret
        );
    }
}
