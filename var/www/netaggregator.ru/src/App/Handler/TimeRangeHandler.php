<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Expressive\Session\SessionMiddleware;
use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, Collection };

use Throwable;

/**
 * Class TimeRangeHandler
 * @package App\Handler
 */
class TimeRangeHandler implements RequestHandlerInterface
{
    /** @var Collection */
    private Collection $dcover;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $client)
    {
        $this->dcover = $client->app->dcover;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $session = $request->getAttribute(SessionMiddleware::SESSION_ATTRIBUTE);
        $socials = $session->get('socials') ?: [];
        $body = $request->getParsedBody();

        $ret = ['set' => true];
        $gid = $body['gid'];

        try {

            if (isset($socials['vk'], $body['covers'])) {
                $action = count($body['covers']) ? '$set' : '$unset';

                $ret['set'] = $this->dcover->updateOne(
                    ['_id' => $gid],
                    [$action => ['timerange' => $body['covers']]]
                )->isAcknowledged();
            }

        } catch (Throwable $e) {
            $ret['error'] = $e->getMessage();
            $ret['set'] = false;
        }

        return new JsonResponse($ret);
    }
}
