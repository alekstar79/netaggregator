<?php

declare(strict_types=1);

use Zend\ConfigAggregator\ConfigAggregator;

return [
    ConfigAggregator::ENABLE_CACHE => true,

    // Enable/disable debugging
    'debug' => false,

    'zend-expressive' => [
        // Provide templates for the error handling middleware
        'error_handler' => [
            'template_error' => 'error::error',
            'template_404'   => 'error::404',
        ]
    ]
];
