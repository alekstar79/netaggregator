<?php /** @noinspection PhpUndefinedMethodInspection */

declare(strict_types=1);

namespace AppTest\Handler;

use Psr\Http\Message\ServerRequestInterface;

use Zend\Diactoros\Response\JsonResponse;
use PHPUnit\Framework\TestCase;
use Throwable;

use App\Handler\PingHandler;

/**
 * Class PingHandlerTest
 * @package AppTest\Handler
 */
class PingHandlerTest extends TestCase
{
    public function testResponse(): void
    {
        $ping = new PingHandler();
        /** @noinspection PhpParamsInspection */
        $response = $ping->handle($this->prophesize(ServerRequestInterface::class)->reveal());

        try {

            $json = json_decode((string)$response->getBody(), false, 512, JSON_THROW_ON_ERROR);

        } catch (Throwable $e) {
        }

        self::assertInstanceOf(JsonResponse::class, $response);
        self::assertTrue(isset($json->ack));
    }
}
