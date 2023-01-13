<?php
/**
* @noinspection PhpFullyQualifiedNameUsageInspection
* @noinspection PhpDeprecationInspection
*/

declare(strict_types=1);

use Doctrine\Common\Persistence\Mapping\Driver\MappingDriverChain;
use Doctrine\ORM\Mapping\Driver\AnnotationDriver;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\DBAL\Driver;

use Db\PDOFactory;
use Db\EMFactory;

$PDO_OPTS = [
    PDO::ATTR_ERRMODE               => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE    => PDO::FETCH_ASSOC,
];

return [
    'dependencies' => [
        'factories' => [
            EntityManagerInterface::class => EMFactory::class,
            PDO::class => PDOFactory::class
        ]
    ],
    'doctrine' => [
        'connection' => [
            'orm_default' => [
                'driver_class' => Driver\PDOPgSql\Driver::class,
                'pdo' => PDO::class
            ],
        ],
        'configuration' => [
            'orm_default' => [
                'result_cache'      => 'filesystem',
                'metadata_cache'    => 'filesystem',
                'query_cache'       => 'filesystem',
                'hydration_cache'   => 'filesystem',

                /** @note Custom DQL functions */
                'string_functions'  => [
                    'ALL_OP' => \Opsway\Doctrine\ORM\Query\AST\Functions\All::class,
                    'ANY_OP' => \Opsway\Doctrine\ORM\Query\AST\Functions\Any::class,
                    'ARR' => \Opsway\Doctrine\ORM\Query\AST\Functions\Arr::class,
                    'ARR_APPEND' => \Opsway\Doctrine\ORM\Query\AST\Functions\ArrayAppend::class,
                    'ARR_CONTAINS' => \Opsway\Doctrine\ORM\Query\AST\Functions\ArrayContains::class,
                    'ARR_REPLACE' => \Opsway\Doctrine\ORM\Query\AST\Functions\ArrayReplace::class,
                    'ARR_REMOVE' => \Opsway\Doctrine\ORM\Query\AST\Functions\ArrayRemove::class,
                    'CONTAINED' => \Opsway\Doctrine\ORM\Query\AST\Functions\Contained::class,
                    'CONTAINS' => \Opsway\Doctrine\ORM\Query\AST\Functions\Contains::class,
                    'GET_JSON_FIELD' => \Opsway\Doctrine\ORM\Query\AST\Functions\GetJsonField::class,
                    'GET_JSON_FIELD_BY_KEY' => \Opsway\Doctrine\ORM\Query\AST\Functions\GetJsonFieldByKey::class,
                    'GET_JSON_OBJECT' => \Opsway\Doctrine\ORM\Query\AST\Functions\GetJsonObject::class,
                    'GET_JSON_OBJECT_TEXT' => \Opsway\Doctrine\ORM\Query\AST\Functions\GetJsonObjectText::class,
                    'JSON_AGG' => \Opsway\Doctrine\ORM\Query\AST\Functions\JsonAgg::class,
                    'JSON_ARRAY_LENGTH' => \Opsway\Doctrine\ORM\Query\AST\Functions\JsonArrayLength::class,
                    'JSONB_ARRAY_ELEM_TEXT' => \Opsway\Doctrine\ORM\Query\AST\Functions\JsonbArrayElementsText::class,
                    'REGEXP_REPLACE' => \Opsway\Doctrine\ORM\Query\AST\Functions\RegexpReplace::class,
                    'TO_TSQUERY' => \Opsway\Doctrine\ORM\Query\AST\Functions\ToTsquery::class,
                    'TO_TSVECTOR' => \Opsway\Doctrine\ORM\Query\AST\Functions\ToTsvector::class,
                    'TS_CONCAT_OP' => \Opsway\Doctrine\ORM\Query\AST\Functions\TsConcat::class,
                    'TS_MATCH_OP' => \Opsway\Doctrine\ORM\Query\AST\Functions\TsMatch::class,
                    'UNNEST' => \Opsway\Doctrine\ORM\Query\AST\Functions\Unnest::class
                ]
            ],
        ],
        'driver' => [
            'orm_default' => [
                'class' => MappingDriverChain::class,
                'drivers' => [
                    'App\Entity' => 'entities'
                ]
            ],
            'entities' => [
                'class' => AnnotationDriver::class,
                'paths' => ['src/App/Entity'],
                'cache' => 'array'
            ],
        ],
        'cache' => [
            'filesystem' => [
                'class' => \Doctrine\Common\Cache\FilesystemCache::class,
                'directory' => 'data/cache/doctrine'
            ]
        ]
    ],

    /** @note Custom Mapping Types */
    'db_custom_types' => [
        'bigint[]' => \Opsway\Doctrine\DBAL\Types\ArrayBigInt::class,
        'integer[]' => \Opsway\Doctrine\DBAL\Types\ArrayInt::class,
        'text[]' => \Opsway\Doctrine\DBAL\Types\ArrayText::class,
        'citext' => \Opsway\Doctrine\DBAL\Types\Citext::class,
        'inet' => \Opsway\Doctrine\DBAL\Types\Inet::class,
        'jsonb' => \Opsway\Doctrine\DBAL\Types\Jsonb::class,
        'tsquery' => \Opsway\Doctrine\DBAL\Types\TsQuery::class,
        'tsvector' => \Opsway\Doctrine\DBAL\Types\TsVector::class
    ],

    /** @note PostgeSQL data source name */
    'pdo_pgsql' => [
        'PDO_DSN' => 'pgsql:host=127.0.0.1;port=5432;dbname=app_db',
        'DB_USER' => 'alekstar79',
        'DB_PASS' => 'iPhone5s',
        'DB_OPTS' => $PDO_OPTS
    ]
];
