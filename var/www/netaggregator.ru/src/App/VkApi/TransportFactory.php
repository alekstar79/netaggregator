<?php declare(strict_types=1);

namespace App\VkApi;

// use Psr\Http\Message\RequestInterface;

use GuzzleHttp\Client as GuzzleClient;
use Rucaptcha\Client as Captcha;

use GuzzleHttp\HandlerStack;
// use GuzzleHttp\Middleware;

/**
* Class TransportFactory
* @package App\VkApi
*/
class TransportFactory
{
    public const CAPTCHA_CLIENT_KEY = 'c1219e480ffc613052ff399becb12756';

    public function __invoke(): TransportInterface
    {
        return self::create();
    }

    public static function create(string $token = null): TransportInterface
    {
        // https://askdev.ru/q/kak-poluchit-telo-otpravlennyh-dannyh-s-pomoschyu-guzzle-php-343580
        $stack = HandlerStack::create();

        /* $stack->push(Middleware::mapRequest(function(RequestInterface $request) {
            $contentsRequest = (string) $request->getBody();
            var_dump($contentsRequest);

            return $request;
        })); */

        return new Transport(
            new GuzzleClient(['handler' => $stack]),
            new Captcha(self::CAPTCHA_CLIENT_KEY),
            $token
        );
    }
}
