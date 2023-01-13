<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

use App\VkApi\TransportInterface;

use InvalidArgumentException;
use Throwable;

/**
 * Class TransferServerHandler
 * @package App\Handler
 */
class TransferServerHandler implements RequestHandlerInterface
{
    /** @var TransportInterface */
    private TransportInterface $http;

    public function __construct(TransportInterface $http)
    {
        $this->http = $http;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $params = array_merge($request->getUploadedFiles(), $request->getParsedBody());
        $regexp = '/"hash":"(\w+)","image":"(\w+)"/';

        $transfer = false;

        /** @var string $url */
        $url = $params['upload_url'] ?? null;

        /** @var UploadedFileInterface $img */
        $img = $params['image'] ?? null;

        try {

            if (!$url || !$img || $img->getError()) {
                throw new InvalidArgumentException('Not enough data to make the transfer');
            }

            $response = $this->http->request('POST', $url, ['multipart' => [[
                'contents' => $img->getStream(),
                'name' => 'image'
            ]]]);

            if ($response && preg_match($regexp, $response, $m)) {
                $transfer = ['hash' => $m[1], 'image' => $m[2]];
            }

        } catch (Throwable $e) {
        }

        return new JsonResponse(compact('transfer'));
    }
}
