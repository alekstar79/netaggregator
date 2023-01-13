<?php declare(strict_types=1);

namespace App\Auxiliary\Auth;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

// use Zend\Expressive\Session\SessionInterface;
use League\OAuth2\Client\Token\AccessTokenInterface;

/**
* Interface AssistantInterface
* @package App\Auxiliary\UserAuth
*/
interface AssistantInterface
{
    public const USER_AUTH_PATH = '/login/vk';

    public function set(string $key, $val): void;

    public function get(string $key);

    public function clear(): Assistant;

    public function redirect(string $referer): ResponseInterface;

    public function verify(array $params): bool;

    public function rehab(?AccessTokenInterface $token): ResponseInterface;

    public function authorize(): ResponseInterface;

    public function setMark(int $uid = null): Assistant;

    public function handle(array $params): ResponseInterface;

    public function setCallback(KeeperInterface $keeper): void;

    public function setRequest(ServerRequestInterface $request): void;
}
