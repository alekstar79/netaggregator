<?php declare(strict_types=1);

namespace App\Auxiliary\Auth;

use Psr\Container\ContainerInterface;

use App\VkApi\TransportInterface;

/**
* Class UserKeeperFactory
* @package App\Auxiliary\Auth
*/
class UserKeeperFactory
{
    public function __invoke(ContainerInterface $c): UserKeeper
    {
        $socials = $c->get('config')['socials'];

        return new UserKeeper(
            $c->get(TransportInterface::class),
            $socials['ok'] ?? []
        );
    }
}
