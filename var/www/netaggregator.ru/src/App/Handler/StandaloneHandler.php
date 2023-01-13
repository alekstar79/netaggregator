<?php declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Container\ContainerInterface;

use Zend\Diactoros\Response\RedirectResponse;

/**
 * Class StandaloneHandler
 * @package App\Handler
 */
class StandaloneHandler implements RequestHandlerInterface
{
    /** @var array */
    private array $config;

    public function __invoke(ContainerInterface $c): StandaloneHandler
    {
        $this->config = $c->get('config')['socials']['vk-std'];

        return $this;
    }

    private function encode(array $data): string
    {
        return http_build_query($data, '', '&', PHP_QUERY_RFC3986);
    }

    /**
     * @param array|string $scope
     * @return string
     */
    private function query($scope = []): string
    {
        if (is_array($scope)) {
            $scope = implode(',', $scope);
        }

        $redirect_uri = $this->config['redirect_uri'];
        $client_id = $this->config['client_id'];
        $response_type = 'token';

        return $this->encode(compact('client_id','scope','response_type','redirect_uri'));
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $scope = $request->getQueryParams()['scope'] ?? $this->config['scope'];

        $oauth = $this->config['oauth_url'];
        $query = $this->query($scope);

        return new RedirectResponse($oauth . '/authorize?' . $query);
    }
}
