<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

use MongoDB\{ Client, Collection, BSON\Regex };
use Throwable;

/**
 * Class WeatherCitiesHandler
 * @package App\Handler
 */
class WeatherCitiesHandler implements RequestHandlerInterface
{
    private const MAP = ['typeMap' => ['root' => 'array', 'document' => 'array'], 'projection' => ['_id' => 0]];

    /** @var Collection */
    private Collection $weathermap;

    /** @noinspection PhpUndefinedFieldInspection */
    public function __construct(Client $mongo)
    {
        $this->weathermap = $mongo->app->weathermap;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $params = $request->getQueryParams();
        $list = [];

        try {

            $list = $this->weathermap->find(
                !empty($params['q']) ? ['name' => new Regex("^{$params['q']}", 'i')] : [],
                self::MAP
            )->toArray();

        } catch (Throwable $e) {
        }

        return new JsonResponse($list);
    }
}
