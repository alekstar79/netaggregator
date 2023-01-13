<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\ClientInterface;

/**
 * Class CorsOutwitHandler
 * @package App\Handler
 */
class CorsOutwitHandler implements RequestHandlerInterface
{
    /** @var ClientInterface */
    private ClientInterface $http;

    public function __construct(ClientInterface $guzzle)
    {
        $this->http = $guzzle;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // $params = $request->getParsedBody();
        $params = $request->getQueryParams();
        $error = 'Bad request';
        $status = 999;

        $method = $params['method'] ?? 'GET';
        $src = $params['src'] ?? null;

        try {

            if (is_string($src) && strpos($src, 'http') === 0) {
                return $this->http->request($method, $src);
            }

        } catch (GuzzleException $e) {
            $error = $e->getMessage();
            $status = $e->getCode();
        }

        return new JsonResponse(compact('error','status'));
    }
}
