<?php /** @noinspection PhpUndefinedFieldInspection */

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\StreamFactory;
use Zend\Diactoros\Response;

// use MongoDB\{BSON\ObjectId, Client, Collection};
// use GuzzleHttp\Psr7\MultipartStream;
// use Helpers\TJsonUtility;

use RuntimeException;
use Throwable;

/**
* Class CoverTemplatesHandler
* @package App\Handler
*
* Binary and bitwise operations in PHP
* @see https://habr.com/ru/company/mailru/blog/538052
*/
class CoverStructsHandler extends StreamFactory implements RequestHandlerInterface
{
    /* private const
        STRUCT = ["version" => "3.6.6", "objects" => [], "height" => 265, "width" => 795, "scale" => .5],
        MAP = ['typeMap' => ['root' => 'array', 'document' => 'array']]; */

    private string $root;

    public function __construct(/* Client $client */)
    {
        // $this->cover = $client->app->xcover;
        $this->root = dirname(__DIR__, 3);
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $params = $request->getQueryParams();

        $headers = ['Content-Type' => 'application/octet-stream'];
        $uid = $socials['vk'] ?? $params['uid'] ?? null;
        $hash = $params['hash'] ?? null;

        // $connections = '[]';

        try {

            if (!$hash || !$uid) { throw new RuntimeException('Bad Request'); }

            // $struct = $this->jsonRead("$this->root/nuxt/static/dcover/$uid/$hash/struct.json", self::STRUCT);
            // $struct = $this->createStreamFromResource($this->resource);

            $stream = fopen("$this->root/nuxt/static/dcover/$uid/$hash/struct.wxg", 'rb+');

            /* $raw = $this->cover->findOne(['_id' => new ObjectId($hash)], self::MAP);

            if ($raw && isset($raw['connections'])) {
                $connections = json_encode($raw['connections'], JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
            }

            $boundary = '----WebKitFormBoundary' . sha1(uniqid('', true));
            $headers = ['Content-Type' => "multipart/form-data; boundary=\"$boundary\""];

            $stream = new MultipartStream([[
                'contents' => $struct,
                'name' => 'struct',
                'headers' => [
                    'Content-Disposition' => 'form-data; name="struct"',
                    'Content-Type' => 'application/json'
                ]
            ],[
                'contents' => $connections,
                'name' => 'connections',
                'headers' => [
                    'Content-Disposition' => 'form-data; name="connections"',
                    'Content-Type' => 'application/json'
                ]

            ]], $boundary); */

        } catch (Throwable $e) {
            /** @noinspection JsonEncodingApiUsageInspection */
            $stream = $this->createStream(json_encode([
                'error' => $e->getMessage(),
                'hash' => $hash
            ]));
        }

        return new Response($stream, 200, $headers);
    }
}
