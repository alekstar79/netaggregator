<?php declare(strict_types=1);

namespace App\Model;

use Psr\Container\ContainerInterface;

use Doctrine\ORM\EntityManagerInterface;

/**
* Class StreamRepositoryFactory
* @package App\Model
*/
class StreamRepositoryFactory
{
    public function __invoke(ContainerInterface $c): StreamRepositoryInterface
    {
        return self::create(
            $c->get(EntityManagerInterface::class),
            $c->get('config')['pdo_pgsql']
        );
    }

    public static function create(EntityManagerInterface $em, array $config): StreamRepositoryInterface
    {
        $password = $config['DB_PASS'];
        $user = $config['DB_USER'];

        $dsn = str_replace(['pgsql:',';'], ['','&'], $config['PDO_DSN']);
        parse_str($dsn, $dsn);

        return new _StreamRepository(
            $em,
            PgSQL::init(array_merge($dsn, compact('user','password')))
        );
    }
}
