<?php

declare(strict_types=1);

// use Psr\Container\ContainerInterface;

return [
    'mongo' => ['DSN' => 'mongodb://127.0.0.1:27017'],

    'dependencies' => [
        /**
        * Do not apply factory functions in the zend configuration file,
        * that will explode with exception - Call to undefined method Closure::__set_state()
        * @see https://github.com/zendframework/zend-config-aggregator/issues/17
        */
        /* 'factories' => [
            \MongoDB\Client::class => static function(ContainerInterface $c) {
                return new MongoDB\Client($c->get('config')['mongo']['DSN']);
            }
        ] */
    ]
];
