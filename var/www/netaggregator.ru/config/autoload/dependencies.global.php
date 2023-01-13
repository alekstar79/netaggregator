<?php

declare(strict_types=1);

use Zend\ServiceManager\AbstractFactory;
use Zend\Expressive\Session;

return [
    'dependencies' => [
        'abstract_factories' => [AbstractFactory\ReflectionBasedAbstractFactory::class],

        // Use 'aliases' to alias a service name to another service
        'aliases' => [
            App\Service\Groups\CallbackApiTunerInterface::class => App\Service\Groups\CallbackApiTuner::class,
            App\Service\Chat\RecipientsBuilderInterface::class => App\Service\Chat\RecipientsBuilder::class,
            App\Service\Stream\HttpClientInterface::class => App\Service\Stream\HttpClient::class,

            App\Auxiliary\Auth\AssistantInterface::class => App\Auxiliary\Auth\Assistant::class,
            App\Auxiliary\Auth\KeeperInterface::class => App\Auxiliary\Auth\UserKeeper::class,

            App\Model\TokensRepositoryInterface::class => App\Model\VkTokensRepository::class,
            App\Model\StreamRepositoryInterface::class => App\Model\StreamRepository::class
        ],

        // Use 'invokables' for constructor-less services, or services that do not require arguments to the constructor
        'invokables' => [
            GuzzleHttp\ClientInterface::class => GuzzleHttp\Client::class
            // Predis\ClientInterface::class => Predis\Client::class
        ],

        // Use 'factories' for services provided by callbacks/factory classes
        'factories' => [
            Monolog\Logger::class => App\Factories\LoggerFactory::class,
            Session\SessionPersistenceInterface::class => App\Session\SessionPersistenceFactory::class,
            App\Middleware\ServicesRouterMiddleware::class => App\Middleware\ServicesRouterMiddleware::class,

            App\Service\Birthday\BirthdaysCollectorInterface::class => App\Service\Birthday\BirthdaysCollectorFactory::class,
            App\Service\Groups\VkGroupAuthProvider::class => App\Service\Groups\VkGroupAuthProviderFactory::class,
            App\Service\Weather\ReceiverInterface::class => App\Service\Weather\ReceiverFactory::class,
            App\Service\Info\InformerInterface::class => App\Service\Info\InformerFactory::class,
            App\Service\Rss\PieClientInterface::class => App\Service\Rss\PieClientFactory::class,

            App\Auxiliary\Auth\UserKeeper::class => App\Auxiliary\Auth\UserKeeperFactory::class,

            App\VkApi\TransportInterface::class => App\VkApi\TransportFactory::class,
            App\VkApi\APIClientInterface::class => App\VkApi\APIClientFactory::class
        ]
    ],
    'session' => [
        'domain' => 'netaggregator.ru',
        'name'   => 'NetXBot'
    ]

    /* 'templates' => [
        'cache_dir' => 'data/cache/twig',
        'paths' => [
            'layout' => ['templates/layout'],
            'share'  => ['templates/share'],
            'error'  => ['templates/error'],
            'mail'   => ['templates/mail'],
            'app'    => ['templates/app'],
        ]
    ], */
];
