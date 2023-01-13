<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Throwable;
use Zend\Diactoros\Response\JsonResponse;

use App\VkApi\TransportInterface;

/**
 * Class WidgetUpdate
 * @package App\Handler
 */
class WidgetUpdate implements RequestHandlerInterface
{
    /** @var TransportInterface */
    private TransportInterface $http;

    public function __construct(TransportInterface $http)
    {
        $this->http = $http;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $body = $request->getParsedBody();
        $response = ['response' => 0];

        try {

            if (isset($body['access_token'], $body['type'], $body['code'])) {
                $response = $this->http->api('/appWidgets.update', $body, 'POST');
            }

        } catch (Throwable $e) {
        }

        return new JsonResponse($response);
    }
}
