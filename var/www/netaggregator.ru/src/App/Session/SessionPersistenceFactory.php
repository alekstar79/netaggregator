<?php declare(strict_types=1);

namespace App\Session;

use Psr\Container\ContainerInterface;

/**
* Class SessionPersistenceFactory
* @package App\Session
*/
class SessionPersistenceFactory
{
    public function __invoke(ContainerInterface $c): SessionPersistence
    {
        $session = $c->get('config')['session'];

        return new SessionPersistence(
            $session['name']
            // $session['domain']
        );
    }
}
