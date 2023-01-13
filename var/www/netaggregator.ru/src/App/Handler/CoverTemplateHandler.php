<?php /** @noinspection PhpUndefinedFieldInspection */

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\StreamFactory;
use Zend\Diactoros\Response;

use RuntimeException;
use Throwable;

/**
 * Class CoverTemplateHandler
 * @package App\Handler
 *
 * Creating streams from strings in PHP
 * @see https://evertpot.com/222
 */
class CoverTemplateHandler extends StreamFactory implements RequestHandlerInterface
{
    // application/binary-json | text/plain
    private const HEADERS = ['Content-Type' => 'application/octet-stream'];

    /** @var string */
    private string $root;

    /** @var string */
    private string $dest;

    public function __construct()
    {
        $this->dest = 'nuxt/static/dcover/default/structs';

        $this->root = dirname(__DIR__, 3);
    }

    private function safeEncode(array $data): string
    {
        $ret = '{"status": "Internal Error"}';

        try {

            $ret = json_encode($data, JSON_THROW_ON_ERROR);

        } catch (Throwable $e) {
        }

        return $ret;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $params = $request->getQueryParams();
        $status = 200;

        try {

            if (!isset($params['hash'])) {
                throw new RuntimeException('Bad Request');
            }

            $stream = fopen("$this->root/$this->dest/{$params['hash']}.wxg", 'rb+');

        } catch (Throwable $e) {
            $stream = $this->createStream($this->safeEncode([
                'error' => $e->getMessage(),
                'hash' => $params['hash']
            ]));
        }

        return new Response($stream, $status, self::HEADERS);
    }
}
