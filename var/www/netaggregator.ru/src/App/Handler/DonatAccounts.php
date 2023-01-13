<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Zend\Diactoros\Response\JsonResponse;

/**
 * Class DonatAccounts
 * @package App\Handler
 */
class DonatAccounts implements RequestHandlerInterface
{
    public function __construct()
    {
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        return new JsonResponse([
            // [ 'type' => 'mobile', 'value' => '79272724417', 'title' => 'Счёт мобильного телефона', 'icon' => 'payouts__icon-mobile' ],
            // [ 'type' => 'card', 'value' => '4277655001111222', 'title' => 'Банковская карта', 'icon' => 'payouts__icon-card' ],
            // [ 'type' => 'yandex', 'value' => '410011122233', 'title' => 'Яндекс.Деньги', 'icon' => 'payouts__icon-yandex' ],
            // [ 'type' => 'qiwi', 'value' => '79272724417', 'title' => 'QIWI кошелек', 'icon' => 'payouts__icon-qiwi' ],
            // [ 'type' => 'webmoney', 'value' => 'R11122233344', 'title' => 'Webmoney', 'icon' => 'payouts__icon-webmoney' ]
        ]);
    }
}
