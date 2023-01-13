<?php

declare(strict_types=1);

namespace Db;

use Psr\Container\ContainerInterface;

use PDO;

/**
 * Class PDOFactory
 * @package Db
 */
class PDOFactory
{
    public function __invoke(ContainerInterface $c): PDO
    {
        $config = $c->get('config')['pdo_pgsql'];

        return new PDO(
            $config['PDO_DSN'],
            $config['DB_USER'],
            $config['DB_PASS'],
            $config['DB_OPTS']
        );
    }
}
