<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\EmptyResponse;

// use Throwable;

/**
 * Class CovidUpdate
 * @see https://documenter.getpostman.com/view/10808728/SzS8rjbc#43e467ac-2cb0-4409-84e8-e18794e47271
 * @package App\Handler
 */
class CovidUpdate implements RequestHandlerInterface
{
    public function __construct()
    {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        /* $params = $request->getQueryParams();
        $body = $request->getParsedBody();
        $time = time();

        try {

            file_put_contents(__DIR__ . "/covid_params_$time.json", json_encode($params, JSON_THROW_ON_ERROR));
            file_put_contents(__DIR__ . "/covid_body_$time.json", json_encode($body, JSON_THROW_ON_ERROR));

        } catch (Throwable $e) {
        } */

        return new EmptyResponse(200);
    }
}
