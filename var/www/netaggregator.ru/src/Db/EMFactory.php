<?php

declare(strict_types=1);

namespace Db;

use Psr\Container\ContainerInterface;

use ContainerInteropDoctrine\EntityManagerFactory;

// use Doctrine\DBAL\DBALException;
use Doctrine\ORM\EntityManager;
use Doctrine\DBAL\Types\Type;

use Exception;

/**
 * Class EntityManagerFactory
 * @package Db
 */
class EMFactory
{
    /**
     * @param ContainerInterface $c
     * @return EntityManager
     * @throws Exception
     */
    public function __invoke(ContainerInterface $c): EntityManager
    {
        /** @var EntityManager $em */
        $em = $c->get(EntityManagerFactory::class)($c);

        if (($types = $c->get('config')['db_custom_types'] ?? []) &&
            $pl = $em->getConnection()->getDatabasePlatform()) {

            foreach ($types as $type => $class) {
                Type::addType($type, $class);

                $pl->registerDoctrineTypeMapping(
                    sprintf('db_%s', $type),
                    $type
                );
            }
        }

        return $em;
    }
}
