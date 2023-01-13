<?php

use Doctrine\DBAL\Migrations\Tools\Console\Command;

return [
    'dependencies' => [
        'factories' => [
            Console\Command\LoadFixtures::class => Console\Factories\LoadFixturesFactory::class,
            Console\Command\CacheClear::class => Console\Factories\CacheClearFactory::class,
            Command\DiffCommand::class => Console\Factories\DiffCommandFactory::class,
        ]
    ],
    'console' => [
        'commands' => [
            Console\Command\LoadFixtures::class,
            Console\Command\CacheClear::class,
            Command\ExecuteCommand::class,
            Command\GenerateCommand::class,
            Command\LatestCommand::class,
            Command\MigrateCommand::class,
            Command\DiffCommand::class,
            Command\UpToDateCommand::class,
            Command\StatusCommand::class,
            Command\VersionCommand::class
        ],
        'cachePaths' => [
            'doctrine' => 'data/cache/doctrine',
            'twig' => 'data/cache/twig'
        ]
    ]
];
