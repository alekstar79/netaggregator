<?php declare(strict_types=1);

namespace App\Middleware;

use Psr\Container\ContainerInterface;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;

use YooKassa\Client;

/**
* Class PaymentMiddleware
* @package App\Middleware
* @TestPaymentCards https://yookassa.ru/developers/using-api/testing#test-bank-card-success
* 5555555555554477	Mastercard (с 3-D Secure)
* 5555555555554444	Mastercard
* 6759649826438453	Maestro
* 4793128161644804	Visa (с 3-D Secure)
* 4111111111111111	Visa
* 4175001000000017	Visa Electron
* 2200000000000004	Mir (с 3-D Secure)
* 2202474301322987	Mir
* 370000000000002	American Express
* 3528000700000000  JCB
* 36700102000000    Diners Club
*/
class PaymentMiddleware implements MiddlewareInterface
{
    public const

        PAYMENT_PROVIDER = 'payment_provider',

        SHOP_ID = 'shop_id',
        SECRET_KEY = 'secret_key',

        TEST_ID = 'test_id',
        TEST_KEY = 'test_key';

    /** @var ContainerInterface|null */
    public ?ContainerInterface $container = null;

    public function client(bool $owner = false): Client
    {
        $config = ($this->container->get('config')['payment'] ?? [])['yookassa'];

        return (new Client())->setAuth(
            $config[$owner ? self::TEST_ID : self::SHOP_ID],
            $config[$owner ? self::TEST_KEY : self::SECRET_KEY]
        );
    }

    public function __invoke(ContainerInterface $c): self
    {
        $this->container = $c;

        return $this;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return $handler->handle($request->withAttribute(self::PAYMENT_PROVIDER, [$this, 'client']));
    }
}
