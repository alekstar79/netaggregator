<?php declare(strict_types=1);

namespace App\Middleware;

use Psr\Container\ContainerInterface;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;

use Zend\Diactoros\Response;

/**
* Class BasicAuthActionDecorator
* @package App\Middleware
*/
class BasicAuthMiddleware implements MiddlewareInterface
{
    public const

        RESTRICTED = ['WWW-Authenticate' => 'Basic realm=Restricted'],
        ATTRIBUTE = '_user';

    /** @var array */
    private array $users;

    public function __invoke(ContainerInterface $c): BasicAuthMiddleware
    {
        $this->users = $c->get('config')['basic_auth']['users'];

        return $this;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $user = $request->getServerParams()['PHP_AUTH_USER'] ?? null;
        $pass = $request->getServerParams()['PHP_AUTH_PW'] ?? null;

        if ($user && $pass) {
            foreach ($this->users as $name => $password) {
                if ($user === $name && $pass === $password) {
                    return $handler->handle($request->withAttribute(self::ATTRIBUTE, $name));
                }
            }
        }

        return new Response('php://memory', 401, self::RESTRICTED);
    }
}
