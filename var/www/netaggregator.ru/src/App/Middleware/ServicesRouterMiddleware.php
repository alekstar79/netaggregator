<?php declare(strict_types=1);

namespace App\Middleware;

use Psr\Container\ContainerInterface;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;

use App\Generic\FbAuthGenericFactory;
use App\Generic\OkAuthGenericFactory;
use App\Generic\VkAuthGenericFactory;

use App\Model\VkTokensRepository;
use App\Model\FbTokensRepository;
use App\Model\OkTokensRepository;

use RuntimeException;

/**
* Class ServicesRouterMiddleware
* @package App\Middleware
*/
class ServicesRouterMiddleware implements MiddlewareInterface
{
    public const

        AUTH_PROVIDER = 'auth_provider',
        REPOSITORY = 'token_repository',

        VK = 'vk',
        FB = 'fb',
        OK = 'ok';

    /** @var ContainerInterface */
    private ContainerInterface $container;

    /** @var array */
    private array $repository;

    /** @var array */
    private array $services;

    public function __invoke(ContainerInterface $c): self
    {
        $this->container = $c;

        $this->services = [
            self::VK => VkAuthGenericFactory::class,
            self::FB => FbAuthGenericFactory::class,
            self::OK => OkAuthGenericFactory::class
        ];

        $this->repository = [
            self::VK => VkTokensRepository::class,
            self::FB => FbTokensRepository::class,
            self::OK => OkTokensRepository::class
        ];

        return $this;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if (!$id = $request->getAttribute('srv')) {
            throw new RuntimeException('Service id required', 404);
        }
        if (!isset($this->repository[$id], $this->services[$id])) {
            throw new RuntimeException('Service missing', 500);
        }

        $repository = $this->container->get($this->repository[$id]);
        $provider = $this->container->get($this->services[$id]);

        return $handler->handle(
            $request->withAttribute(self::AUTH_PROVIDER, $provider)
                ->withAttribute(self::REPOSITORY, $repository)
        );
    }
}
